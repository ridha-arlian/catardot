'use client'
import { Box, Textarea, Button, VStack, HStack, Text, Input, Card } from '@chakra-ui/react'
import { useColorModeValue } from "@/components/ui/color-mode"
import { useEffect, useState } from 'react'
import { FiCalendar, FiSave, FiFileText } from 'react-icons/fi'
import { getRandomPrompts } from '../../utils/prompt'

interface StoryWidgetProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export function StoryWidget({ selectedDate, onDateChange }: StoryWidgetProps) {
  const [storyContent, setStoryContent] = useState('')
  const [prompts, setPrompts] = useState({
    promptContent: '',
  })

  const cardBg = useColorModeValue('white', 'gray.800')

  const refreshPrompts = () => {
    setPrompts(getRandomPrompts())
  }

  // Initialize random placeholders on component mount
  useEffect(() => {
    refreshPrompts()
  }, [])

  const handleSaveStory = () => {
    // Logic untuk menyimpan story
    console.log({
      content: storyContent,
      date: selectedDate
    })
  }

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    onDateChange(newDate)
  }

  return (
    <Box flex="2">
      <Card.Root bg={cardBg} shadow="lg">
        <Card.Body>
          <VStack gap="6" align="stretch">
            {/* Date and Moment Selector */}
              <Box maxW="300px">
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

            {/* Story Content */}
            <Box>
              <Text mb={2} fontWeight="medium" color="gray.700">
                <Box as={FiFileText} display="inline" mr={2} />
                Apa hal paling bermakna hari ini?
              </Text>
              <Textarea
                placeholder={prompts.promptContent}
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                minH="150px"
                autoresize
              />
            </Box>

            {/* Action Buttons */}
            <HStack gap="4" justify="space-between" align="center">
              {/* Word Count - Left Side */}
                <Text fontSize="sm" color="gray.600">
                  Jumlah kata: {storyContent.split(' ').filter(word => word.length > 0).length}
                </Text>
              
              {/* Action Buttons - Right Side */}
              <HStack gap="3">
                <Button variant="outline" colorScheme="gray">
                  <FiSave />
                  Simpan Draft
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handleSaveStory}
                  data-disabled={!storyContent}
                >
                  <FiFileText />
                  Publikasikan Cerita
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
