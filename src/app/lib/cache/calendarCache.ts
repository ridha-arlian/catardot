interface JournalEntry {
  id: string
  content: string
  storyDate: string
  createdAt: string
  userId: string
}

interface CacheEntry {
  dates: Set<string>
  data: Record<string, JournalEntry>
  timestamp: number
}

interface CacheStats {
  totalMonths: number
  totalJournals: number
  memoryUsage: string
  oldestEntry: string | null
}

class CalendarCacheService {
  private cache: Record<string, CacheEntry> = {}
  private readonly CACHE_DURATION = 10 * 60 * 1000
  private readonly MAX_CACHE_SIZE = 12
  private readonly DEBUG = process.env.NODE_ENV === 'development'
  private getCacheKey = (year: number, month: number): string => `${year}-${month}`
  private isCacheValid = (entry: CacheEntry): boolean => (Date.now() - entry.timestamp) < this.CACHE_DURATION
  private log = (message: string) => {
    if (this.DEBUG) console.log(message)
  }

  get(year: number, month: number): CacheEntry | null {
    const key = this.getCacheKey(year, month)
    const entry = this.cache[key]
    if (!entry) return null
    if (this.isCacheValid(entry)) {
      this.log(`Cache hit: ${key}`)
      return entry
    }
    this.log(`Cache expired: ${key}`)
    delete this.cache[key]
    return null
  }

  set(year: number, month: number, dates: Set<string>, data: Record<string, JournalEntry>): void {
    const key = this.getCacheKey(year, month)
    this.cache[key] = { dates, data, timestamp: Date.now() }
    this.cleanup()
    this.log(`Cached: ${key} (${Object.keys(data).length} journals)`)
  }

  private cleanup(): void {
    const cacheKeys = Object.keys(this.cache)
    if (cacheKeys.length <= this.MAX_CACHE_SIZE) return
    const oldestKey = cacheKeys.sort((a, b) => this.cache[a].timestamp - this.cache[b].timestamp)[0]
    delete this.cache[oldestKey]
    delete this.cache[oldestKey]
    this.log(`Evicted old cache: ${oldestKey}`)
  }

  needsPreload(year: number, month: number): boolean {
    const entry = this.cache[this.getCacheKey(year, month)]
    return !entry || !this.isCacheValid(entry)
  }

  invalidate(year: number, month: number): void {
    const key = this.getCacheKey(year, month)
    delete this.cache[key]
    this.log(`Invalidated: ${key}`)
  }

  clear(): void {
    this.cache = {}
    this.log(`Cache cleared`)
  }

  getStats(): CacheStats {
    const cacheKeys = Object.keys(this.cache)
    const totalJournals = cacheKeys.reduce((sum, key) => sum + Object.keys(this.cache[key]?.data || {}).length, 0)
    const oldestEntry = cacheKeys.length > 0 ? cacheKeys.sort((a, b) => this.cache[a].timestamp - this.cache[b].timestamp)[0] : null
    return {
      totalMonths: cacheKeys.length,
      totalJournals,
      memoryUsage: `~${Math.round(totalJournals * 0.5)}KB`,
      oldestEntry
    }
  }

  getCachedMonths = (): string[] => Object.keys(this.cache).sort()

  getAdjacentMonths(year: number, month: number): Array<{year: number, month: number, key: string}> {
    const getMonthData = (y: number, m: number) => ({ 
      year: y, 
      month: m, 
      key: this.getCacheKey(y, m) 
    })
    const prevMonth = month === 0 ? getMonthData(year - 1, 11) : getMonthData(year, month - 1)
    const nextMonth = month === 11 ? getMonthData(year + 1, 0) : getMonthData(year, month + 1)
    return [prevMonth, nextMonth]
  }
}

export const calendarCache = new CalendarCacheService()
export type { JournalEntry, CacheEntry, CacheStats }
