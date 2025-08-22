import { auth } from "../../../../../auth"
import { google } from "googleapis"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { storyDate, spreadsheetId } = body

    if (!storyDate || !spreadsheetId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const oAuth2Client = new google.auth.OAuth2()
    oAuth2Client.setCredentials({ access_token: session.accessToken })

    const sheets = google.sheets({ version: "v4", auth: oAuth2Client })
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Journal - Homework for Life!A:C",
    })

    const rows = response.data.values || []
    const existingEntry = rows.slice(1).find(row => row[0] === storyDate)

    return NextResponse.json({
      exists: !!existingEntry,
      story: existingEntry?.[1] ?? "",
      storyDate: existingEntry?.[0] ?? storyDate,
    })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error checking story:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
