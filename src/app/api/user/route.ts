import { auth } from '../../../../auth'
import { NextResponse } from 'next/server'
import { userService } from '@/app/lib/userService'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    
    const user = await userService.getUserByEmail(session.user.email)
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      spreadsheet_id: user.spreadsheet_id
    })
  
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}