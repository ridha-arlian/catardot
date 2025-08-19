/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { BookOpen, Sparkles } from "lucide-react"
import { toaster } from "@/components/ui/toaster"
import { getRandomPrompts } from "@/app/utils/prompt"
import NotAuthorizedPage from "@/app/not-authorized/page"
import { History } from "@/app/components/journal/history"
import { TimeWidget } from "@/app/components/journal/timeWidget"
import { StatusWidget } from "@/app/components/journal/statusWidget"
import { Box, VStack, HStack, Heading, Text, Button, Textarea, Center, Skeleton } from "@chakra-ui/react"

interface StoryProps {
  onDateChange: (date: string) => void
  onJournalSaved?: (journalData: any) => void
}

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

  const { data: session, status } = useSession()
  const hasWrittenToday = Boolean(existingJournal)
  const refreshPrompts = () => setPrompts(getRandomPrompts())

  const saveStoryToAPI = async (content: string, date: string) => {
    try {
      const response = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, storyDate: date }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan catatan")
      return data
    } catch (error) {
      console.error("Error saving story:", error)
      throw error
    }
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

    const savePromise = saveStoryToAPI(storyContent, selectedDate)
    createToasterPromise(savePromise, "Catatan Berhasil Disimpan!", "Menyimpan...")

    try {
      const result = await savePromise
      setStoryContent('')
      refreshPrompts()
      setExistingJournal({ storyDate: selectedDate })
      setTodayEntry(storyContent)
      setLastCheckedDate('')
      onJournalSaved?.(result.data)
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error("Error saving story:", error)
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
      console.log("Draft saved:", result.data)
    } catch (error) {
      console.error("Error saving draft:", error)
    }
  }

  const checkExistingJournal = async () => {
    if (!selectedDate) return

    setIsCheckingExisting(true)
    setIsLoading(true)
    try {
      const response = await fetch(`/api/story?storyDate=${selectedDate}`)
      const data = await response.json()
      if (data.exists) {
        setExistingJournal({ storyDate: selectedDate })
        setTodayEntry(data.story)
        setStoryContent(data.story)
      } else {
        setExistingJournal(null)
        setTodayEntry('')
        setStoryContent('')
      }
      setLastCheckedDate(selectedDate)
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
    refreshPrompts()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      checkExistingJournal()
    }
  }, [selectedDate])

  if (status === "unauthenticated" || !session) {
    return <NotAuthorizedPage />
  }

  return (
    <Box mt="60px" bg="gray.50">
      {/* Header */}
      <Box as="header">
        <Box maxW="4xl" mx="auto" px={6} py={6}>
          <HStack justify="space-between" align="center">
            <VStack align="start" gap={1}>
              <TimeWidget onDateChange={setSelectedDate}/>
            </VStack>
            <VStack align="end" gap={2} mt="20px">
              <Button variant="outline" onClick={() => setShowPastEntries(!showPastEntries)}>
                <BookOpen size={16} />
                {showPastEntries ? "Hide" : "View"} Past Entries
              </Button>
              <StatusWidget refreshTrigger={refreshTrigger} />
            </VStack>
          </HStack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box as="main" maxW="4xl" mx="auto" px={6} py={6}>
        <VStack gap={8} align="stretch" mb={12}>
          <Box bg="white" borderWidth={1} borderColor="gray.200" shadow="sm" rounded="md" p={8}>
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
          <History/>
        )}
      </Box>
    </Box>
  )
}