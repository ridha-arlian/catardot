'use client'
import { Box, Container, Heading, VStack, HStack, Card, Flex } from '@chakra-ui/react'
import { useColorModeValue } from "@/components/ui/color-mode"
import { useState } from 'react'
import { FiCalendar} from 'react-icons/fi'
import { TimeWidget } from '../components/journal/TimeWidget'
import { CalendarWidget } from '../components/journal/CalendarWidget'
import { HistoryWidget } from '../components/journal/HistoryWidget'
import { StatusWidget } from '../components/journal/StatusWidget'
import { StoryWidget } from '../components/journal/StoryWidget'

interface JournalEntry {
  id: string
  content: string
  storyDate: string
  createdAt: string
  userId: string
}

export default function StoryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [calendarDate, setCalendarDate] = useState<Date>(new Date())
  const [selectedJournalData, setSelectedJournalData] = useState<JournalEntry | null>(null)
  const [calendarRefreshTrigger, setCalendarRefreshTrigger] = useState(0)
  const [statusRefreshTrigger, setStatusRefreshTrigger] = useState(0)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0]
  }

  const handleJournalSaved = (newJournalData: JournalEntry) => {
    setCalendarRefreshTrigger(prev => prev + 1)
    setSelectedJournalData(newJournalData)
    setStatusRefreshTrigger(prev => prev + 1)
  }

  const handleCalendarChange = (date: Date) => {
    setCalendarDate(date)
    setSelectedDate(date.toISOString().split('T')[0])
    setSelectedJournalData(null)
  }

  const handleDateSelect = (date: Date, journalData: JournalEntry | null) => {
    setCalendarDate(date)
    setSelectedDate(date.toISOString().split('T')[0])
    if (journalData) {
      const journalDate = new Date(journalData.storyDate)
      if (isSameDate(journalDate, date)) {
        setSelectedJournalData(journalData)
      } else {
        setSelectedJournalData(null)
      }
    } else {
      setSelectedJournalData(null)
    }
  }

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
    if (newDate) { setCalendarDate(new Date(newDate)) }
    setSelectedJournalData(null)
  }

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.lg">
        <HStack direction="row">
          <TimeWidget/>
          <Box width="1px" bg="blue.normal" borderRadius="full" flexShrink={0} alignSelf="stretch"/>
          <StatusWidget refreshTrigger={statusRefreshTrigger}/>
        </HStack>

        <Flex gap={8} direction={{ base: 'column', lg: 'row' }} mt="5">
          <StoryWidget selectedDate={selectedDate} onDateChange={handleDateChange} onJournalSaved={handleJournalSaved}/>
          <Box flex="1">
            <VStack gap="6" align="stretch">
              <Card.Root bg={cardBg} shadow="md" mt="-40">
                <Card.Body>
                  <Heading size="md" mb={4} color="blue.500">
                    <Box as={FiCalendar} display="inline" mr={2} />
                    Kalender
                  </Heading>
                  <Box display="flex" justifyContent="center">
                    <CalendarWidget value={calendarDate} onChange={handleCalendarChange} onDateSelect={handleDateSelect} locale="id-ID" refreshTrigger={calendarRefreshTrigger}/>
                  </Box>
                </Card.Body>
              </Card.Root>
              <HistoryWidget selectedDate={calendarDate} journalData={selectedJournalData}/>
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}