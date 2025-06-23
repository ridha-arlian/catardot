/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useState, useEffect } from 'react'
import { Box, VStack, HStack, Text, Card, Status, SkeletonCircle, Skeleton } from '@chakra-ui/react'
import { useColorModeValue } from "@/components/ui/color-mode"

interface StatusWidgetProps {
  refreshTrigger?: number
}

export const StatusWidget = ({ refreshTrigger }: StatusWidgetProps) => {
  const [hasJournalToday, setHasJournalToday] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [todayDate, setTodayDate] = useState('')

  const cardBg = useColorModeValue('white', 'gray.800')
  const font = useColorModeValue("gray.600", "gray.400")

  const getTodayDate = () => new Date().toISOString().split('T')[0]

  const checkTodayJournal = async () => {
    setIsLoading(true)
    const today = getTodayDate()
    setTodayDate(today)

    try {
      const response = await fetch(`/api/story?userId=user123&date=${today}`)
      const data = await response.json()
      setHasJournalToday(data.success && data.data)
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
    <Box flex="1" display="flex" ms="3">
      <VStack align="start">
        <Card.Root bg={cardBg} shadow="md" width="450px" borderLeft="4px solid" borderLeftColor="gray.300">
          <Card.Body py={4}>
            <Box minH="60px" width="100%" display="flex" flexDirection="column" justifyContent="space-between">
              <HStack mb={2}>
                <SkeletonCircle width="24px" height="24px" bg="gray.300"/>
                <Skeleton width="180px" height="20px" bg="gray.300" borderRadius="md"/>
              </HStack>
              <Skeleton width="100%" height="16px" bg="gray.200" borderRadius="md"/>
            </Box>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  )
}
  return (
    <>
      <Box flex="1" display="flex" ms="3">
        <VStack align="start">
          <Card.Root  bg={cardBg} shadow="md" width="450px" borderLeft="4px solid" borderLeftColor={hasJournalToday ? "green.500" : "orange.500"}>
            <Card.Body py={4}>
              <Box minH="60px" maxW="100%" display="flex" flexDirection="column" justifyContent="space-between">
                <HStack mb={2}>
                  <Status.Root size="lg" colorPalette={hasJournalToday ? "green" : "red"} flexShrink={0}>
                    <Status.Indicator />
                  </Status.Root>
                  <Box color="orange.500" fontSize="xl"/>
                  <Text fontWeight="semibold" color={hasJournalToday ? "green.600" : "orange.600"} fontSize="lg" whiteSpace="nowrap">
                    {hasJournalToday ? "Sudah Menulis Catatan" : "Belum Menulis Catatan"}
                  </Text>
                </HStack>
                <Text fontSize="md" color={font} lineHeight="1.5" whiteSpace="nowrap">
                  {hasJournalToday ? "Kamu sudah menulis catatan harian hari ini. Terima kasih!" : "Kamu belum menulis catatan harian hari ini." }
                </Text>
              </Box>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    </>
  )
}