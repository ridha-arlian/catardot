import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      spreadsheetId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    spreadsheetId?: string;
  }
}
