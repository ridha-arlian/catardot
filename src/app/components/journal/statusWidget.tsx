/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { Box, VStack, HStack, Text, Card, Status, SkeletonCircle } from "@chakra-ui/react"

interface StatusWidgetProps {
  refreshTrigger?: number
  onStatusChange?: (hasJournal: boolean) => void
  onSpreadsheetCreated?: number
}

export const StatusWidget = ({ refreshTrigger, onStatusChange, onSpreadsheetCreated }: StatusWidgetProps) => {
  const [todayDate, setTodayDate] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasJournalToday, setHasJournalToday] = useState(false)
  const { data: session, status } = useSession()
  
  const prevSpreadsheetId = useRef<string | undefined>(undefined)
  const hasCheckedCurrentSpreadsheet = useRef<string | undefined>(undefined)

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

      const response = await fetch(`/api/story?${params.toString()}`, {
        credentials: "include"
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
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
    const currentSpreadsheetId = session?.user?.spreadsheetId

    if (status === "authenticated" && currentSpreadsheetId) {
      const isNewSpreadsheet = prevSpreadsheetId.current !== currentSpreadsheetId
      const hasntCheckedThisSpreadsheet = hasCheckedCurrentSpreadsheet.current !== currentSpreadsheetId
      
      if (isNewSpreadsheet || hasntCheckedThisSpreadsheet) {
        console.log("New spreadsheet detected or first check, checking journal status")
        prevSpreadsheetId.current = currentSpreadsheetId
        hasCheckedCurrentSpreadsheet.current = currentSpreadsheetId
        checkTodayJournal(true)
      } else {
        checkTodayJournal()
      }
    } else if (status === "authenticated" || status === "unauthenticated") {
      setIsLoading(false)
      prevSpreadsheetId.current = currentSpreadsheetId ?? undefined
      if (!currentSpreadsheetId) {
        hasCheckedCurrentSpreadsheet.current = undefined
      }
    }
  }, [status, session?.user?.spreadsheetId])

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.spreadsheetId) return

    const interval = setInterval(() => {
      const currentDate = getTodayDate()
      if (currentDate !== todayDate) {
        console.log("Date changed, refreshing journal status")
        checkTodayJournal()
      }
    }, 60000)
    
    return () => clearInterval(interval)
  }, [todayDate, status, session?.user?.spreadsheetId])

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && status === "authenticated" && session?.user?.spreadsheetId) {
      console.log("Refresh trigger activated, force refreshing journal status")
      checkTodayJournal(true)
    }
  }, [refreshTrigger])

  useEffect(() => {
    if (onSpreadsheetCreated && onSpreadsheetCreated > 0) {
      console.log("Spreadsheet creation trigger activated")
      
      hasCheckedCurrentSpreadsheet.current = undefined
      
      const timeouts = [500, 1000, 2000]
      
      timeouts.forEach((delay, index) => {
        setTimeout(() => {
          if (status === "authenticated" && session?.user?.spreadsheetId) {
            console.log(`Checking journal status after spreadsheet creation (attempt ${index + 1})`)
            hasCheckedCurrentSpreadsheet.current = session.user.spreadsheetId
            checkTodayJournal(true)
          }
        }, delay)
      })
    }
  }, [onSpreadsheetCreated])

  useEffect(() => {
    if (
      status === "authenticated" && 
      session?.user?.spreadsheetId && 
      prevSpreadsheetId.current && 
      prevSpreadsheetId.current !== session.user.spreadsheetId
    ) {
      console.log("Session updated with new spreadsheet ID, force checking status")
      prevSpreadsheetId.current = session.user.spreadsheetId
      hasCheckedCurrentSpreadsheet.current = session.user.spreadsheetId
      setTimeout(() => {
        checkTodayJournal(true)
      }, 100)
    }
  }, [session?.user?.spreadsheetId, status])

  if (status === "loading") {
    return (
      <Box width={{ base: "260px", md: "300px" }}>
        <Card.Root bg="bg.canvas" border="1px solid" borderColor="gray.300">
          <Box p={{ base: 2, md: 4 }}>
            <VStack align="start" gap={2}>
              <HStack gap={3}>
                <SkeletonCircle size="8" border="1px solid" borderColor="gray.400" />
                <Text textStyle="headingStatusWidget" color="gray.600">
                  Loading status...
                </Text>
              </HStack>
              <Text textStyle="contentStatusWidget" color="gray.500">
                Please wait while we check your journal.
              </Text>
            </VStack>
          </Box>
        </Card.Root>
      </Box>
    )
  }

  if (status === "unauthenticated") {
    return (
      <Box width={{ base: "260px", md: "300px" }}>
        <Card.Root bg="bg.canvas" border="1px solid" borderColor="gray.300">
          <Box p={{ base: 2, md: 4 }}>
            <VStack align="start" gap={2}>
              <HStack gap={3}>
                <Status.Root size="lg" colorPalette="gray">
                  <Status.Indicator />
                </Status.Root>
                <Text textStyle="headingStatusWidget" color="gray.600">
                  Please login
                </Text>
              </HStack>
              <Text textStyle="contentStatusWidget" color="gray.500">
                Login to start journaling.
              </Text>
            </VStack>
          </Box>
        </Card.Root>
      </Box>
    )
  }

  if (status === "authenticated" && (!session?.user?.spreadsheetId || isLoading)) {
    return (
      <Box width={{ base: "260px", md: "300px" }}>
        <Card.Root bg="bg.canvas" border="1px solid" borderColor="blue.300">
          <Box p={{ base: 2, md: 4 }}>
            <VStack align="start" gap={2}>
              <HStack gap={3}>
                {isLoading ? (
                  <SkeletonCircle size="8" border="1px solid" borderColor="blue.400" />
                ) : (
                  <Status.Root size="lg" colorPalette="blue">
                    <Status.Indicator />
                  </Status.Root>
                )}
                <Text textStyle="headingStatusWidget" color="blue.600">
                  {isLoading ? "Checking journal status..." : "Setting up journal"}
                </Text>
              </HStack>
              <Text textStyle="contentStatusWidget" color="blue.500">
                {isLoading ? "Please wait..." : "Preparing your journal space..."}
              </Text>
            </VStack>
          </Box>
        </Card.Root>
      </Box>
    )
  }

  if (error) {
    return (
      <Box width={{ base: "260px", md: "300px" }}>
        <Card.Root bg="bg.canvas" border="1px solid" borderColor="red.300">
          <Box p={{ base: 2, md: 4 }}>
            <VStack align="start" gap={2}>
              <HStack gap={3}>
                <Status.Root size="lg" colorPalette="red">
                  <Status.Indicator />
                </Status.Root>
                <Text textStyle="headingStatusWidget" color="red.600">
                  Error loading status
                </Text>
              </HStack>
              <Text textStyle="contentStatusWidget" color="red.500">
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
                  { hasJournalToday ? "Story Written" : "No Story Yet" }
                </Text>
              </HStack>
              <Text textStyle="contentStatusWidget">
                { hasJournalToday ? "Great, you've already written today." : "It's not too late, write your story now." }
              </Text>
              <Text textStyle="infoStatusWidget" color="gray.500">
                Last checked: { new Date().toLocaleTimeString('en-GB', { hour: "2-digit", minute: "2-digit" }) }
              </Text>
            </VStack>            
          </Box>
        </Card.Root>
      </Box>
    </>
  )
}