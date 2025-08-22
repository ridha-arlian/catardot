/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from "googleapis"
import { auth } from "../../../../auth"
import { redis } from "@/app/lib/redis"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || !session.accessToken || !session.user?.spreadsheetId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const storyDate = searchParams.get("storyDate")
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    if (!storyDate && !(month && year)) {
      return NextResponse.json(
        { error: "Missing parameters (storyDate OR month+year required)" },
        { status: 400 }
      )
    }

    const spreadsheetId = session.user.spreadsheetId
    const accessToken = session.accessToken

    const cacheKey = storyDate
      ? `story:${storyDate}`
      : `stories:${year}-${month}`

    // --- Cek Redis ---
    const cached = await redis.get(cacheKey)
    if (cached) {
      try {
        const parsed = typeof cached === "string" ? JSON.parse(cached) : cached
        console.log("Returning data from Redis cache")
        return NextResponse.json(parsed)
      } catch (e) {
        console.warn("Failed to parse cached data, clearing cache", e)
        await redis.del(cacheKey)
      }
    }

    // --- Setup Google Sheets API ---
    const oAuth2Client = new google.auth.OAuth2()
    oAuth2Client.setCredentials({ access_token: accessToken })
    const sheets = google.sheets({ version: "v4", auth: oAuth2Client })

    const sheetName = "Journal - Homework for Life"
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:B`,
    })

    const rows = readResponse.data.values || []
    let result: any = null

    if (storyDate) {
      // Cari persis satu tanggal
      const row = rows.find(r => r[0] === storyDate)
      result = row ? { date: row[0], content: row[1] } : null
    } else if (month && year) {
      // Ambil semua di bulan & tahun tertentu
      const stories = rows
        .filter((r, idx) => idx > 0 && r[0]) // skip header
        .map(r => ({ date: r[0], content: r[1] }))
        .filter(story => {
          const d = new Date(story.date)
          return (
            d.getMonth() + 1 === Number(month) &&
            d.getFullYear() === Number(year)
          )
        })
      result = stories
    }

    // TTL untuk Redis
    let ttlSeconds = 600
    if (storyDate) {
      const now = new Date()
      const endOfDay = new Date(now)
      endOfDay.setHours(23, 59, 59, 999)
      ttlSeconds = Math.ceil((endOfDay.getTime() - now.getTime()) / 1000)
    }

    await redis.set(cacheKey, JSON.stringify(result), { ex: ttlSeconds })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error in GET handler: ", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { storyDate, content } = body

    if (!storyDate || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const oAuth2Client = new google.auth.OAuth2()
    oAuth2Client.setCredentials({ access_token: session.accessToken })
    const sheets = google.sheets({ version: "v4", auth: oAuth2Client })

    const finalSpreadsheetId = session.user.spreadsheetId
    if (!finalSpreadsheetId) {
      return NextResponse.json(
        { error: "Spreadsheet not initialized for user" },
        { status: 500 }
      )
    }

    const sheetName = "Journal - Homework for Life"
    const meta = await sheets.spreadsheets.get({ spreadsheetId: finalSpreadsheetId })

    if (!meta.data.sheets?.some(s => s.properties?.title === sheetName)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: finalSpreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: sheetName } } }],
        },
      })
    }

    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: finalSpreadsheetId,
      range: `${sheetName}!A:B`,
    })

    const rows = readResponse.data.values || []
    let rowIndex = -1

    rows.forEach((row, idx) => {
      if (idx === 0) return
      if (row[0] === storyDate) rowIndex = idx
    })

    if (rowIndex > -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: finalSpreadsheetId,
        range: `${sheetName}!A${rowIndex + 1}:B${rowIndex + 1}`,
        valueInputOption: "RAW",
        requestBody: { values: [[storyDate, content]] },
      })
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: finalSpreadsheetId,
        range: `${sheetName}!A:B`,
        valueInputOption: "RAW",
        requestBody: { values: [[storyDate, content]] },
      })
    }

    const meta2 = await sheets.spreadsheets.get({ spreadsheetId: finalSpreadsheetId })
    const sheet = meta2.data.sheets?.find(s => s.properties?.title === sheetName)
    const sheetId = sheet?.properties?.sheetId

    if (sheetId) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: finalSpreadsheetId,
        requestBody: {
          requests: [
            {
              autoResizeDimensions: {
                dimensions: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 2 },
              },
            },
            {
              repeatCell: {
                range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
                cell: { userEnteredFormat: { textFormat: { bold: true } } },
                fields: "userEnteredFormat.textFormat.bold",
              },
            },
          ],
        },
      })
    }

    return NextResponse.json({
      success: true,
      spreadsheetId: finalSpreadsheetId,
      updated: rowIndex > -1,
    })
  } catch (error: any) {
    console.error("Error saving story:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
