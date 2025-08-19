"use client"

import { Box, VStack, Text } from "@chakra-ui/react"

export const Footer = ()  => {
  return (
    <>
      <Box as="footer" borderTopWidth={1} borderColor="gray.200" bg="whiteAlpha.800">
        <Box maxW="4xl" mx="auto" px={6} py={8}>
          <VStack gap={2} textAlign="center">
            <Text fontSize="sm" color="gray.500">
              Inspired by <b>Matthew Dicks&apos;</b> Homework for Life method
            </Text>
            <Text fontSize="xs" color="gray.500">
              &quot;The goal is to notice and remember one thing every day that is worth remembering.&quot;
            </Text>
          </VStack>
        </Box>
      </Box>
    </>
  )
}