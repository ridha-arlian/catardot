/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useSession } from "next-auth/react"
import { BookOpen } from "lucide-react"
import { toaster } from "@/components/ui/toaster"
import { useEffect, useState, useRef } from "react"
import { getRandomPrompts } from "@/app/utils/prompt"
import { motion, AnimatePresence } from "framer-motion"
import { History } from "@/app/components/journal/history"
import { TimeWidget } from "@/app/components/journal/timeWidget"
import { StatusWidget } from "@/app/components/journal/statusWidget"
import { createClient, setSupabaseAuth } from "@/utils/supabase/supabase.client"
import { Box, VStack, HStack, Heading, Text, Button, Textarea, Center, Skeleton, useDisclosure, SkeletonCircle } from "@chakra-ui/react"

const MotionBox = motion.create(Box)

interface StoryProps { onJournalSaved?: (journalData: any) => void }

export const Story = ({ onJournalSaved }: StoryProps) => {
  const [isLoading, setIsLoading] = useState(false)
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
  const { data: session, status } = useSession()
  const [supabase] = useState(() => createClient())
  const [isSettingUpSpreadsheet, setIsSettingUpSpreadsheet] = useState(false)
  const [isSpreadsheetReady, setIsSpreadsheetReady] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState(0)
  const [isEditMode, setIsEditMode] = useState(false)
  const hasWrittenToday = Boolean(existingJournal?.content)
  const [spreadsheetCreatedTrigger, setSpreadsheetCreatedTrigger] = useState(0)
  
  const [fabStatus, setFabStatus] = useState<boolean | null>(null)
  const [fabLoading, setFabLoading] = useState(true)

  const setupAttempted = useRef(false)
  const setupInProgress = useRef(false)

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
    if (!response.ok) throw new Error(data.error || "Failed to save story")
    return data
  }

  const checkExistingJournal = async (date: string) => {
    if (!session) throw new Error("User not authenticated")
    if (!date) return { exists: false }

    setIsCheckingExisting(true)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/story?storyDate=${date}`, { credentials: "include" })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()

      if (data && data.content) {
        const journalData = { 
          storyDate: date, 
          content: data.content 
        }
      
        setExistingJournal(journalData)
        setTodayEntry(data.content)
        setStoryContent("")
        setIsEditMode(false)
        setFabStatus(true)
      } else {
        setExistingJournal(null)
        setTodayEntry("")
        setStoryContent("")
        setIsEditMode(false)
        setFabStatus(false)
      }
      setLastCheckedDate(date)
    } catch (error) {
      setExistingJournal(null)
      setTodayEntry("")
      setStoryContent("")
      setIsEditMode(false)
      setFabStatus(false)
    } finally {
      setIsCheckingExisting(false)
      setIsLoading(false)
      setFabLoading(false)
    }
  }

  const showEmptyContentWarning = () => {
    toaster.create({
      title: "Empty Story",
      description: "Please write something before saving your story",
      type: "warning",
      duration: 5000,
      closable: true,
    })
  }

  const createToasterPromise = (savePromise: Promise<any>, successTitle: string, loadingTitle: string) => {
    return toaster.promise(savePromise, {
      success: {
        title: successTitle,
        description: successTitle.includes("Draft") ? "Your draft has been saved" : "Your story has been saved successfully",
        duration: 5000,
        closable: true,
      },
      error: {
        title: successTitle.includes("Draft") ? "Failed to Save Draft" : "Failed to Save Story",
        description: successTitle.includes("Draft") ? "An error occurred while saving your draft" : "An error occurred while saving. Please try again",
        duration: 5000,
        closable: true,
      },
      loading: {
        title: loadingTitle,
        description: loadingTitle.includes("Draft") ? "Saving your draft..." : "Saving your story..."
      },
    })
  }

  const handleSaveStory = async () => {
    if (!storyContent.trim() || !selectedDate) {
      showEmptyContentWarning()
      return
    }

    const isUpdate = Boolean(todayEntry)
    const savePromise = saveStoryToAPI(storyContent, selectedDate)
    createToasterPromise(savePromise, isUpdate ? "Story Updated Successfully!" : "Story Saved Successfully!", "Saving...")

    try {
      const result = await savePromise
      const updatedContent = storyContent
      
      const journalData = { 
        storyDate: selectedDate, 
        content: updatedContent 
      }
      
      setExistingJournal(journalData)
      setTodayEntry(updatedContent)
      setStoryContent("")
      setIsEditMode(false)
      setFabStatus(true)
      setIsLoading(false)
      setIsCheckingExisting(false)
      
      if (!isUpdate) {
        refreshPrompts()
      }
      
      onJournalSaved?.(result)
      setLastSaveTime(Date.now()) 
    } catch (error) {
      console.error("Error saving story: ", error)
    }
  }

  const editTodayEntry = () => {
    const contentToEdit = existingJournal?.content || todayEntry || ""
    setStoryContent(contentToEdit)
    setIsEditMode(true)
    setFabStatus(false)
  }
  
  const setupSpreadsheet = async () => {
    if (setupInProgress.current) return
    setupInProgress.current = true
    
    const setupPromise = (async () => {
      const response = await fetch("/api/sheets", { 
        method: "POST",
        credentials: "include"
      })
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      if (!data.spreadsheetId) throw new Error("No spreadsheet ID returned")
      
      setupAttempted.current = true
      setIsSpreadsheetReady(true)
      setSpreadsheetCreatedTrigger(prev => prev + 1)
      return data
    })()

    toaster.promise(setupPromise, {
      success: {
        title: "Journal Ready!",
        description: "Your personal journal spreadsheet has been created successfully.",
        duration: 5000,
        closable: true,
      },
      error: {
        title: "Setup Failed",
        description: "There was an issue setting up your journal.",
        duration: 10000,
        closable: true,
        action: {
          label: "Retry Setup",
          onClick: () => {
            setupAttempted.current = false
            setupInProgress.current = false
            setupSpreadsheet()
          }
        }
      },
      loading: {
        title: "Setting Up Your Journal",
        description: "Creating your personal journal space..."
      },
    })

    try {
      await setupPromise
    } catch (error) {
      setupInProgress.current = false
    } finally {
      setupInProgress.current = false
    }
  }

  const handleStatusChange = (hasJournal: boolean) => {
    setJournalStatus(hasJournal)
    if (fabStatus !== hasJournal) {
      setFabStatus(hasJournal)
    }
  }

  useEffect(() => {
    if (session?.supabaseAccessToken) {
      setSupabaseAuth(supabase, session.supabaseAccessToken)
    }
  }, [session, supabase])
  
  useEffect(() => {
    if (refreshTrigger > 0 && selectedDate) {
      const shouldSkipRefresh = existingJournal?.storyDate === selectedDate && existingJournal?.content && Date.now() - lastSaveTime < 2000
      if (!shouldSkipRefresh) checkExistingJournal(selectedDate)
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
    if (status === "authenticated") {
      if (session?.user?.spreadsheetId) {
        setIsSpreadsheetReady(true)
      } else {
        setIsSpreadsheetReady(false)
        setFabLoading(true)
      }
    } else {
      setFabLoading(true)
    }
  }, [status, session?.user?.spreadsheetId])

  useEffect(() => {
    if (selectedDate && isSpreadsheetReady && session?.accessToken) {
      checkExistingJournal(selectedDate)
    }
  }, [selectedDate, isSpreadsheetReady, session?.accessToken])
  
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email && !session.user.spreadsheetId && !setupAttempted.current && !isSettingUpSpreadsheet) {
      setupSpreadsheet()
    }
  }, [status, session?.user?.spreadsheetId, session?.user?.email])

  useEffect(() => {
    if (status === "unauthenticated") {
      setupAttempted.current = false
      setupInProgress.current = false
      setIsSpreadsheetReady(false)
      setFabStatus(null)
      setFabLoading(true)
    }
  }, [status])

  useEffect(() => {
    if (isSpreadsheetReady && selectedDate) {
      console.log("Spreadsheet ready, will check journal status")
    }
  }, [isSpreadsheetReady, selectedDate])

  useEffect(() => {
    setIsEditMode(false)
  }, [selectedDate])

  useEffect(() => {
    if (status === "unauthenticated") setIsEditMode(false)
  }, [status])

  useEffect(() => {
    if (existingJournal?.content && todayEntry !== existingJournal.content) {
      setTodayEntry(existingJournal.content)
    }
  }, [existingJournal?.content, todayEntry])

  const displayStatus = fabStatus !== null ? fabStatus : journalStatus
  
  const cancelEdit = () => {
    setStoryContent("")
    setIsEditMode(false)
    setFabStatus(true)
  }
  
  return (
    <>
      <Box mt="80px" bg="bg.canvas">
        
        {/* Header */}
        <Box as="header">
          <Box maxW="4xl" mx="auto" px={{ base: 1, sm: 1, md: 6 }}>
            <HStack justify="space-between" align="start" flexDir={{ base: "column", md: "row" }} w="100%">
              <VStack align={{ base: "center", md: "start" }} gap={1} mt={{ base: 5, md: 10 }} w="100%">
                <TimeWidget onDateChange={setSelectedDate} />
              </VStack>

              <VStack align="end" gap={2} mt={{ base: 5, md: 10 }} display={{ base: "none", md: "flex" }}>
                <StatusWidget refreshTrigger={refreshTrigger} onStatusChange={handleStatusChange} onSpreadsheetCreated={spreadsheetCreatedTrigger}/>
              </VStack>
            </HStack>
          </Box>
        </Box>

        {/* Main Content */}
        <Box as="main" maxW="4xl" mx="auto" px={6} py={6}>
          <VStack gap={8} align="stretch" mb={12}>
            <Box bg="bg.canvas" border="2px solid" borderColor="sage.500" shadow="sm" rounded="md" p={8}>
              {isLoading ? (
                <VStack gap={6} align="stretch">
                  <Skeleton height="40px" border="1px solid" borderColor="gray.600" />
                  <Skeleton height="40px" border="1px solid" borderColor="gray.600" />
                  <Skeleton height="120px" border="1px solid" borderColor="gray.600"/>
                  <Skeleton height="40px" border="1px solid" borderColor="gray.600"/>
                </VStack>
              ) : isEditMode ? (
                <VStack gap={6} align="stretch">
                  <VStack gap={3} textAlign="center">
                    <Heading textStyle="headingTextStoryBoxEdit" color={{ base:"brand.600", _dark:"white" }}>
                      {hasWrittenToday ? "Edit Today's Story" : "What's Your Story Today?"}
                    </Heading>
                    <Text color="gray.500" textStyle="subHeadingTextStoryBoxEdit">
                      {hasWrittenToday ? "Update your story for today." : "Write One Meaningful Moment From Today."}
                    </Text>
                  </VStack>
                  
                  <VStack align="center">
                    <Textarea textStyle="placeholderStoryBoxEdit" placeholder={!hasWrittenToday ? prompts.promptContent : "Write your story here..."} value={storyContent} onChange={(e) => setStoryContent(e.target.value)} minH="120px" autoresize/>
                    <HStack gap={3}>
                      <Button variant="outline" border="1px solid" borderColor="sage.500" _hover={{ bg: { base:"brand.100", _dark:"sage.100" }, color:{ _dark:"fg.default" }}} textStyle="ButtonStoryBoxEdit" onClick={handleSaveStory} disabled={!storyContent.trim() || isCheckingExisting}>
                        {hasWrittenToday ? "Update Story" : "Save Today's Story"}
                      </Button>
                      {hasWrittenToday && (
                        <Button variant="outline" border="1px solid" borderColor="gray.500" _hover={{ bg: "gray.100" }} textStyle="ButtonStoryBoxEdit" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      )}
                    </HStack>
                  </VStack>
                </VStack>
              ) : hasWrittenToday ? (
                <VStack gap={6} align="stretch">
                  <VStack gap={3} textAlign="center">
                    <Heading textStyle="headingTextStoryBoxEdit" color={{ base:"brand.600", _dark:"white" }}>
                      Today&apos;s Story Complete
                    </Heading>
                    <Text color="gray.500" textStyle="subHeadingTextStoryBoxEdit">
                      You&apos;ve captured today&apos;s moment.<br/>See you tomorrow!
                    </Text>
                  </VStack>

                  <Box rounded="md" p={6} border="1px solid" borderColor="sage.500" textStyle="textStoryBoxEdit" fontStyle="italic" textAlign="center">
                    {todayEntry === "" ? <Skeleton height="40px" /> : `"${todayEntry}"`}
                  </Box>

                  <Center>
                    <Button 
                      variant="outline" 
                      border="1px solid" 
                      borderColor="sage.500" 
                      _hover={{ bg: { base:"brand.100", _dark:"sage.500" }, color:{ _dark:"black" }}} 
                      textStyle="ButtonStoryBoxEdit" 
                      onClick={editTodayEntry}
                    >
                      Edit Today&apos;s Story
                    </Button>
                  </Center>
                </VStack>
              ) : (
                <VStack gap={6} align="stretch">
                  <VStack gap={3} textAlign="center">
                    <Heading textStyle="headingTextStoryBoxEdit" color={{ base:"brand.600", _dark:"white" }}>
                      What&apos;s Your Story Today?
                    </Heading>
                    <Text color="gray.500" maxW="md" mx="auto" textStyle="subHeadingTextStoryBoxEdit">
                      Write One Meaningful Moment From Today.
                    </Text>
                  </VStack>

                  <VStack align="center">
                    <Textarea textStyle="placeholderStoryBoxEdit" placeholder={prompts.promptContent} value={storyContent} onChange={(e) => setStoryContent(e.target.value)} minH="120px" autoresize/>
                    <Button variant="outline" border="1px solid" borderColor="sage.500" _hover={{ bg: { base:"brand.100", _dark:"sage.100" }, color:{ _dark:"fg.default" }}} textStyle="ButtonStoryBoxEdit" onClick={handleSaveStory} disabled={!storyContent.trim() || isCheckingExisting}>
                      Save Today&apos;s Story
                    </Button>
                  </VStack>
                </VStack>
              )}
            </Box>
          </VStack>
          
          {/* Tombol Past Entries khusus mobile */}
          <Box mb={6}>
            <Button width="100%" border="2px solid" _hover={{ bg: { base:"brand.100", _dark:"sage.500" }, color:{ _dark:"black" }}} borderColor="sage.500" shadow="sm" variant="outline" onClick={() => setShowPastEntries(!showPastEntries)} textStyle="buttonHistory">
              <BookOpen size={20} />
              {showPastEntries ? "Hide Past Stories" : "View Past Stories"}
            </Button>
          </Box>
          
          {showPastEntries && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
              <History refreshTrigger={refreshTrigger} />
            </motion.div>
          )}
        </Box>
          
        {/* Floating Action Button khusus mobile */}
        <Box position="fixed" bottom="24px" right="24px" zIndex={50} display={{ base: "block", md: "none" }}>
          {fabLoading ? (
            <SkeletonCircle size="12" border="1px solid" borderColor="gray.600" />
          ) : (
            <MotionBox textStyle="floatingButtonText" initial={{ width: 40, height: 40, borderRadius: "50%" }} animate={ open ? { width: "auto", height: "56", borderRadius: "16px" } : { width: 40, height: 40, borderRadius: "50%" }} transition={{ damping: 20 }} border="2px solid" bg="bg.canvas" borderColor={ displayStatus ? "brand.500" : "orange.500"} color="white" overflow="hidden" cursor="pointer" display="flex" alignItems="center" justifyContent={open ? "flex-start" : "center"} px={open ? 1 : 0} py={open ? 1 : 0} shadow="sm" onClick={onToggle}>
              <AnimatePresence>
                {open && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.1 }} style={{ marginLeft: "8px", whiteSpace: "nowrap" }}>
                    {displayStatus ? "Great, you've already written today." : "It's not too late, write your story now."}
                  </motion.div>
                )}
              </AnimatePresence>
            </MotionBox>
          )}
        </Box>
      </Box>
    </>
  )
}