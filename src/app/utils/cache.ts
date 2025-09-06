// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { redis } from "@/app/lib/redis"

// export async function invalidateJournalCache(date: string) {
//   try {
//     const d = new Date(date)
//     const month = d.getMonth() + 1
//     const year = d.getFullYear()
//     const cacheKeys = [`story:${date}`, `stories:${year}-${month}`]
    
//     if (d.getDate() <= 3) {
//       const prevMonth = month === 1 ? 12 : month - 1
//       const prevYear = month === 1 ? year - 1 : year
//       cacheKeys.push(`stories:${prevYear}-${prevMonth}`)
//     }
    
//     await Promise.all(cacheKeys.map(key => redis.del(key)))
//     console.log(`Cache invalidated for keys: ${cacheKeys.join(', ')}`)
//   } catch (error) {
//     console.error('Failed to invalidate cache:', error)
//   }
// }

// export async function invalidateTodayJournalCache() {
//   const today = new Date().toISOString().split('T')[0]
//   await invalidateJournalCache(today)
// }

// export async function refreshJournalCache(date: string, spreadsheetId: string, accessToken: string) {
//   try {
//     await invalidateJournalCache(date)
//     console.log(`Cache refreshed for date: ${date}`)
//   } catch (error) {
//     console.error('Failed to refresh cache:', error)
//   }
// }