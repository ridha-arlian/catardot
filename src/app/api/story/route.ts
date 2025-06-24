/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'

const prisma = new PrismaClient()

// GET - Mengambil story berdasarkan tanggal atau semua story user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const userId = searchParams.get('userId')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    if (!userId) {
      return NextResponse.json({ error: 'User ID diperlukan' }, { status: 400 })
    }

    let stories

    if (date) {
      // Get specific date
      stories = await prisma.story.findUnique({
        where: {
          userId_storyDate: {
            userId: userId,
            storyDate: new Date(date + 'T00:00:00.000Z')
          }
        }
      })
    } else if (year && month) {
      // Get stories for specific month - OPTIMASI BARU
      const startDate = new Date(`${year}-${month.padStart(2, '0')}-01T00:00:00.000Z`)
      const endDate = new Date(parseInt(year), parseInt(month), 0) // Last day of month
      const endDateString = `${year}-${month.padStart(2, '0')}-${endDate.getDate()}T23:59:59.999Z`
      
      stories = await prisma.story.findMany({
        where: { 
          userId: userId,
          storyDate: {
            gte: startDate,
            lte: new Date(endDateString)
          }
        },
        orderBy: { storyDate: 'asc' }
      })
    } else {
      // Get recent stories (fallback)
      stories = await prisma.story.findMany({
        where: { userId: userId },
        orderBy: { storyDate: 'desc' },
        take: 10
      })
    }

    return NextResponse.json({
      success: true,
      data: stories,
      ...(Array.isArray(stories) && { count: stories.length })
    })

  } catch (error) {
    console.error('Error mengambil stories:', error)
    return NextResponse.json({ error: 'Gagal mengambil data jurnal' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Membuat story/jurnal baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, storyDate, userId } = body

    if (!content || !storyDate || !userId) {
      return NextResponse.json({ error: 'Content, tanggal, dan user ID diperlukan' }, { status: 400 })
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Content jurnal tidak boleh kosong' }, { status: 400 })
    }

    const story = await prisma.story.create({
      data: {
        content: content.trim(),
        storyDate: new Date(storyDate),
        userId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Jurnal berhasil disimpan',
      data: story
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error membuat story:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Jurnal untuk tanggal ini sudah ada. Gunakan fitur edit untuk mengubah.' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Gagal menyimpan jurnal. Silakan coba lagi.' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, content, userId } = body

    if (!id || !content || !userId) {
      return NextResponse.json({ error: 'ID, content, dan user ID diperlukan' }, { status: 400 })
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Content jurnal tidak boleh kosong' }, { status: 400 })
    }

    // Cek ownership
    const existingStory = await prisma.story.findUnique({
      where: { id: id }
    })

    if (!existingStory) {
      return NextResponse.json({ error: 'Jurnal tidak ditemukan' }, { status: 404 })
    }

    if (existingStory.userId !== userId) {
      return NextResponse.json({ error: 'Tidak memiliki akses untuk mengedit jurnal ini' }, { status: 403 })
    }

    // Update jurnal
    const updatedStory = await prisma.story.update({
      where: { id: id },
      data: {
        content: content.trim()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Jurnal berhasil diperbarui',
      data: updatedStory
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error updating story:', error)
    return NextResponse.json({ error: 'Gagal memperbarui jurnal' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}