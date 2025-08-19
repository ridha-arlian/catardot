/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, useEffect } from 'react'
import { Box, Button, HStack, VStack, Text, Spinner, Skeleton } from '@chakra-ui/react'
import { useColorModeValue } from "@/components/ui/color-mode"
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { calendarCache, type JournalEntry } from '../../lib/cache/calendarCache'

interface CalendarProps {
  value?: Date
  onChange?: (date: Date) => void
  locale?: string
  onDateSelect?: (date: Date, journalData: any) => void
  refreshTrigger?: number
}

export const CalendarWidget = ({ value, onChange, locale = 'id-ID', onDateSelect, refreshTrigger }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(value || new Date())
  const [journalDates, setJournalDates] = useState<Set<string>>(new Set())
  const [journalData, setJournalData] = useState<Record<string, JournalEntry>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Color values
  const calendarBg = useColorModeValue('white', 'gray.800')
  const headerBg = useColorModeValue('gray.50', 'gray.700')
  const dayNameColor = useColorModeValue('gray.600', 'gray.400')
  const dayColor = useColorModeValue('gray.700', 'gray.300')
  const todayBg = useColorModeValue('orange.100', 'orange.800')
  const todayColor = useColorModeValue('orange.800', 'orange.200')
  const selectedBg = useColorModeValue('blue.500', 'blue.600')
  const font = useColorModeValue('blue.500', 'blue.400')
  const selectedColor = 'white'
  const hoverBg = useColorModeValue('gray.100', 'gray.600')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const borderTopColor = useColorModeValue('gray.500', 'gray.300')
  const journalBg = useColorModeValue('green.100', 'green.800')
  const journalColor = useColorModeValue('green.800', 'green.200')

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()
  
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  
  // const monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
  // const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const fetchJournalDatesLazy = async ( targetYear: number, targetMonth: number, isPreload = false): Promise<{dates: Set<string>, data: Record<string, JournalEntry>} | null> => {
    const cached = calendarCache.get(targetYear, targetMonth)
    if (cached && (process.env.NODE_ENV === 'development' && !isPreload)) {
      return { dates: cached.dates, data: cached.data }
    }

    try {      
      const monthParam = (targetMonth + 1).toString()
      const response = await fetch(`/api/story?userId=user123&year=${targetYear}&month=${monthParam}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        const dates = new Set<string>()
        const dataMap: Record<string, JournalEntry> = {}
        
        data.data.forEach((journal: JournalEntry) => {
          const journalDay = journal.storyDate.split('T')[0].split('-')[2]
          const dayKey = parseInt(journalDay).toString()
          dates.add(dayKey)
          dataMap[dayKey] = journal
        })
        
        calendarCache.set(targetYear, targetMonth, dates, dataMap)
        return { dates, data: dataMap }
      }
    } catch (error) {
      console.error(`❌ Error fetching ${targetYear}-${targetMonth}:`, error)
    }
    return null
  }

  const preloadAdjacentMonths = async (currentYear: number, currentMonth: number) => {
    const adjacentMonths = calendarCache.getAdjacentMonths(currentYear, currentMonth)
    const toPreload = adjacentMonths.filter(({ year, month }) => calendarCache.needsPreload(year, month))

    if (toPreload.length === 0) return

    setTimeout(async () => {
      await Promise.all(toPreload.map(({ year, month }) => fetchJournalDatesLazy(year, month, true)))
    }, 300)
  }

  const navigateToMonth = async (targetYear: number, targetMonth: number) => {
    setIsTransitioning(true)
    try {
      const result = await fetchJournalDatesLazy(targetYear, targetMonth)
      if (result) {
        setCurrentDate(new Date(targetYear, targetMonth, 1))
        setJournalDates(result.dates)
        setJournalData(result.data)
        setTimeout(() => preloadAdjacentMonths(targetYear, targetMonth), 100)
      }
    } finally {
      setIsTransitioning(false)
    }
  }
  
  const goToPrevMonth = () => {
    const prevYear = month === 0 ? year - 1 : year
    const prevMonth = month === 0 ? 11 : month - 1
    navigateToMonth(prevYear, prevMonth)
  }

  const goToNextMonth = () => {
    const nextYear = month === 11 ? year + 1 : year
    const nextMonth = month === 11 ? 0 : month + 1
    navigateToMonth(nextYear, nextMonth)
  }

  const goToToday = async () => {
    const today = new Date()
    await navigateToMonth(today.getFullYear(), today.getMonth())
    const newDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    setCurrentDate(newDate)
    onChange?.(newDate)
    const dayKey = today.getDate().toString()
    const journalEntry = journalData[dayKey] || null
    onDateSelect?.(newDate, journalEntry)
  }

  const refreshCurrentMonth = async () => {
    calendarCache.invalidate(year, month)
    const result = await fetchJournalDatesLazy(year, month)
    if (result) {
      setJournalDates(result.dates)
      setJournalData(result.data)
    }
  }

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      refreshCurrentMonth()
    }
  }, [refreshTrigger])

  useEffect(() => {
    const loadCurrentMonth = async () => {
      setIsLoading(true)
      try {
        const result = await fetchJournalDatesLazy(year, month)
        if (result) {
          setJournalDates(result.dates)
          setJournalData(result.data)
          setTimeout(() => preloadAdjacentMonths(year, month), 300)
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadCurrentMonth()
  }, [])
  
  const days: (number | null)[] = [
    ...Array(startingDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]
  
  const isToday = (day: number | null): boolean => !!day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  const isSelected = (day: number | null): boolean => !!day && !!value && value.getDate() === day && value.getMonth() === month && value.getFullYear() === year
  const hasJournal = (day: number | null): boolean => !!day && journalDates.has(day.toString())

  const selectDate = (day: number) => {
    const selectedYear = currentDate.getFullYear()
    const selectedMonth = currentDate.getMonth()
    const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const newDate = new Date(dateString + 'T00:00:00.000Z')
    setCurrentDate(newDate)
    onChange?.(newDate)
    const dayKey = day.toString()
    const journalEntry = journalData[dayKey] || null
    onDateSelect?.(newDate, journalEntry)
  }

  const getDayBackgroundColor = (day: number | null) => {
    if (!day) return "transparent"
    if (isSelected(day)) return selectedBg
    if (isToday(day)) return todayBg
    if (hasJournal(day)) return journalBg
    return "transparent"
  }

  const getDayTextColor = (day: number | null) => {
    if (!day) return "transparent"
    if (isSelected(day)) return selectedColor
    if (isToday(day)) return todayColor
    if (hasJournal(day)) return journalColor
    return dayColor
  }

  const getDayHoverColor = (day: number | null) => {
    if (!day) return {}
    if (isSelected(day)) return { bg: selectedBg }
    if (isToday(day)) return { bg: todayBg }
    if (hasJournal(day)) return { bg: journalBg }
    return { bg: hoverBg }
  }

  return (
    <>
      <Box bg={calendarBg} border="1px solid" borderColor={borderColor} borderRadius="lg" overflow="hidden" width="100%" maxW="380px">
        {/* Header */}
        <Box bg={headerBg} px={4} py={3}>
          <HStack justify="space-between" align="center">
            <Button size="md" variant="ghost" onClick={goToPrevMonth} color={dayNameColor} _hover={{ bg: hoverBg }} loading={isTransitioning} loadingText="" disabled={isTransitioning}>
              <FiChevronLeft />
            </Button>
            <VStack gap={1}>
              <Text color={dayColor} textStyle="rubikThird">{monthNames[month]}</Text>
              <Text color={dayNameColor} textStyle="rubikFour">{year}</Text>
            </VStack>
            <Button size="md" variant="ghost" onClick={goToNextMonth} color={dayNameColor} _hover={{ bg: hoverBg }} loading={isTransitioning} loadingText="" disabled={isTransitioning}>
              <FiChevronRight />
            </Button>
          </HStack>
          <Box textAlign="center" mt={2}>
            <Button size="sm" variant="outline" onClick={async () => await goToToday()} colorScheme="blue" disabled={isTransitioning}>
              Hari Ini
            </Button>
          </Box>
        </Box>
        
        {/* Body */}
        <Box p={4}>
          <HStack justify="flex-start" gap="4" mb={3} width="100%">
            {dayNames.map((dayName) => (
              <Box key={dayName} width="100%" textStyle="rubikFive" textAlign="center" color={dayNameColor} py={1}>
                {dayName}
              </Box>
            ))}
          </HStack>
          <Box height="190px" position="relative">
            {isLoading && (
              <VStack gap={1} height="100%">
                {Array.from({ length: 6 }, (_, weekIndex) => (
                  <HStack key={weekIndex} justify="flex-start" gap="4" width="100%">
                    {Array.from({ length: 7 }, (_, dayIndex) => (
                      <Skeleton key={`skeleton-${weekIndex}-${dayIndex}`} width="36px" height="30px" bg={borderColor} borderRadius="md"/>
                    ))}
                  </HStack>
                ))}
              </VStack>
            )}
            {isTransitioning && !isLoading && (
              <Box position="absolute" top="0" left="0" right="0" bottom="0" display="flex" alignItems="center" justifyContent="center" bg={headerBg} backdropFilter="blur(2px)" zIndex={10}>
                <VStack gap={2}>
                  <Box width="32px" height="32px">
                    <Spinner size="lg"/>
                  </Box>
                  <Text fontSize="sm" color={font} fontWeight="medium">
                    Memuat...
                  </Text>
                </VStack>
              </Box>
            )}
            {!isLoading && (
              <VStack gap={1} height="100%" opacity={isTransitioning ? 0.3 : 1} transition="opacity 0.2s ease-in-out">
                {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
                  <HStack key={weekIndex} justify="flex-start" gap="4" width="100%">
                    {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                      <Box key={`day-${weekIndex}-${dayIndex}`} width="36px" height="30px" display="flex" alignItems="center" justifyContent="center" borderRadius="md" cursor={day && !isTransitioning ? "pointer" : "default"} textStyle="rubikSix" fontWeight={isSelected(day) || isToday(day) || hasJournal(day) ? "bold" : "normal"} bg={getDayBackgroundColor(day)} color={getDayTextColor(day)} _hover={day && !isTransitioning ? getDayHoverColor(day) : {}} transition="all 0.2s" onClick={() => day && !isTransitioning && selectDate(day)} position="relative" transform="scale(1)" _active={day && !isTransitioning ? { transform: "scale(0.95)" } : {}} pointerEvents={isTransitioning ? "none" : "auto"}>
                        {day}
                        {day && hasJournal(day) && !isSelected(day) && (
                          <Box position="absolute" bottom="1px" right="2px" width="4px" height="4px" bg={journalColor} borderRadius="full"/>
                        )}
                      </Box>
                    ))}
                  </HStack>
                ))}
              </VStack>
            )}
          </Box>
        </Box>
        {value && (
          <Box bg={headerBg} px={4} py={2} borderTop="1px solid" borderTopColor={borderColor}>
            <Text color={dayNameColor} textAlign="center" textStyle="rubikSeven">
              {value.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </Box>
        )}
      </Box>
    </>
  )
}