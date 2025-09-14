"use client"

import { useState, useEffect } from "react"
import { Box, Text, HStack, VStack } from "@chakra-ui/react"
import { useColorModeValue } from "@/components/ui/color-mode"

interface TimeWidgetProps {
  onDateChange?: (date: string) => void
}

export const TimeWidget = ({ onDateChange }: TimeWidgetProps) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showColon, setShowColon] = useState(true)
  
  const timeTextColor = useColorModeValue("gray.900", "white")
  
  const IOSBlinkingColon = ({ show }: { show: boolean }) => (
    <Text opacity={show ? 1 : 0.2} transition="opacity 0.1s ease-in-out" fontSize="inherit" fontWeight="inherit" color="inherit">
      :
    </Text>
  )
  
  const formatTime = () => {
    const time = currentTime.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    })
    const [hours, minutes, seconds] = time.split(":")
    return { hours, minutes, seconds }
  }

  const { hours, minutes, seconds } = formatTime()

  const formatDate = () => {
    return currentTime.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long"
    })
  }

  const pad = (n: number) => n.toString().padStart(2, "0")

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date()
      setCurrentTime(newTime)
      setShowColon(newTime.getSeconds() % 2 === 0)
      const today = `${newTime.getFullYear()}-${pad(newTime.getMonth()+1)}-${pad(newTime.getDate())}`
      onDateChange?.(today)
    }, 1000)

    return () => clearInterval(timer)
  }, [onDateChange])

  return (
    <>
      <VStack gap="2" align="start">
        {/* Clock Content */}
        <Box p={3} zIndex={1} position="relative" overflow="hidden">
          <VStack gap={2} align="start">
            {/* Time */}
            <HStack gap={0} minH={{ base: "30px", md: "50px" }} textStyle="timeWidgetNum" color={timeTextColor} textAlign="center" minW={{ base: "40px", md: "50px" }}>
              <Text>
                {hours}
              </Text>

              <IOSBlinkingColon show={showColon} />

              <Text display="inline-block" textAlign="center" width={{ base: "80px", md: "80px" }}>
                {minutes}
              </Text>

              <IOSBlinkingColon show={showColon} />

              <Text opacity={0.8} display="inline-block" width={{ base: "80px", md: "80px" }}>
                {seconds}
              </Text>
            </HStack>

            {/* Separator */}
            <Box height="1px" bg="sage.500" width="100%" mt={2} />

            {/* Date */}
            <Text textStyle="timeWidgetText" color="brand.500" textAlign={{ base: "center", md: "start" }} w="100%">
              {formatDate()}
            </Text>
          </VStack>
        </Box>
      </VStack>
    </>
  )
}