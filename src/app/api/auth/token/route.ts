/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth } from '../../../../../auth'
import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAccountByEmail } from '@/features/auth/user-auth-session-model.server'
import { isAccessTokenExpired, refreshAndUpdateAccessToken } from '@/features/auth/authentication-helpers-server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      )
    }

    const account = await getGoogleAccountByEmail(session.user.email)
    
    if (!account) {
      return NextResponse.json(
        { error: 'Google account not found' }, 
        { status: 404 }
      )
    }

    let accessToken = account.access_token
    
    if (isAccessTokenExpired(account.expires_at)) {
      console.log('Token expired, refreshing...')
      accessToken = await refreshAndUpdateAccessToken(account)
      
      if (!accessToken) {
        return NextResponse.json(
          { error: 'Failed to refresh access token' }, 
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      accessToken,
      spreadsheetId: session.user.spreadsheetId || "",
      expiresAt: account.expires_at
    })
    
  } catch (error) {
    console.error('Token API error: ', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}