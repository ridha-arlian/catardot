/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { Box, VStack, HStack, Text, Card, Status, SkeletonCircle, Skeleton } from "@chakra-ui/react"

interface StatusWidgetProps {
  refreshTrigger?: number
  onStatusChange?: (hasJournal: boolean) => void
}

export const StatusWidget = ({ refreshTrigger, onStatusChange }: StatusWidgetProps) => {
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
      onStatusChange?.(hasJournal)
    } catch (error) {
      console.error("Error checking today journal:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
      setHasJournalToday(false)
      onStatusChange?.(false)
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
          <Card.Root bg="bg.canvas">
            <Box p={4}>
              <HStack gap={3}>
                <SkeletonCircle size="6" />
                <Skeleton flex="1" height="4" />
              </HStack>
              <Skeleton mt={2} height="4" />
              <Skeleton mt={2} height="4" />
            </Box>
          </Card.Root>
        </Box>
      </>
    )
  }

  if (error) {
    return (
      <Box width="336px">
        <Card.Root bg="bg.canvas">
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
      <Box width={{ base: "260px", md: "300px" }}>
        <Card.Root bg="bg.canvas" border="1px solid" borderColor={hasJournalToday ? "brand.500" : "orange.600"}>
          <Box p={{ base: 2, md: 4 }}>
            <VStack align="start" gap={2} display={{ base: "none", md: "flex" }}>
              <HStack gap={3}>
                <Status.Root size="lg" colorPalette={hasJournalToday ? "green" : "orange"}>
                  <Status.Indicator />
                </Status.Root>
                <Text textStyle="headingStatusWidget" color={hasJournalToday ? "green.600" : "orange.600"}>
                  { hasJournalToday ? "Sudah Menulis Cerita" : "Belum Menulis Cerita" }
                </Text>
              </HStack>
              <Text textStyle="contentStatusWidget">
                {/* { hasJournalToday ? "Kamu sudah menulis catatan harian hari ini. Terima kasih!" : "Kamu belum menulis catatan harian hari ini. Ayo buat catatan hari ini!" } */}
                { hasJournalToday ? "Bagus, kamu berhasil menulis cerita hari ini." : "Belum terlambat, tulislah satu cerita sebelum hari berganti." }
              </Text>
              <Text textStyle="infoStatusWidget" color="gray.500">
                Terakhir dicek: {new Date().toLocaleTimeString('id-ID', { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </VStack>

            {/* Mobile */}
            <VStack align="start" gap={2} display={{ base: "flex", md: "none" }}>
              <HStack gap={2} align="center">
                <Status.Root size="md" colorPalette={hasJournalToday ? "green" : "orange"}>
                  <Status.Indicator />
                </Status.Root>
                <Text textStyle="headingStatusWidget" color={hasJournalToday ? "green.600" : "orange.600"}>
                  { hasJournalToday ? "Bagus, kamu sudah menulis hari ini." : "Belum terlambat, ayo tulis cerita." }
                </Text>
              </HStack>
              <Text textStyle="infoStatusWidget" color="gray.500">
                Terakhir dicek: {new Date().toLocaleTimeString('id-ID', { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </VStack> 
            
          </Box>
        </Card.Root>
      </Box>
    </>
  )
}