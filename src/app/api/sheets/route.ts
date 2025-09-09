import { prisma } from '@/prisma'
import { auth } from '../../../../auth'
import { NextResponse } from 'next/server'
import { getOrCreateSpreadsheet } from '@/features/journal/get-spreadsheet.server'
import { getGoogleAccountByEmail } from '@/features/auth/user-auth-session-model.server'

export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) { return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })}

    const user = await prisma.user.findUnique({ where: { email: session.user.email }})

    if (user?.spreadsheetId) { return NextResponse.json({ spreadsheetId: user.spreadsheetId })}

    const account = await getGoogleAccountByEmail(session.user.email)

    if (!account?.access_token) { return NextResponse.json({ error: 'No access token' }, { status: 400 })}

    const spreadsheetId = await getOrCreateSpreadsheet(
      account.access_token,
      session.user.email
    )

    if (spreadsheetId) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { spreadsheetId }
      })

      return NextResponse.json({ spreadsheetId })
    }

    return NextResponse.json({ error: 'Failed to create spreadsheet' }, { status: 500 })

  } catch (error) {
    console.error('Setup spreadsheet error: ', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}