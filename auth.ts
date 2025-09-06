import jwt from "jsonwebtoken"
import NextAuth from "next-auth"
import { prisma } from "@/prisma"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { getGoogleAccountByEmail } from "@/features/auth/user-auth-session-model.server"
import { isAccessTokenExpired, refreshAndUpdateAccessToken } from "@/features/auth/authentication-helpers-server"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
    supabaseAccessToken?: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  pages: { signIn: "/" },
  session: {
    strategy: "database", // Karena Anda pakai PrismaAdapter
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive",
        }
      }
    })
  ],
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? `__Secure-next-auth.session-token` 
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 hari
      }
    }
  },
  callbacks: {
    async signIn() { return true },
    async jwt({ token, account, user }) {
      if (user) {
        token.userId = user.id
      }
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : 0
      
        await prisma.account.updateMany({
          where: { providerAccountId: account?.providerAccountId },
          data: {
            access_token: account?.access_token,
            expires_at: account?.expires_at,
            ...(account?.refresh_token ? { refresh_token: account?.refresh_token } : {})
          }
        })
      }

      return token
    },
    async session({ session, user }) {
      console.log("Session callback - user: ", user)
      console.log("Session callback - session.user.email: ", session.user.email)
      
      const signingSecret = process.env.SUPABASE_JWT_SECRET
      if (signingSecret) {
        const payload = {
          aud: "authenticated",
          exp: Math.floor(new Date(session.expires).getTime() / 1000),
          sub: user.id,
          email: user.email,
          role: "authenticated",
        }
        session.supabaseAccessToken = jwt.sign(payload, signingSecret)
      }

      const account = await getGoogleAccountByEmail(session.user.email ?? "")
      
      if (!account) {
        session.user = {
          ...session.user,
          id: user.id,
          spreadsheetId: user.spreadsheetId || "",
        }
        
        return session
      }

      const accessToken = isAccessTokenExpired(account.expires_at) ? await refreshAndUpdateAccessToken(account) : account.access_token

      session.user = {
        ...session.user,
        id: user.id,
        spreadsheetId: user.spreadsheetId || "",
      }

      session.accessToken = accessToken ?? undefined
      return session
    }
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
})