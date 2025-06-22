/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState } from 'react'
import { Box, Button, HStack, VStack, Text } from '@chakra-ui/react'
import { useColorModeValue } from "@/components/ui/color-mode"
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface CalendarProps {
  value?: Date
  onChange?: (date: Date) => void
  locale?: string
}

export const CalendarWidget = ({ value, onChange, locale = 'id-ID' }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(value || new Date())
  const today = new Date()
  
  // Color values
  const calendarBg = useColorModeValue('white', 'gray.800')
  const headerBg = useColorModeValue('gray.50', 'gray.700')
  const dayNameColor = useColorModeValue('gray.600', 'gray.400')
  const dayColor = useColorModeValue('gray.700', 'gray.300')
  const todayBg = useColorModeValue('orange.100', 'orange.800')
  const todayColor = useColorModeValue('orange.800', 'orange.200')
  const selectedBg = useColorModeValue('blue.500', 'blue.600')
  const selectedColor = 'white'
  const hoverBg = useColorModeValue('gray.100', 'gray.600')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Get calendar data
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()
  
  // ID
  const monthNames = [ 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember' ]
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  // EN
  // const monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
  // const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Navigation functions
  const goToPrevMonth = () => {
    const prevMonth = new Date(year, month - 1, 1)
    setCurrentDate(prevMonth)
  }
  
  const goToNextMonth = () => {
    const nextMonth = new Date(year, month + 1, 1)
    setCurrentDate(nextMonth)
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
  }
  
  const days: (number | null)[] = []
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }
  
  // Helper functions
  const isToday = (day: number | null): boolean => {
    if (!day) return false
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }
  
  const isSelected = (day: number | null): boolean => {
    if (!day || !value) return false
    return value.getDate() === day && value.getMonth() === month && value.getFullYear() === year
  }
  
  const selectDate = (day: number) => {
    const newDate = new Date(year, month, day)
    setCurrentDate(newDate)
    onChange?.(newDate)
  }

  return (
    <Box bg={calendarBg} border="1px solid" borderColor={borderColor} borderRadius="lg" overflow="hidden" width="100%" maxW="380px">
      {/* Calendar Header */}
      <Box bg={headerBg} px={4} py={3}>
        <HStack justify="space-between" align="center">
          <Button size="md" variant="ghost" onClick={goToPrevMonth} color={dayNameColor} _hover={{ bg: hoverBg }}>
            <FiChevronLeft />
          </Button>
          
          <VStack gap={1}>
            <Text color={dayColor} textStyle="rubikThird">
              {monthNames[month]}
            </Text>
            <Text color={dayNameColor} textStyle="rubikFour">
              {year}
            </Text>
          </VStack>
          
          <Button size="md" variant="ghost" onClick={goToNextMonth} color={dayNameColor} _hover={{ bg: hoverBg }}>
            <FiChevronRight />
          </Button>
        </HStack>
        
        {/* Today Button */}
        <Box textAlign="center" mt={2}>
          <Button size="sm" variant="outline" onClick={goToToday} colorScheme="blue">
            Hari Ini
          </Button>
        </Box>
      </Box>
      
      {/* Calendar Body */}
      <Box p={4}>
        {/* Day Names Header */}
        <HStack justify="flex-start" gap="4" mb={3} width="100%">
          {dayNames.map((dayName) => (
            <Box key={dayName} width="100%" textStyle="rubikFive" textAlign="center" color={dayNameColor} py={1}>
              {dayName}
            </Box>
          ))}
        </HStack>
        
        {/* Calendar Grid */}
        <VStack gap={1} height="190px">
          {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
            <HStack key={weekIndex} justify="flex-start" gap="4" width="100%">
              {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                <Box key={`${weekIndex}-${dayIndex}`} width="36px" height="30px" display="flex" alignItems="center" justifyContent="center" borderRadius="md" cursor={day ? "pointer" : "default"} textStyle="rubikSix" fontWeight={isSelected(day) || isToday(day) ? "bold" : "normal"} bg={ day && isSelected(day) ? selectedBg : day && isToday(day) ? todayBg : "transparent"} color={ day && isSelected(day) ? selectedColor : day && isToday(day) ? todayColor : day ? dayColor : "transparent"} _hover={day ? { bg: isSelected(day)  ? selectedBg : isToday(day) ? todayBg : hoverBg } : {}} transition="all 0.2s" onClick={() => day && selectDate(day)}>
                  {day}
                </Box>
              ))}
            </HStack>
          ))}
        </VStack>
      </Box>
      
      {/* Calendar Footer */}
      {value && (
        <Box bg={headerBg} px={4} py={2} borderTop="1px solid" borderTopColor={borderColor}>
          <Text color={dayNameColor} textAlign="center" textStyle="rubikSeven">
            {value.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </Box>
      )}
    </Box>
  )
}
