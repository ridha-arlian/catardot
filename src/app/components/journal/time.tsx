'use client'
import { useState, useEffect } from 'react'
import { Box, Text, HStack, VStack } from '@chakra-ui/react'
import { useColorModeValue } from "@/components/ui/color-mode"

export const TimeJournal = () => {
  const IOSBlinkingColon = ({ show }: { show: boolean }) => (
  <Text opacity={show ? 1 : 0.2} transition="opacity 0.1s ease-in-out" fontSize="inherit" fontWeight="inherit" color="inherit">
    :
  </Text>
  )
  const timeTextColor = useColorModeValue('gray.900', 'white')
  // const dateTextColor = useColorModeValue('gray.600', 'gray.300')

  const [currentTime, setCurrentTime] = useState(new Date())
  const [showColon, setShowColon] = useState(true)

  // const cardBg = useColorModeValue('white', 'gray.800')
  // const iosCardBg = useColorModeValue('gray.50', 'gray.900')
  // const borderColor = useColorModeValue('gray.200', 'gray.700')
  // const gradientBg = useColorModeValue(
  //   'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
  //   'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
  // )
  
  const formatTime = () => {
    const time = currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    const [hours, minutes, seconds] = time.split(':')
    return { hours, minutes, seconds }
  }

  const formatDate = () => {
    return currentTime.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const { hours, minutes, seconds } = formatTime()

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date()
      setCurrentTime(newTime)
      const currentSecond = newTime.getSeconds()
      setShowColon(currentSecond % 2 === 0)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <VStack gap="2" align="start" pt="9">
      {/* Clock Content */}
      <Box p={3} zIndex={1} position="relative" overflow="hidden">  
        {/* Time */}
        <HStack gap={0} minH={{ base: "100px", md: "85px" }} textStyle="rubik" color={timeTextColor} textAlign="center" minW={{ base: "100px", md: "85px" }}>
          <Text>
            {hours}
          </Text>
          <IOSBlinkingColon show={showColon} />
          <Text display="inline-block" textAlign="center" minW={{ base: "100px", md: "85px" }}>
            {minutes}
          </Text>
          <IOSBlinkingColon show={showColon} />
          <Text opacity={0.8} display="inline-block" minW={{ base: "100px", md: "85px" }}>
            {seconds}
          </Text>
        </HStack>
        <Box height="1px" bg="blue.normal" width="100%" alignSelf="center" position="relative" flexShrink="0"/>
        {/* Date */}
        <Text textStyle="rubikSecond">
          {formatDate()}
        </Text>
      </Box>
    </VStack>
  )
}
