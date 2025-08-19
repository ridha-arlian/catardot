/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { FiEdit } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useColorModeValue } from '@/components/ui/color-mode'
import { HistoryWidgetModal } from '../../modals/historyModal'
import { Box, Text, VStack, HStack, Badge, Card, Heading } from '@chakra-ui/react'

interface JournalEntry {
  storyDate: string
  content: string
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
      const response = await fetch(`/api/story?storyDate=${encodeURIComponent(dateString)}`)
      const data = await response.json()

      if (getDateString(selectedDate) !== dateString) return

      if (data && data.exists) {
        setCurrentEntry({ storyDate: dateString, content: data.story })
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
    if (journalData && isSameDate(new Date(journalData.storyDate), selectedDate)) {
      setCurrentEntry(journalData)
    } else {
      fetchJournalByDate(selectedDate)
    }
  }, [selectedDate, journalData])

  const handleSaveChanges = (updatedEntry: Partial<JournalEntry>) => {
    setCurrentEntry({
      storyDate: updatedEntry.storyDate || currentEntry?.storyDate || "",
      content: updatedEntry.content || currentEntry?.content || ""
    })
  }

  if (isLoading) {
    return (
      <>
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
      </>
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
                      <HistoryWidgetModal entry={{ storyDate: currentEntry.storyDate, content: currentEntry.content }} onSave={handleSaveChanges}/>
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