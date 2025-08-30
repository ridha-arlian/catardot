// /* eslint-disable react-hooks/exhaustive-deps */
// "use client"

// import { useState, useEffect } from "react"
// import { Box, VStack, HStack, Text, Card, Status, SkeletonCircle, Skeleton } from "@chakra-ui/react"

// interface StatusWidgetProps {
//   refreshTrigger?: number
//   onStatusChange?: (hasJournal: boolean) => void
// }

// export const StatusWidget = ({ refreshTrigger, onStatusChange }: StatusWidgetProps) => {
//   const [todayDate, setTodayDate] = useState("")
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [hasJournalToday, setHasJournalToday] = useState(false)

//   const getTodayDate = () => {
//     const now = new Date()
//     const year = now.getFullYear()
//     const month = String(now.getMonth() + 1).padStart(2, "0")
//     const day = String(now.getDate()).padStart(2, "0")
//     return `${year}-${month}-${day}`
//   }

//   const checkTodayJournal = async (forceRefresh = false) => {
//     setIsLoading(true)
//     setError(null)
//     const today = getTodayDate()
//     setTodayDate(today)

//     try {
//       const params = new URLSearchParams({ storyDate: today })

//       if (forceRefresh) params.append('refresh', 'true')      

//       const response = await fetch(`/api/story?storyDate=${today}`,{
//         credentials: "include"
//       })

//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
//       const data = await response.json()

//       const hasJournal = data !== null && data.date && data.content
//       setHasJournalToday(hasJournal)
//       console.log(`Journal check for ${today}:`, hasJournal ? 'Found' : 'Not found')
//       onStatusChange?.(hasJournal)
//     } catch (error) {
//       console.error("Error checking today journal:", error)
//       setError(error instanceof Error ? error.message : "Unknown error")
//       setHasJournalToday(false)
//       onStatusChange?.(false)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     checkTodayJournal()
//   }, [])

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const currentDate = getTodayDate()
//       if (currentDate !== todayDate) {
//         console.log("Date changed, refreshing journal status")
//         checkTodayJournal()
//       }
//     }, 60000)
    
//     return () => clearInterval(interval)
//   }, [todayDate])

//   useEffect(() => {
//     if (refreshTrigger && refreshTrigger > 0) {
//       console.log("Refresh trigger activated, force refreshing journal status")
//       checkTodayJournal(true)
//     }
//   }, [refreshTrigger])

//   if (isLoading) {
//     return (
//       <>
//         <Box width="336px">
//           <Card.Root bg="bg.canvas">
//             <Box p={4}>
//               <HStack gap={3}>
//                 <SkeletonCircle size="6" border="1px solid" borderColor="gray.600"/>
//                 <Skeleton flex="1" height="4" border="1px solid" borderColor="gray.600"/>
//               </HStack>
//               <Skeleton mt={2} height="4" border="1px solid" borderColor="gray.600"/>
//               <Skeleton mt={2} height="4" border="1px solid" borderColor="gray.600"/>
//             </Box>
//           </Card.Root>
//         </Box>
//       </>
//     )
//   }

//   if (error) {
//     return (
//       <Box width="336px">
//         <Card.Root bg="bg.canvas">
//           <Box p={4}>
//             <VStack align="start" gap={2}>
//               <HStack gap={3}>
//                 <Status.Root size="sm" colorPalette="red">
//                   <Status.Indicator />
//                 </Status.Root>
//                 <Text fontWeight="semibold" fontSize="sm" color="red.600">
//                   Error Loading Status
//                 </Text>
//               </HStack>
//               <Text fontSize="xs" color="red.500">
//                 {error}
//               </Text>
//             </VStack>
//           </Box>
//         </Card.Root>
//       </Box>
//     )
//   }

//   return (
//     <>
//       <Box width={{ base: "260px", md: "300px" }}>
//         <Card.Root bg="bg.canvas" border="1px solid" borderColor={hasJournalToday ? "brand.500" : "orange.600"}>
//           <Box p={{ base: 2, md: 4 }}>
//             <VStack align="start" gap={2} display={{ base: "none", md: "flex" }}>
//               <HStack gap={3}>
//                 <Status.Root size="lg" colorPalette={hasJournalToday ? "green" : "orange"}>
//                   <Status.Indicator />
//                 </Status.Root>
//                 <Text textStyle="headingStatusWidget" color={hasJournalToday ? "green.600" : "orange.600"}>
//                   { hasJournalToday ? "Sudah Menulis Cerita" : "Belum Menulis Cerita" }
//                 </Text>
//               </HStack>
//               <Text textStyle="contentStatusWidget">
//                 { hasJournalToday ? "Bagus, kamu berhasil menulis cerita hari ini." : "Belum terlambat, tulislah satu cerita sebelum hari berganti." }
//               </Text>
//               <Text textStyle="infoStatusWidget" color="gray.500">
//                 Terakhir dicek: {new Date().toLocaleTimeString('id-ID', { hour: "2-digit", minute: "2-digit" })}
//               </Text>
//             </VStack>            
//           </Box>
//         </Card.Root>
//       </Box>
//     </>
//   )
// }

/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
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
  const { data: session, status } = useSession()

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
    // Only check if user is fully authenticated with spreadsheet
    if (status === "authenticated" && session?.user?.spreadsheetId) {
      checkTodayJournal()
    } else if (status === "authenticated" || status === "unauthenticated") {
      // Stop loading for resolved auth states
      setIsLoading(false)
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

  // Loading state - only show when NextAuth is loading
  if (status === "loading") {
    return (
      <Box width="336px">
        <Card.Root bg="bg.canvas">
          <Box p={4}>
            <HStack gap={3}>
              <SkeletonCircle size="6" border="1px solid" borderColor="gray.600"/>
              <Skeleton flex="1" height="4" border="1px solid" borderColor="gray.600"/>
            </HStack>
            <Skeleton mt={2} height="4" border="1px solid" borderColor="gray.600"/>
            <Skeleton mt={2} height="4" border="1px solid" borderColor="gray.600"/>
          </Box>
        </Card.Root>
      </Box>
    )
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return (
      <Box width="336px">
        <Card.Root bg="bg.canvas">
          <Box p={4}>
            <VStack align="start" gap={2}>
              <HStack gap={3}>
                <Status.Root size="sm" colorPalette="gray">
                  <Status.Indicator />
                </Status.Root>
                <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                  Please Login
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                Login to start journaling
              </Text>
            </VStack>
          </Box>
        </Card.Root>
      </Box>
    )
  }

  // Authenticated but no spreadsheet yet
  if (status === "authenticated" && !session?.user?.spreadsheetId) {
    return (
      <Box width="336px">
        <Card.Root bg="bg.canvas">
          <Box p={4}>
            <VStack align="start" gap={2}>
              <HStack gap={3}>
                <Status.Root size="sm" colorPalette="blue">
                  <Status.Indicator />
                </Status.Root>
                <Text fontWeight="semibold" fontSize="sm" color="blue.600">
                  Setting Up Journal
                </Text>
              </HStack>
              <Text fontSize="xs" color="blue.500">
                Preparing your journal space...
              </Text>
            </VStack>
          </Box>
        </Card.Root>
      </Box>
    )
  }

  // Loading journal data
  if (isLoading) {
    return (
      <Box width="336px">
        <Card.Root bg="bg.canvas">
          <Box p={4}>
            <HStack gap={3}>
              <SkeletonCircle size="6" border="1px solid" borderColor="gray.600"/>
              <Skeleton flex="1" height="4" border="1px solid" borderColor="gray.600"/>
            </HStack>
            <Skeleton mt={2} height="4" border="1px solid" borderColor="gray.600"/>
            <Skeleton mt={2} height="4" border="1px solid" borderColor="gray.600"/>
          </Box>
        </Card.Root>
      </Box>
    )
  }

  // Error state
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

  // Normal journal status
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
                { hasJournalToday ? "Sudah Menulis Cerita" : "Belum Menulis Cerita" }
              </Text>
            </HStack>
            <Text textStyle="contentStatusWidget">
              { hasJournalToday ? "Bagus, kamu berhasil menulis cerita hari ini." : "Belum terlambat, tulislah satu cerita sebelum hari berganti." }
            </Text>
            <Text textStyle="infoStatusWidget" color="gray.500">
              Terakhir dicek: {new Date().toLocaleTimeString('id-ID', { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </VStack>            
        </Box>
      </Card.Root>
    </Box>
  )
}