/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { Box, Textarea, Button, VStack, HStack, Text, Input, Card } from '@chakra-ui/react'
import { useColorModeValue } from "@/components/ui/color-mode"
import { toaster } from "@/components/ui/toaster"
import { useEffect, useState } from 'react'
import { FiCalendar, FiSave, FiFileText, FiEdit } from 'react-icons/fi'
import { getRandomPrompts } from '../../utils/prompt'

interface StoryWidgetProps {
  selectedDate: string
  onDateChange: (date: string) => void
  onJournalSaved?: (journalData: any) => void
}

export function StoryWidget({ selectedDate, onDateChange, onJournalSaved }: StoryWidgetProps) {
  const [storyContent, setStoryContent] = useState('')
  const [prompts, setPrompts] = useState({ promptContent: '' })
  const [existingJournal, setExistingJournal] = useState<any>(null)
  const [isCheckingExisting, setIsCheckingExisting] = useState(false)
  const [lastCheckedDate, setLastCheckedDate] = useState('')
  
  const cardBg = useColorModeValue('white', 'gray.800')
  
  const refreshPrompts = () => setPrompts(getRandomPrompts())

  const saveStoryToAPI = async (content: string, date: string) => {
    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          storyDate: date,
          userId: 'user123'
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan catatan')
      }
      return data
    } catch (error) {
      console.error('Error saving story:', error)
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
        description: successTitle.includes('Draft') ? "Catatan Anda telah tersimpan sementara" : "Cerita Anda telah tersimpan dengan baik",
        duration: 5000,
        closable: true,
      },
      error: {
        title: successTitle.includes('Draft') ? "Gagal Menyimpan Catatan Sementara" : "Gagal Menyimpan Catatan",
        description: successTitle.includes('Draft') ? "Terjadi kesalahan saat menyimpan catatan sementara" : "Terjadi kesalahan saat menyimpan. Silakan coba lagi",
        duration: 5000,
        closable: true,
      },
      loading: {
        title: loadingTitle,
        description: loadingTitle.includes('Draft') ? "Sedang menyimpan catatan sementara Anda" : "Sedang menyimpan catatan Anda"
      },
    })
  }

  const handleSaveStory = async () => {
    if (!storyContent.trim()) {
      showEmptyContentWarning()
      return
    }

    const savePromise = saveStoryToAPI(storyContent, selectedDate)
    createToasterPromise(savePromise, "Catatan Berhasil Disimpan!", "Menyimpan...")

    try {
      const result = await savePromise
      setStoryContent('')
      refreshPrompts()
      setExistingJournal(result.data)
      setLastCheckedDate('')
      onJournalSaved?.(result.data)
      console.log('Story saved successfully:', result.data)
    } catch (error) {
      console.error('Error saving story:', error)
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
      console.log('Draft saved:', result.data)
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  const checkExistingJournal = async () => {
    if (lastCheckedDate === selectedDate) return

    setIsCheckingExisting(true)
    try {
      const response = await fetch(`/api/story?userId=user123&date=${selectedDate}`)
      const data = await response.json()
      setExistingJournal(data.success && data.data ? data.data : null)
      setLastCheckedDate(selectedDate)
    } catch (error) {
      console.error('Error checking existing journal:', error)
      setExistingJournal(null)
    } finally {
      setIsCheckingExisting(false)
    }
  }

  const handleContinueDraft = () => {
    toaster.create({
      title: "Fitur Segera Hadir",
      description: "Fitur Teruskan Menulis akan segera tersedia!",
      type: "info",
    })
  }

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value)
  }

  useEffect(() => {
    refreshPrompts()
  }, [])

  useEffect(() => {
    checkExistingJournal()
  }, [selectedDate, lastCheckedDate])

  return (
    <Box flex="2">
      <Card.Root bg={cardBg} shadow="lg" position="relative">
        <Card.Body>
          <VStack gap="6" align="stretch">
            <HStack gap="4">
              <Box flex="1">
                <Text mb={2} fontWeight="medium" color="gray.700">
                  <Box as={FiCalendar} display="inline" mr={2}/>
                  Tanggal
                </Text>
                <HStack justify="space-between">
                  <Input type="date" value={selectedDate} onChange={handleDateInputChange} maxW="300px"/>
                  <Button variant="outline" colorScheme="orange" onClick={handleContinueDraft} flexShrink={0}>
                    <FiEdit />
                    Teruskan Menulis
                  </Button>
                </HStack>
              </Box>
            </HStack>

            {/* Story Content */}
            <Box position="relative">
              <Text mb={2} fontWeight="medium" color="gray.700">
                <Box as={FiFileText} display="inline" mr={2} />
                Apa hal paling bermakna hari ini?
              </Text>
              <Textarea placeholder={prompts.promptContent} value={storyContent} onChange={(e) => setStoryContent(e.target.value)} minH="150px" disabled={existingJournal} autoresize/>
              {existingJournal && (
                <Box position="absolute" top="0" left="0" right="0" bottom="0" bg={cardBg} backdropFilter="blur(4px)" borderRadius="md" display="flex" alignItems="center" justifyContent="center" zIndex={10} border="2px solid" borderColor="orange.200">
                  <VStack gap={3} textAlign="center" p={6}>
                    <Box as={FiEdit} fontSize="3xl" color="orange.500" />
                    <VStack gap={1}>
                      <Text fontWeight="bold" color="orange.700" fontSize="lg">
                        Catatan Sudah Ada
                      </Text>
                      <Text fontSize="sm" color="orange.600" maxW="300px">
                        Kamu sudah menulis catatan di tanggal ini.
                      </Text>
                    </VStack>
                    {/* <Button colorScheme="orange"size="sm"onClick={handleContinueDraft}>
                      <FiEdit />
                      Lanjutkan Draft
                    </Button> */}
                  </VStack>
                </Box>
              )}
            </Box>

            {/* Action Buttons */}
            <HStack gap="4" justify="space-between" align="center">
              <Text fontSize="sm" color="gray.600">
                Jumlah kata: {storyContent.split(' ').filter(word => word.length > 0).length}
              </Text>
              <HStack gap="3">
                <Button variant="outline" width="170px" colorScheme="gray" onClick={handleSaveDraft} disabled={!storyContent.trim() || existingJournal || isCheckingExisting}>
                  <FiSave />
                  Tulis Nanti
                </Button>
                <Button colorScheme="blue" width="170px" onClick={handleSaveStory} disabled={!storyContent.trim() || existingJournal || isCheckingExisting}>
                  <FiFileText />
                  {existingJournal ? 'Catatan Sudah Ada' : 'Simpan Catatan'}
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}