/* eslint-disable @typescript-eslint/no-explicit-any */
import { redis } from '@/app/lib/redis'
import { NextRequest, NextResponse } from 'next/server'

const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('storyDate')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    if (!SCRIPT_URL) {
      return NextResponse.json({ error: 'SCRIPT_URL is not defined' }, { status: 500 })
    }

    let cacheKey = ''
    if (date) cacheKey = `story:${date}`
    else if (month && year) cacheKey = `stories:${year}-${month}`
    else
      return NextResponse.json(
        { error: 'Missing parameters (storyDate OR month+year required)' },
        { status: 400 }
      )

    const cached = await redis.get(cacheKey)
    if (cached) {
      try {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
        console.log('Returning data from Redis cache')
        return NextResponse.json(parsed)
      } catch (e) {
        console.warn('Failed to parse cached data, fetching from GAS', e)
        await redis.del(cacheKey)
      }
    }

    let apiUrl = SCRIPT_URL
    if (date) apiUrl += `?storyDate=${encodeURIComponent(date)}`
    else apiUrl += `?month=${encodeURIComponent(month!)}&year=${encodeURIComponent(year!)}`

    const res = await fetch(apiUrl)
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      const text = await res.text()
      console.error('Non-JSON response from Google Script:', text)
      return NextResponse.json({ error: 'Response is not JSON', details: text }, { status: 500 })
    }

    const data = await res.json()

    let ttlSeconds = 600
    if (date) {
      const now = new Date()
      const endOfDay = new Date(now)
      endOfDay.setHours(23, 59, 59, 999)
      ttlSeconds = Math.ceil((endOfDay.getTime() - now.getTime()) / 1000)
    }

    if (data && typeof data === 'object') {
      await redis.set(cacheKey, JSON.stringify(data), { ex: ttlSeconds })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in GET handler: ', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${SCRIPT_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      const text = await res.text()
      console.error('Non-JSON response from Google Script: ', text)
      return NextResponse.json(
        { error: 'Response is not JSON', details: text },
        { status: 500 }
      )
    }

    const data = await res.json();
    if (body.storyDate) {
      const cacheKey = `story:${body.storyDate}`
      await redis.set(cacheKey, JSON.stringify({ exists: true, story: body.content }), {
        // TTL sampai akhir hari
        ex: Math.ceil((new Date(body.storyDate).setHours(23, 59, 59, 999) - new Date().getTime()) / 1000)
      })
    }
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}