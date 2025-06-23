/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, useEffect } from 'react'
import { Box, Text, VStack, HStack, Badge, Button, Card, Heading } from '@chakra-ui/react'
import { useColorModeValue } from "@/components/ui/color-mode"
import { FiEye, FiEdit } from 'react-icons/fi'
import HistoryWidgetModal from '../../modals/HistoryWidgetModal'

interface JournalEntry {
  id: string
  content: string
  storyDate: string
  createdAt: string
  userId: string
}

interface JournalHistoryProps {
  selectedDate: Date
  journalData?: JournalEntry | null
}

export const HistoryWidget = ({ selectedDate, journalData }: JournalHistoryProps) => {
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastFetchedDate, setLastFetchedDate] = useState<string>('')
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const contentColor = useColorModeValue('gray.600', 'gray.400')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const emptyBg = useColorModeValue('gray.50', 'gray.700')

  const getDateString = (date: Date) => date.toISOString().split('T')[0]

  const isSameDate = (date1: Date, date2: Date) => getDateString(date1) === getDateString(date2)

  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const fetchJournalByDate = async (date: Date) => {
    const dateString = getDateString(date)
    
    if (lastFetchedDate === dateString && !journalData) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/story?userId=user123&date=${dateString}`)
      const data = await response.json()
      
      if (getDateString(selectedDate) !== dateString) return

      if (data.success && data.data) {
        const receivedDate = new Date(data.data.storyDate)
        setCurrentEntry(isSameDate(receivedDate, date) ? data.data : null)
        if (!isSameDate(receivedDate, date)) {
          console.warn('Data tidak sesuai dengan tanggal yang diminta')
        }
      } else {
        setCurrentEntry(null)
      }
    } catch (error) {
      console.error('Error fetching journal:', error)
      setCurrentEntry(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const currentDateString = getDateString(selectedDate)
    if (lastFetchedDate !== currentDateString) {
      setCurrentEntry(null)
      setLastFetchedDate(currentDateString)
    }
    if (journalData) {
      const journalDate = new Date(journalData.storyDate)
      
      if (isSameDate(journalDate, selectedDate)) {
        setCurrentEntry(journalData)
      } else {
        fetchJournalByDate(selectedDate)
      }
    } else {
      fetchJournalByDate(selectedDate)
    }
  }, [selectedDate, journalData])

  const handleSaveChanges = (updatedEntry: JournalEntry) => {
    setCurrentEntry(updatedEntry)
  }

  if (isLoading) {
    return (
      <Card.Root bg={cardBg} shadow="md">
        <Card.Body>
          <Heading size="md" mb={4} color="purple.500">
            Riwayat Catatan
          </Heading>
          <Box minH="210px" display="flex" alignItems="center" justifyContent="center">
            <Text color={contentColor}>Memuat catatan...</Text>
          </Box>
        </Card.Body>
      </Card.Root>
    )
  }

  return (
    <>
      <Card.Root bg={cardBg} shadow="md">
        <Card.Body>
          <Heading size="md" mb={4} color="purple.500">
            Riwayat Catatan
          </Heading>
          <Box minH="150px" display="flex" flexDirection="column">
            {currentEntry ? (
              <Box p={4} border="1px solid" borderColor={borderColor} borderRadius="md" _hover={{ bg: hoverBg }} transition="all 0.2s" flex="1" display="flex" flexDirection="column">
                <VStack align="stretch" gap={3} flex="1">
                  <Box minH="8">
                    <Badge colorScheme="green" variant="subtle" size="sm">
                      {formatSelectedDate()}
                    </Badge>
                  </Box>
                  <Box flex="1" minH="20">
                    <Text fontSize="sm" color={contentColor} lineHeight="1.5" lineClamp={4}>
                      {currentEntry.content}
                    </Text>
                  </Box>
                  <Box minH="10" display="flex" alignItems="end">
                    <HStack justify="center" width="100%">
                      <HistoryWidgetModal entry={currentEntry} onSave={handleSaveChanges}/>
                    </HStack>
                  </Box>
                </VStack>
              </Box>
            ) : (
              <Box p={6} bg={emptyBg} borderRadius="md" textAlign="center" flex="1" display="flex" alignItems="center" justifyContent="center">
                <VStack gap={3}>
                  <Box as={FiEdit} fontSize="2xl" color={contentColor} />
                  <Text fontWeight="medium" color={contentColor}>
                    Belum ada catatan
                  </Text>
                  <Text fontSize="sm" color={contentColor}>
                    Belum ada catatan yang dibuat untuk tanggal {formatSelectedDate()}
                  </Text>
                </VStack>
              </Box>
            )}
          </Box>
        </Card.Body>
      </Card.Root>
    </>
  )
}