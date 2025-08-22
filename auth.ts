import { prisma } from "@/prisma"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { isAccessTokenExpired, refreshAndUpdateAccessToken } from "@/features/auth/authentication-helpers-server";
import { getGoogleAccountByEmail } from "@/features/auth/user-auth-session-model.server";
// import { getOrCreateSpreadsheet } from "./src/features/journal/get-spreadsheet.server"
// import { getGoogleAccountByEmail } from "@/features/auth/user-auth-session-model.server"
// import { isAccessTokenExpired, refreshAndUpdateAccessToken, setSessionAccessToken } from "@/features/auth/authentication-helpers-server"

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // session: {
  //   strategy: 'jwt'
  // },
  pages: {
    signIn: "/",
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
  
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : 0;
        // token.accessToken = account.access_token
        // token.refreshToken = account.refresh_token
        // token.expiresAt = account.expires_at
      
        await prisma.account.updateMany({
          where: { providerAccountId: account?.providerAccountId },
          data: {
            access_token: account?.access_token,
            expires_at: account?.expires_at,
            ...(account?.refresh_token ? { refresh_token: account?.refresh_token } : {})
          }
        });
        //   if (account.refresh_token) {
        //   token.refreshToken = account.refresh_token;
        // }
      }

      // if (token.accessToken && token.email && !token.spreadsheetId) {
      //   const spreadsheetId = await getOrCreateSpreadsheet(
      //     token.accessToken as string,
      //     token.email as string
      //   )

      //   if (spreadsheetId) {
      //     token.spreadsheetId = spreadsheetId

      //     await prisma.user.update({
      //       where: { email: token.email },
      //       data: { spreadsheetId }
      //     })
      //     console.log(`Spreadsheet ready for ${token.email}: ${spreadsheetId}`)
      //   }
      // }

      return token
    },

    async session({ session, user }) {
      console.log("Session callback - user:", user);
      console.log("Session callback - session.user.email:", session.user.email);
      
      const account = await getGoogleAccountByEmail(session.user.email ?? "")
      
      // if (!account) return session;
      if (!account) {
        console.log("No account found for:", session.user.email);
        // tetap return session dengan spreadsheetId dari user
        session.user = {
          ...session.user,
          id: user.id,
          spreadsheetId: user.spreadsheetId || "",
        };
        return session;
      }

      const accessToken = isAccessTokenExpired(account.expires_at) ? await refreshAndUpdateAccessToken(account) : account.access_token

      session.user = {
        ...session.user,
        id: user.id,
        spreadsheetId: user.spreadsheetId || "",
      };

      session.accessToken = accessToken ?? undefined;
      
      // session.user = {
      //   id: token.sub ?? "",
      //   email: token.email ?? "",
      //   emailVerified: null,
      //   name: token.name ?? "",
      //   image: token.picture ?? "",
        // spreadsheetId: (token.spreadsheetId as string) ?? "",
      // };
      // session.user = {
        // ...session.user,
        // spreadsheetId: user.spreadsheetId || "", // ambil dari database user
      // };
      // session.accessToken = accessToken ?? undefined
      
      // return setSessionAccessToken(session, accessToken);
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
})
