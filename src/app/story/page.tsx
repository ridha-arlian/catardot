'use client'
import { Box, Container, Heading, Textarea, Button, VStack, HStack, Text, Input, Card, Flex, Status, Badge } from '@chakra-ui/react'
import { useColorModeValue } from "@/components/ui/color-mode"
import { useState } from 'react'
import { FiCalendar, FiClock, FiEdit3, FiSave, FiFileText } from 'react-icons/fi'
import { TimeJournal } from '../components/journal/time'
import { Calendar } from '../components/journal/calendar'

export default function StoryPage() {
  const [storyTitle, setStoryTitle] = useState('')
  const [storyContent, setStoryContent] = useState('')
  const [storyMoment, setStoryMoment] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [calendarDate, setCalendarDate] = useState<Date>(new Date())

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  const handleSaveStory = () => {
    // Logic untuk menyimpan story
    console.log({
      title: storyTitle,
      content: storyContent,
      moment: storyMoment,
      date: selectedDate,
      calendarDate: calendarDate
    })
  }

  const handleCalendarChange = (date: Date) => {
    setCalendarDate(date)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
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
          <TimeJournal/>
          <Box width="1px" bg="blue.normal" borderRadius="full" flexShrink={0} alignSelf="stretch"/>
          <Box flex="1" display="flex" ms="3">
            <VStack align="start">
              <Card.Root  bg={cardBg} shadow="md" width="100%" borderLeft="4px solid" borderLeftColor="orange.500">
                <Card.Body py={4}>
                  {/* Status Header */}
                  <HStack>
                    <Status.Root size="lg" colorPalette="red">
                      <Status.Indicator />
                    </Status.Root>
                    <Box color="orange.500" fontSize="xl"/>
                    <Text fontWeight="semibold" color="orange.600" fontSize="lg">
                      Belum Menulis Jurnal
                    </Text>
                  </HStack>
                  {/* Status Message */}
                  <Text fontSize="md" color={useColorModeValue("gray.600", "gray.400")} lineHeight="1.5">
                    Kamu belum menulis jurnal harian hari ini.
                  </Text>
                </Card.Body>
              </Card.Root>
            </VStack>
          </Box>
        </HStack>

        <Flex gap={8} direction={{ base: 'column', lg: 'row' }} mt="5">
          {/* Form Section */}
          <Box flex="2">
            <Card.Root bg={cardBg} shadow="lg">
              <Card.Body>
                <VStack gap="6" align="stretch">
                  {/* Date and Moment Selector */}
                  <HStack gap="4">
                    <Box flex="1">
                      <Text mb={2} fontWeight="medium" color="gray.700">
                        <Box as={FiCalendar} display="inline" mr={2}/>
                        Tanggal
                      </Text>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateInputChange}
                      />
                    </Box>
                    <Box flex="1">
                      <Text mb={2} fontWeight="medium" color="gray.700">
                        <Box as={FiClock} display="inline" mr={2} />
                        Momen Spesial
                      </Text>
                      <Input
                        placeholder="Contoh: Pagi hari, Saat makan siang..."
                        value={storyMoment}
                        onChange={(e) => setStoryMoment(e.target.value)}
                      />
                    </Box>
                  </HStack>

                  {/* Story Title */}
                  <Box>
                    <Text mb={2} fontWeight="medium" color="gray.700">
                      <Box as={FiEdit3} display="inline" mr={2} />
                      Judul Cerita
                    </Text>
                    <Input
                      placeholder="Berikan judul untuk cerita hari ini..."
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                      size="lg"
                    />
                  </Box>

                  {/* Story Content */}
                  <Box>
                    <Text mb={2} fontWeight="medium" color="gray.700">
                      <Box as={FiFileText} display="inline" mr={2} />
                      Ceritakan Pengalaman Anda
                    </Text>
                    <Textarea
                      placeholder="Apa yang terjadi hari ini? Siapa yang terlibat? Bagaimana perasaan Anda? Apa yang membuat momen ini spesial?

                                              Contoh:
                                              - Percakapan menarik dengan teman
                                              - Pemandangan yang indah
                                              - Pelajaran yang dipetik
                                              - Emosi yang dirasakan..."
                      value={storyContent}
                      onChange={(e) => setStoryContent(e.target.value)}
                      minH="300px"
                      autoresize 
                    />
                  </Box>

                  {/* Action Buttons */}
                  <HStack gap="4" justify="flex-end">
                    <Button variant="outline" colorScheme="gray">
                      <FiSave />
                      Simpan Draft
                    </Button>
                    <Button 
                      colorScheme="blue" 
                      onClick={handleSaveStory}
                      data-disabled={!storyTitle || !storyContent}
                    >
                      <FiFileText />
                      Publikasikan Cerita
                    </Button>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Box>

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
                    <Calendar value={calendarDate} onChange={handleCalendarChange} locale="id-ID"/>
                  </Box>
                </Card.Body>
              </Card.Root>

              {/* Prompt Ideas */}
              <Card.Root bg={cardBg} shadow="md">
                <Card.Body>
                  <Heading size="md" mb={4} color="green.500">
                    Ide Cerita
                  </Heading>
                  <VStack align="start" gap="2">
                    <Badge colorScheme="blue" cursor="pointer" p={2} borderRadius="md">
                      Percakapan menarik hari ini
                    </Badge>
                    <Badge colorScheme="green" cursor="pointer" p={2} borderRadius="md">
                      Sesuatu yang membuat saya tersenyum
                    </Badge>
                    <Badge colorScheme="purple" cursor="pointer" p={2} borderRadius="md">
                      Pelajaran yang saya dapat
                    </Badge>
                    <Badge colorScheme="orange" cursor="pointer" p={2} borderRadius="md">
                      Momen tak terduga
                    </Badge>
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Word Count */}
              <Card.Root bg={cardBg} shadow="md">
                <Card.Body>
                  <Text fontSize="sm" color="gray.600">
                    Jumlah kata: {storyContent.split(' ').filter(word => word.length > 0).length}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Target: 100-300 kata untuk cerita harian
                  </Text>
                </Card.Body>
              </Card.Root>
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}
