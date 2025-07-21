import { NextResponse } from "next/server"

// app/api/keep-alive/route.ts
export async function GET() {
  try {
    // Simple HTTP ping ke Supabase untuk keep connection alive
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('✅ Supabase ping status:', response.status)
    
    return NextResponse.json({ 
      status: 'alive', 
      timestamp: new Date().toISOString(),
      supabaseStatus: response.status,
      method: 'http-ping'
    })
    
  } catch (error) {
    console.error('❌ Ping error:', error)
    return NextResponse.json({ 
      error: 'Ping failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}