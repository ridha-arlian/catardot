import { SignJWT } from 'jose'
import NextAuth from 'next-auth'
import { prisma } from '@/prisma'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    refreshToken?: string
    supabaseAccessToken?: string
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      spreadsheetId?: string | null
    }
  }

  interface User { spreadsheetId?: string | null }

  interface JWT {
    userId?: string
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    spreadsheetId?: string | null
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  pages: { signIn: '/' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Google({
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive',
        }
      }
    })
  ],
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      }
    }
  },
  callbacks: {
    async signIn() { return true },
    async jwt({ token, account, user }) {
      if (user) {
        token.userId = user.id
        token.spreadsheetId = (user as any).spreadsheetId ?? null
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
            ...(account?.refresh_token ? { refresh_token: account?.refresh_token } : {}),
          }
        })
      }
      return token
    },
    async session({ session, token }) {
      const signingSecret = process.env.SUPABASE_JWT_SECRET
      if (signingSecret) {
        const payload = {
          aud: 'authenticated',
          exp: Math.floor(new Date(session.expires).getTime() / 1000),
          sub: (token.userId as string) ?? '',
          email: session.user?.email,
          role: 'authenticated',
        }

        session.supabaseAccessToken = await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime(payload.exp).sign(new TextEncoder().encode(signingSecret))
      }

      session.user = {
        ...session.user,
        id: token.userId as string,
        spreadsheetId: (token.spreadsheetId as string | null) ?? '',
      }

      session.accessToken = token.accessToken as string | undefined
      session.refreshToken = token.refreshToken as string | undefined

      return session
    }
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
})
