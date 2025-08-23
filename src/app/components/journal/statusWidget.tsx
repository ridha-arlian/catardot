/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { Box, VStack, HStack, Text, Card, Status, SkeletonCircle, Skeleton } from "@chakra-ui/react"

interface StatusWidgetProps {
  refreshTrigger?: number
}

export const StatusWidget = ({ refreshTrigger }: StatusWidgetProps) => {
  const [todayDate, setTodayDate] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasJournalToday, setHasJournalToday] = useState(false)

  const getTodayDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const checkTodayJournal = async (forceRefresh = false) => {
    setIsLoading(true)
    setError(null)
    const today = getTodayDate()
    setTodayDate(today)

    try {
      const params = new URLSearchParams({ storyDate: today })

      if (forceRefresh) params.append('refresh', 'true')      

      const response = await fetch(`/api/story?storyDate=${today}`,{
        credentials: "include"
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      const data = await response.json()

      const hasJournal = data !== null && data.date && data.content
      setHasJournalToday(hasJournal)
      console.log(`Journal check for ${today}:`, hasJournal ? 'Found' : 'Not found')

    } catch (error) {
      console.error("Error checking today journal:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
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
        console.log("Date changed, refreshing journal status")
        checkTodayJournal()
      }
    }, 60000)
    
    return () => clearInterval(interval)
  }, [todayDate])

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log("Refresh trigger activated, force refreshing journal status")
      checkTodayJournal(true)
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

  if (error) {
    return (
      <Box width="336px">
        <Card.Root className="bg-card border-border shadow-sm">
          <Box p={4}>
            <VStack align="start" gap={2}>
              <HStack gap={3}>
                <Status.Root size="sm" colorPalette="red">
                  <Status.Indicator />
                </Status.Root>
                <Text fontWeight="semibold" fontSize="sm" color="red.600">
                  Error Loading Status
                </Text>
              </HStack>
              <Text fontSize="xs" color="red.500">
                {error}
              </Text>
            </VStack>
          </Box>
        </Card.Root>
      </Box>
    )
  }

  return (
    <>
      <Box width="336px">
        <Card.Root className="bg-card border-border shadow-sm">
          <Box p={4}>
            <VStack align="start" gap={2}>
              <HStack gap={3}>
                <Status.Root size="sm" colorPalette={hasJournalToday ? "green" : "orange"}>
                  <Status.Indicator />
                </Status.Root>
                <Text fontWeight="semibold" fontSize="sm" color={hasJournalToday ? "green.600" : "orange.600"}>
                  { hasJournalToday ? "Sudah Menulis Catatan" : "Belum Menulis Catatan" }
                </Text>
              </HStack>
              <Text fontSize="xs">
                { hasJournalToday ? "Kamu sudah menulis catatan harian hari ini. Terima kasih!" : "Kamu belum menulis catatan harian hari ini. Ayo buat catatan hari ini!" }
              </Text>
              <Text fontSize="xs" color="gray.500">
                Terakhir dicek: {new Date().toLocaleTimeString('id-ID', { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </VStack>
          </Box>
        </Card.Root>
      </Box>
    </>
  )
}