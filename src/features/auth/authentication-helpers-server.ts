import { google } from "googleapis"
import { Session } from "next-auth"
import { Account } from "@/generated/prisma"
import { updateAccessToken } from "./user-auth-session-model.server"

export const isAccessTokenExpired = (expiresAt: number | null | undefined) : boolean => {
  if (!expiresAt) return true

  const now = Math.floor(Date.now() / 1000)

  return now >= expiresAt
}

export const refreshAndUpdateAccessToken = async (account: Account) : Promise<string | null> => {
  try {
    const refreshed = await refreshAccessToken(account)
    const updatedAccessToken = await updateAccessToken(account, refreshed)
    return updatedAccessToken
  } catch (error) {
    console.error("Error refreshing access token: ", error)
    return null
  }
}

export const refreshAccessToken = async (account: Account) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.AUTH_GOOGLE_ID,
      process.env.AUTH_GOOGLE_SECRET
    )

    oauth2Client.setCredentials({ refresh_token: account.refresh_token as string })

    const { credentials } = await oauth2Client.refreshAccessToken()

    return {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token ?? account.refresh_token,
    }
  } catch (error) {
    console.error("Error refreshing access token: ", error)
    return {
      accessToken: account.access_token ?? "",
      refreshToken: account.refresh_token,
    }
  }
}

export const setSessionAccessToken = (session: Session, accessToken: string | null | undefined): Session => {
  session.accessToken = accessToken ?? undefined
  return session
}