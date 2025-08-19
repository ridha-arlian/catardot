/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useState, useEffect } from 'react'
import { Box, VStack, HStack, Text, Textarea, Button, Card, Heading, Badge, Input } from '@chakra-ui/react'
import { useColorModeValue } from '@/components/ui/color-mode'
import { FiCalendar, FiFileText, FiEdit, FiSave } from 'react-icons/fi'
import { toaster } from '@/components/ui/toaster'
import HistoryWidgetModal from '../../modals/historyModal'
import { getRandomPrompts } from '../../utils/data/prompt'

interface StoryHistoryWidgetProps {
  selectedDate: string
  onDateChange: (date: string) => void
  onJournalSaved?: (journalData: any) => void
}

interface JournalEntry {
  storyDate: string
  content: string
}

export const StoryHistoryWidget = ({ selectedDate, onDateChange, onJournalSaved }: StoryHistoryWidgetProps) => {
  const cardBg = useColorModeValue('white', 'gray.800')
  const contentColor = useColorModeValue('gray.600', 'gray.400')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const emptyBg = useColorModeValue('gray.50', 'gray.700')

  /** --- STORY WIDGET STATE --- */
  const [storyContent, setStoryContent] = useState('')
  const [prompts, setPrompts] = useState({ promptContent: '' })
  const [existingJournal, setExistingJournal] = useState<JournalEntry | null>(null)
  const [isCheckingExisting, setIsCheckingExisting] = useState(false)
  const [lastCheckedDate, setLastCheckedDate] = useState('')

  /** --- HISTORY WIDGET STATE --- */
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [lastFetchedDate, setLastFetchedDate] = useState('')

  const refreshPrompts = () => setPrompts(getRandomPrompts())

  const getDateString = (date: string | Date) =>
    typeof date === 'string' ? date : date.toISOString().split('T')[0]

  /** --- API FUNCTIONS --- */
  const saveStoryToAPI = async (content: string, date: string) => {
    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, storyDate: date })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Gagal menyimpan catatan')
      return data
    } catch (error) {
      console.error('Error saving story:', error)
      throw error
    }
  }

  const fetchJournalByDate = async (date: string) => {
    const dateString = getDateString(date)
    if (lastFetchedDate === dateString && !existingJournal) return

    setIsLoadingHistory(true)
    try {
      const response = await fetch(`/api/story?storyDate=${encodeURIComponent(dateString)}`)
      const data = await response.json()
      if (data && data.exists) {
        setCurrentEntry({ storyDate: dateString, content: data.story })
        setExistingJournal({ storyDate: dateString, content: data.story })
      } else {
        setCurrentEntry(null)
        setExistingJournal(null)
      }
      setLastFetchedDate(dateString)
    } catch {
      setCurrentEntry(null)
      setExistingJournal(null)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  /** --- HANDLERS --- */
  const handleSaveStory = async () => {
    if (!storyContent.trim()) {
      toaster.create({ title: "Catatan Kosong", description: "Mohon isi catatan terlebih dahulu", type: "warning" })
      return
    }

    try {
      const result = await saveStoryToAPI(storyContent, selectedDate)
      setStoryContent('')
      refreshPrompts()
      setExistingJournal(result.data)
      setCurrentEntry(result.data)
      setLastCheckedDate('')
      onJournalSaved?.(result.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSaveDraft = async () => {
    if (!storyContent.trim()) return
    try {
      await saveStoryToAPI(storyContent, selectedDate)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value)
  }

  const handleSaveChanges = (updatedEntry: Partial<JournalEntry>) => {
    setCurrentEntry({
      storyDate: updatedEntry.storyDate || currentEntry?.storyDate || "",
      content: updatedEntry.content || currentEntry?.content || ""
    })
    setExistingJournal({
      storyDate: updatedEntry.storyDate || existingJournal?.storyDate || "",
      content: updatedEntry.content || existingJournal?.content || ""
    })
  }

  /** --- EFFECTS --- */
  useEffect(() => { refreshPrompts() }, [])
  useEffect(() => { fetchJournalByDate(selectedDate) }, [selectedDate])

  /** --- RENDER --- */
  return (
    <VStack gap={6} align="stretch">
      {/* --- STORY WIDGET --- */}
      <Card.Root bg={cardBg} shadow="lg" position="relative">
        <Card.Body>
          <VStack gap={3} align="stretch">
            <HStack gap={4}>
              <Box flex="1">
                <Text mb={2} fontWeight="medium" color="gray.700">
                  <Box as={FiCalendar} display="inline" mr={2}/> Tanggal
                </Text>
                <HStack justify="space-between">
                  <Input type="date" value={selectedDate} onChange={handleDateInputChange} maxW="300px"/>
                  <Button variant="outline" colorScheme="orange" onClick={() => {}} flexShrink={0}>
                    <FiEdit /> Teruskan Menulis
                  </Button>
                </HStack>
              </Box>
            </HStack>

            <Box position="relative">
              <Text mb={2} fontWeight="medium" color="gray.700">
                <Box as={FiFileText} display="inline" mr={2}/> Apa hal paling bermakna hari ini?
              </Text>
              <Textarea
                placeholder={prompts.promptContent}
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                minH="100px"
                disabled={!!existingJournal}
                autoresize
              />
              {existingJournal && (
                <Box position="absolute" top={0} left={0} right={0} bottom={0} bg={cardBg} backdropFilter="blur(4px)" borderRadius="md" display="flex" alignItems="center" justifyContent="center" zIndex={10} border="2px solid" borderColor="orange.200">
                  <VStack gap={3} textAlign="center" p={6}>
                    <Box as={FiEdit} fontSize="3xl" color="orange.500"/>
                    <Text fontWeight="bold" color="orange.700" fontSize="lg">Catatan Sudah Ada</Text>
                    <Text fontSize="sm" color="orange.600">Kamu sudah menulis catatan di tanggal ini.</Text>
                  </VStack>
                </Box>
              )}
            </Box>

            <HStack gap={3} justify="flex-end">
              <Button variant="outline" width="170px" colorScheme="gray" onClick={handleSaveDraft} disabled={!storyContent.trim() || !!existingJournal || isCheckingExisting}>
                <FiSave /> Tulis Nanti
              </Button>
              <Button colorScheme="blue" width="170px" onClick={handleSaveStory} disabled={!storyContent.trim() || !!existingJournal || isCheckingExisting}>
                <FiFileText /> {existingJournal ? 'Catatan Sudah Ada' : 'Simpan Catatan'}
              </Button>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* --- HISTORY WIDGET --- */}
      <Card.Root bg={cardBg} shadow="md">
        <Card.Body>
          <Heading size="md" mb={4} color="purple.500">Riwayat Catatan</Heading>
          <Box minH="150px" display="flex" flexDirection="column">
            {isLoadingHistory ? (
              <Text color={contentColor} textAlign="center">Memuat catatan...</Text>
            ) : currentEntry ? (
              <Box p={4} border="1px solid" borderColor={borderColor} borderRadius="md" _hover={{ bg: hoverBg }} transition="all 0.2s" flex="1" display="flex" flexDirection="column">
                <VStack align="stretch" gap={3} flex="1">
                  <Badge colorScheme="green" variant="subtle">{currentEntry.storyDate}</Badge>
                  <Text fontSize="sm" color={contentColor} lineHeight="1.5" lineClamp={4}>{currentEntry.content}</Text>
                  <HistoryWidgetModal entry={currentEntry} onSave={handleSaveChanges}/>
                </VStack>
              </Box>
            ) : (
              <Box p={6} bg={emptyBg} borderRadius="md" textAlign="center" flex="1" display="flex" alignItems="center" justifyContent="center">
                <VStack gap={3}>
                  <Box as={FiEdit} fontSize="2xl" color={contentColor} />
                  <Text fontWeight="medium" color={contentColor}>Belum ada catatan</Text>
                  <Text fontSize="sm" color={contentColor}>Belum ada catatan yang dibuat untuk tanggal {selectedDate}</Text>
                </VStack>
              </Box>
            )}
          </Box>
        </Card.Body>
      </Card.Root>
    </VStack>
  )
}
