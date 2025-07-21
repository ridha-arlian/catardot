import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  try {
    const { data, error } = await supabase.from('User').select('id').limit(1)
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      status: 'alive', 
      timestamp: new Date().toISOString(),
      records: data?.length || 0
    })

  } catch (error) {
    console.error('Keep-alive error:', error)
    return NextResponse.json({ error: 'Failed to ping database' }, { status: 500 })
  }
}