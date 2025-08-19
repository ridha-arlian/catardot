/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { Box, VStack, HStack, Text, Card, Status, SkeletonCircle, Skeleton } from '@chakra-ui/react'

interface StatusWidgetProps {
  refreshTrigger?: number
}

export const StatusWidget = ({ refreshTrigger }: StatusWidgetProps) => {
  const [todayDate, setTodayDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasJournalToday, setHasJournalToday] = useState(false)

  const getTodayDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const checkTodayJournal = async () => {
    setIsLoading(true)
    const today = getTodayDate()
    setTodayDate(today)

    try {
      const response = await fetch(`/api/story?storyDate=${today}`)
      const data = await response.json()
      setHasJournalToday(data.exists === true)
    } catch (error) {
      console.error('Error checking today journal:', error)
      setHasJournalToday(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkTodayJournal()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const currentDate = getTodayDate()
      if (currentDate !== todayDate) {
        checkTodayJournal()
      }
    }, 60000)
    
    return () => clearInterval(interval)
  }, [todayDate])

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      checkTodayJournal()
    }
  }, [refreshTrigger])

  if (isLoading) {
    return (
      <>
        <Box width="336px">
          <Card.Root className="bg-card border-border shadow-sm">
            <Box p={4}>
              <HStack gap={3}>
                <SkeletonCircle size="6" />
                <Skeleton flex="1" height="4" />
              </HStack>
              <Skeleton mt={2} height="3" />
            </Box>
          </Card.Root>
        </Box>
      </>
    )
  }

  return (
    <>
      <Box width="336px">
        <Card.Root className="bg-card border-border shadow-sm">
          <Box p={4}>
            <VStack align="start" gap={2}>
              <HStack gap={3}>
                <Status.Root size="sm" colorPalette={hasJournalToday ? 'green' : 'orange'}>
                  <Status.Indicator />
                </Status.Root>
                <Text fontWeight="semibold" fontSize="sm" color={hasJournalToday ? 'green.600' : 'orange.600'}>
                  {hasJournalToday ? 'Sudah Menulis Catatan' : 'Belum Menulis Catatan'}
                </Text>
              </HStack>
              <Text fontSize="xs">
                {hasJournalToday
                  ? 'Kamu sudah menulis catatan harian hari ini. Terima kasih!'
                  : 'Kamu belum menulis catatan harian hari ini. Ayo buat catatan hari ini!'}
              </Text>
            </VStack>
          </Box>
        </Card.Root>
      </Box>
    </>
  )
}