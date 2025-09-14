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
  const [userReady, setUserReady] = useState(false)
  const { data: session, status } = useSession()
  
  const isChecking = useRef(false)

  const getTodayDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const checkUserSetup = async () => {
    const response = await fetch('/api/story?userOnly=true', {
      credentials: 'include'
    })

    if (!response.ok) {
      if (response.status === 400) throw new Error("Spreadsheet not set up. Please complete setup first.")
      throw new Error(`Server error: ${response.status}`)
    }

    const userData = await response.json()
    return userData.spreadsheet_id ? true : false
  }

  const checkTodayJournal = async (forceRefresh = false) => {
    if (isChecking.current) return
    
    isChecking.current = true
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

      if (!response.ok) throw new Error(`Failed to check journal: ${response.status}`)
      
      const data = await response.json()
      const hasJournal = data !== null && data.date && data.content
      
      setHasJournalToday(hasJournal)
      onStatusChange?.(hasJournal)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(errorMessage)
      setHasJournalToday(false)
      onStatusChange?.(false)
    } finally {
      setIsLoading(false)
      isChecking.current = false
    }
  }

  useEffect(() => {
    const initialize = async () => {
      if (status !== "authenticated") return
      
      setIsLoading(true)
      setError(null)

      try {
        await checkUserSetup()
        setUserReady(true)
        await checkTodayJournal(true)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize"
        setError(errorMessage)
        setIsLoading(false)
      }
    }

    if (status === "loading") {
      setIsLoading(true)
    } else if (status === "unauthenticated") {
      setIsLoading(false)
      setUserReady(false)
      setError(null)
    } else {
      initialize()
    }
  }, [status])

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && userReady) {
      checkTodayJournal(true)
    }
  }, [refreshTrigger])

  useEffect(() => {
    if (onSpreadsheetCreated && onSpreadsheetCreated > 0) {
      setUserReady(false)
      setTimeout(() => {
        if (status === "authenticated") {
          const reinit = async () => {
            try {
              await checkUserSetup()
              setUserReady(true)
              await checkTodayJournal(true)
            } catch (error) {
              setError("Failed to connect to spreadsheet")
              setIsLoading(false)
            }
          }
          reinit()
        }
      }, 2000)
    }
  }, [onSpreadsheetCreated])

  if (status === "loading" || isLoading) {
    return (
      <Box width={{ base: "260px", md: "300px" }}>
        <Card.Root bg="bg.canvas" border="1px solid" borderColor="blue.300">
          <Box p={{ base: 2, md: 4 }}>
            <VStack align="start" gap={2}>
              <HStack gap={3}>
                <SkeletonCircle size="8" border="1px solid" borderColor="blue.400" />
                <Text textStyle="headingStatusWidget" color="blue.600">
                  {status === "loading" ? "Loading..." : "Checking journal..."}
                </Text>
              </HStack>
              <Text textStyle="contentStatusWidget" color="blue.500">
                Please wait...
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
                  Setup Required
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
    <Box width={{ base: "260px", md: "300px" }}>
      <Card.Root bg="bg.canvas" border="1px solid" borderColor={hasJournalToday ? "brand.500" : "orange.600"}>
        <Box p={{ base: 2, md: 4 }}>
          <VStack align="start" gap={2} display={{ base: "none", md: "flex" }}>
            <HStack gap={3}>
              <Status.Root size="lg" colorPalette={hasJournalToday ? "green" : "orange"}>
                <Status.Indicator />
              </Status.Root>
              <Text textStyle="headingStatusWidget" color={hasJournalToday ? "green.600" : "orange.600"}>
                {hasJournalToday ? "Story Written" : "No Story Yet"}
              </Text>
            </HStack>
            <Text textStyle="contentStatusWidget">
              {hasJournalToday ? "Great, you've already written today." : "It's not too late, write your story now."}
            </Text>
            <Text textStyle="infoStatusWidget" color="gray.500">
              Last checked: {new Date().toLocaleTimeString('en-GB', { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </VStack>
        </Box>
      </Card.Root>
    </Box>
  )
}