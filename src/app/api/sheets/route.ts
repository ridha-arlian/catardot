import { auth } from '../../../../auth'
import { NextResponse } from 'next/server'
import { userService } from '@/app/lib/userService'
import { getOrCreateSpreadsheet } from '@/features/journal/get-spreadsheet.server'
import { getGoogleAccountByEmail } from '@/features/auth/user-auth-session-model.server'

export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    
    const user = await userService.getUserByEmail(session.user.email)
    
    if (user?.spreadsheet_id) return NextResponse.json({ spreadsheetId: user.spreadsheet_id })
    
    const account = await getGoogleAccountByEmail(session.user.email)
    
    if (!account?.access_token) return NextResponse.json({ error: 'No access token' }, { status: 400 })
    
    const spreadsheetId = await getOrCreateSpreadsheet(account.access_token, session.user.email)
    
    if (spreadsheetId) {
      const updatedUser = await userService.updateSpreadsheetId(user.id, spreadsheetId)
      return NextResponse.json({ spreadsheetId: updatedUser.spreadsheet_id })
    }
    
    return NextResponse.json({ error: 'Failed to create spreadsheet' }, { status: 500 })
  
  } catch (error) {
    console.error('Setup spreadsheet error: ', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}