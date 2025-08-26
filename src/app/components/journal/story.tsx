/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { BookOpen, Sparkles } from "lucide-react"
import { toaster } from "@/components/ui/toaster"
import { getRandomPrompts } from "@/app/utils/prompt"
import { motion, AnimatePresence } from "framer-motion"
import { History } from "@/app/components/journal/history"
import { TimeWidget } from "@/app/components/journal/timeWidget"
import { StatusWidget } from "@/app/components/journal/statusWidget"
import { createClient, setSupabaseAuth } from "@/utils/supabase/supabase.client"
import { Box, VStack, HStack, Heading, Text, Button, Textarea, Center, Skeleton, useDisclosure } from "@chakra-ui/react"

const MotionBox = motion.create(Box)

interface StoryProps { onJournalSaved?: (journalData: any) => void }

export const Story = ({ onJournalSaved }: StoryProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [todayEntry, setTodayEntry] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [storyContent, setStoryContent] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [lastCheckedDate, setLastCheckedDate] = useState("")
  const [prompts, setPrompts] = useState({ promptContent: "" })
  const [showPastEntries, setShowPastEntries] = useState(false)
  const [existingJournal, setExistingJournal] = useState<any>(null)
  const [isCheckingExisting, setIsCheckingExisting] = useState(false)
  const [journalStatus, setJournalStatus] = useState<boolean | null>(null)
  const { data: session } = useSession()
  const [supabase] = useState(() => createClient())
  const [isSettingUpSpreadsheet, setIsSettingUpSpreadsheet] = useState(false)
  const hasWrittenToday = Boolean(existingJournal)

  const { open, onToggle } = useDisclosure()

  const refreshPrompts = () => setPrompts(getRandomPrompts())

  const saveStoryToAPI = async (content: string, date: string, method: "POST" | "PUT" = "POST") => {
    if (!session) throw new Error("User not authenticated")

    const response = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        content,
        storyDate: date
      }),
      credentials: "include"
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Gagal menyimpan catatan")
    return data
  }

  const checkExistingJournal = async (date: string) => {
    if (!session) throw new Error("User not authenticated")
    if (!date) return { exists: false }

    setIsCheckingExisting(true)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/story?storyDate=${date}`, { credentials: "include" })
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`) }
      const data = await response.json()

      if (data && data.content) {
        setExistingJournal({ storyDate: date })
        setTodayEntry(data.content)
        setStoryContent(data.content)
      } else {
        setExistingJournal(null)
        setTodayEntry("")
        setStoryContent("")
      }
      setLastCheckedDate(date)
    } catch (error) {
      console.error("Error checking existing journal:", error)
      setExistingJournal(null)
      setTodayEntry("")
      setStoryContent("")
    } finally {
      setIsCheckingExisting(false)
      setIsLoading(false)
    }
  }

  const triggerGlobalRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
    console.log("Story component triggering global refresh")
  }

  const showEmptyContentWarning = () => {
    toaster.create({
      title: "Catatan Kosong",
      description: "Mohon isi catatan terlebih dahulu",
      type: "warning",
      duration: 5000,
      closable: true,
    })
  }

  const createToasterPromise = (savePromise: Promise<any>, successTitle: string, loadingTitle: string) => {
    return toaster.promise(savePromise, {
      success: {
        title: successTitle,
        description: successTitle.includes("Draft") ? "Catatan Anda telah tersimpan sementara" : "Cerita Anda telah tersimpan dengan baik",
        duration: 5000,
        closable: true,
      },
      error: {
        title: successTitle.includes("Draft") ? "Gagal Menyimpan Catatan Sementara" : "Gagal Menyimpan Catatan",
        description: successTitle.includes("Draft") ? "Terjadi kesalahan saat menyimpan catatan sementara" : "Terjadi kesalahan saat menyimpan. Silakan coba lagi",
        duration: 5000,
        closable: true,
      },
      loading: {
        title: loadingTitle,
        description: loadingTitle.includes("Draft") ? "Sedang menyimpan catatan sementara Anda" : "Sedang menyimpan catatan Anda"
      },
    })
  }

  const handleSaveStory = async () => {
    if (!storyContent.trim() || !selectedDate) {
      showEmptyContentWarning()
      return
    }

    const isUpdate = Boolean(existingJournal)
    const savePromise = saveStoryToAPI(storyContent, selectedDate)
    
    createToasterPromise(
      savePromise,
      isUpdate ? "Catatan Berhasil Diperbarui!" : "Catatan Berhasil Disimpan!",
      "Menyimpan..."
    )

    try {
      const result = await savePromise
      
      setExistingJournal({ storyDate: selectedDate })
      setTodayEntry(storyContent)
      setLastCheckedDate("")
      
      if (!isUpdate) {
        setStoryContent("")
        refreshPrompts()
      }
      
      onJournalSaved?.(result)
      triggerGlobalRefresh()
      
      console.log(`Journal ${isUpdate ? 'updated' : 'saved'} successfully: `, result)
      
    } catch (error) {
      console.error("Error saving story: ", error)
    }
  }

  const handleSaveDraft = async () => {
    if (!storyContent.trim()) {
      toaster.create({
        title: "Content Kosong",
        description: "Tidak ada content untuk disimpan sebagai catatan sementara",
        type: "warning",
      })
      return
    }

    const saveDraftPromise = saveStoryToAPI(storyContent, selectedDate)
    createToasterPromise(saveDraftPromise, "Catatan Disimpan Sementara!", "Menyimpan Catatan...")

    try {
      const result = await saveDraftPromise
      console.log("Draft saved: ", result)
      
      setExistingJournal({ storyDate: selectedDate })
      setTodayEntry(storyContent)
      triggerGlobalRefresh()
      
    } catch (error) {
      console.error("Error saving draft:", error)
    }
  }

  // const handleContinueDraft = () => {
  //   toaster.create({
  //     title: "Fitur Segera Hadir",
  //     description: "Fitur Teruskan Menulis akan segera tersedia!",
  //     type: "info",
  //   })
  // }

  const editTodayEntry = () => {
    setExistingJournal(null)
    setTodayEntry("")
    setStoryContent(todayEntry || "")
  }

  useEffect(() => {
    if (session?.supabaseAccessToken) {
      setSupabaseAuth(supabase, session.supabaseAccessToken)
    }
  }, [session, supabase])
  
  useEffect(() => {
    if (refreshTrigger > 0 && selectedDate) {
      console.log("Refresh trigger detected, re-checking existing journal")
      checkExistingJournal(selectedDate)
    }
  }, [refreshTrigger])

  useEffect(() => {
    refreshPrompts()
  }, [])

  useEffect(() => {
    if (selectedDate && session?.user?.spreadsheetId && session?.accessToken) {
      checkExistingJournal(selectedDate)
    }
  }, [selectedDate, session?.user?.spreadsheetId, session?.accessToken])
  
  useEffect(() => {
    const setupSpreadsheet = async () => {
      if (session?.user?.email && !session.user.spreadsheetId && !isSettingUpSpreadsheet) {
        setIsSettingUpSpreadsheet(true)
        try {
          const response = await fetch("/api/sheets", { method: "POST" })
          const data = await response.json()
          
          if (data.spreadsheetId) {
            console.log("Spreadsheet ready:", data.spreadsheetId)
            toaster.create({
              title: "Journal Ready!",
              description: "Your personal journal spreadsheet has been created.",
              type: "success"
            })
          }
        } catch (error) {
          console.error("Setup failed:", error)
          toaster.create({
            title: "Setup Failed",
            description: "There was an issue setting up your journal. Please try again.",
            type: "error"
          })
        } finally {
          setIsSettingUpSpreadsheet(false)
        }
      }
    }

    if (session?.user) { setupSpreadsheet() }
  }, [session, isSettingUpSpreadsheet])

  if (isSettingUpSpreadsheet) {
    return (
      <Center minH="200px">
        <VStack gap={4}>
          <Skeleton height="20px" width="200px" />
          <Text>
            Setting up your journal...
          </Text>
        </VStack>
      </Center>
    )
  }
  
  return (
    <>
      <Box mt="80px" bg="bg.canvas">
        {/* Header */}
        <Box as="header">
          <Box maxW="4xl" mx="auto" px={6}>
            <HStack justify="space-between" align="center">
              <VStack align="start" gap={1} mt={20}>
                <TimeWidget onDateChange={setSelectedDate}/>
              </VStack>
              <VStack align="end" gap={2} mt="20px" display={{ base: "none", md: "flex" }}>
                <Button variant="outline" onClick={() => setShowPastEntries(!showPastEntries)}>
                  <BookOpen size={16} />
                  {showPastEntries ? "Hide" : "View"} Past Entries
                </Button>
                <StatusWidget refreshTrigger={refreshTrigger} onStatusChange={setJournalStatus}  />
              </VStack>
            </HStack>
          </Box>
        </Box>

        {/* Main Content */}
        <Box as="main" maxW="4xl" mx="auto" px={6} py={6}>
          <VStack gap={8} align="stretch" mb={12}>
            <Box bg="bg.canvas" borderWidth={1} borderColor="gray.200" shadow="sm" rounded="md" p={8}>
              {isLoading ? (
                <VStack gap={6} align="stretch">
                  <Skeleton height="40px" width="120px" />
                  <Skeleton height="120px" />
                  <Skeleton height="40px" width="170px" />
                </VStack>
              ) : !hasWrittenToday ? (
                <VStack gap={6} align="stretch">
                  <VStack gap={3} textAlign="center">
                    <Center w={12} h={12} bg="blue.100" rounded="full">
                      <Sparkles size={24} color="#3182CE" />
                    </Center>
                    <Heading size="md" fontFamily="serif">
                      What&apos;s your sentence for today?
                    </Heading>
                    <Text color="gray.500" maxW="md" mx="auto">
                      Write one meaningful sentence about something that happened today. It could be something you noticed, learned, or experienced.
                    </Text>
                  </VStack>

                  <VStack gap={4} align="stretch">
                    <Textarea placeholder={prompts.promptContent} value={storyContent} onChange={(e) => setStoryContent(e.target.value)} minH="120px" disabled={existingJournal} fontSize="lg" resize="none" maxLength={280} autoresize/>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">
                        {storyContent.length}/280 characters
                      </Text>
                      <Button colorScheme="blue" width="170px" onClick={handleSaveStory} disabled={!storyContent.trim() || existingJournal || isCheckingExisting}>
                        {existingJournal ? "Catatan Sudah Ada" : "Save Today\'s Sentence"}
                      </Button>
                    </HStack>
                    <Button variant="outline" width="170px" colorScheme="gray" onClick={handleSaveDraft} disabled={!storyContent.trim() || existingJournal || isCheckingExisting}>
                      Save Draft
                    </Button>
                  </VStack>
                </VStack>
              ) : (
                <VStack gap={6} align="stretch">
                  <VStack gap={3} textAlign="center">
                    <Center w={12} h={12} bg="blue.100" rounded="full">
                      <Sparkles size={24} color="#3182CE" />
                    </Center>
                    <Heading size="md" fontFamily="serif">
                      Today&apos;s Entry Complete
                    </Heading>
                    <Text color="gray.500">
                      You&apos;ve captured today&apos;s moment. See you tomorrow!
                    </Text>
                  </VStack>

                  <Box bg="gray.100" rounded="md" p={6} borderWidth={1} borderColor="gray.200" fontStyle="italic">
                    {todayEntry === "" ? <Skeleton height="40px" /> : `"${todayEntry}"`}
                  </Box>

                  <Center>
                    <Button variant="outline" colorScheme="blue" onClick={editTodayEntry}>
                      Edit Today&apos;s Entry
                    </Button>
                  </Center>
                </VStack>
              )}
            </Box>
          </VStack>

          {showPastEntries && (
            <History refreshTrigger={refreshTrigger}/>
          )}
        </Box>

        {/* Floating Action Button khusus mobile */}
        <Box position="fixed" bottom="24px" right="24px" zIndex={50} display={{ base: "block", md: "none" }}>
          <MotionBox textStyle="floatingButtonText" initial={{ width: 40, height: 40, borderRadius: "50%" }} animate={ open ? { width: "auto", height: "56", borderRadius: "16px" } : { width: 40, height: 40, borderRadius: "50%" }} transition={{ damping: 20 }} border="2px solid" bg="bg.canvas" borderColor={ journalStatus ? "brand.500" : "orange.500"} color="white" overflow="hidden" cursor="pointer" display="flex" alignItems="center" justifyContent={open ? "flex-start" : "center"} px={open ? 1 : 0} py={open ? 1 : 0} shadow="sm" onClick={onToggle}>
            <AnimatePresence>
              {open && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.1 }} style={{ marginLeft: "8px", whiteSpace: "nowrap" }}>
                  {journalStatus ? "Bagus, kamu sudah menulis hari ini." : "Belum terlambat, ayo tulis cerita."}
                </motion.div>
              )}
            </AnimatePresence>
          </MotionBox>
        </Box>
      </Box>
    </>
  )
}