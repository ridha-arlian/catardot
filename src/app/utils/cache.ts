// utils/cache.ts - Helper functions untuk cache management
import { redis } from '@/app/lib/redis' // adjust import sesuai project structure

/**
 * Invalidate cache untuk journal entries
 */
export async function invalidateJournalCache(date: string) {
  try {
    const d = new Date(date)
    const month = d.getMonth() + 1
    const year = d.getFullYear()
    
    const cacheKeys = [
      `story:${date}`,
      `stories:${year}-${month}`
    ]
    
    // Hapus juga cache bulan sebelumnya jika di awal bulan
    if (d.getDate() <= 3) {
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year
      cacheKeys.push(`stories:${prevYear}-${prevMonth}`)
    }
    
    await Promise.all(cacheKeys.map(key => redis.del(key)))
    console.log(`Cache invalidated for keys: ${cacheKeys.join(', ')}`)
  } catch (error) {
    console.error('Failed to invalidate cache:', error)
  }
}

/**
 * Invalidate semua cache journal untuk hari ini
 */
export async function invalidateTodayJournalCache() {
  const today = new Date().toISOString().split('T')[0]
  await invalidateJournalCache(today)
}

/**
 * Force refresh cache dengan fetch data terbaru
 */
export async function refreshJournalCache(date: string, spreadsheetId: string, accessToken: string) {
  try {
    // Hapus cache lama
    await invalidateJournalCache(date)
    
    // Di sini Anda bisa tambahkan logika untuk pre-populate cache
    // dengan data terbaru jika diperlukan
    console.log(`Cache refreshed for date: ${date}`)
  } catch (error) {
    console.error('Failed to refresh cache:', error)
  }
}