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

export default function StoryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [calendarDate, setCalendarDate] = useState<Date>(new Date())

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  const handleCalendarChange = (date: Date) => {
    setCalendarDate(date)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
    // Sync dengan calendar
    if (newDate) {
      setCalendarDate(new Date(newDate))
    }
  }

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.lg">
        <HStack direction="row">
          {/* Widget Time */}
          <TimeWidget/>
          <Box width="1px" bg="blue.normal" borderRadius="full" flexShrink={0} alignSelf="stretch"/>
          <StatusWidget/>
        </HStack>

        <Flex gap={8} direction={{ base: 'column', lg: 'row' }} mt="5">
          {/* Form Section */}
          <StoryWidget selectedDate={selectedDate} onDateChange={handleDateChange}/>

          {/* Sidebar */}
          <Box flex="1">
            <VStack gap="6" align="stretch">
              <Card.Root bg={cardBg} shadow="md" mt="-40">
                <Card.Body>
                  <Heading size="md" mb={4} color="blue.500">
                    <Box as={FiCalendar} display="inline" mr={2} />
                    Kalender
                  </Heading>
                  {/* Calendar */}
                  <Box display="flex" justifyContent="center">
                    <CalendarWidget value={calendarDate} onChange={handleCalendarChange} locale="id-ID"/>
                  </Box>
                </Card.Body>
              </Card.Root>

              {/* History */}
              <HistoryWidget selectedDate={calendarDate}/>
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}
