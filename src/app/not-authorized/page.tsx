"use client"
import { ShieldIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Box, VStack, Heading, Text, Button, Center } from "@chakra-ui/react"

export default function NotAuthorizedPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (countdown === 0) {
      router.push("/")
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, router])

  const handleRedirectNow = () => router.push("/")

  return (
    <>
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={4}>
        <Box maxW="md" w="full" borderWidth={1} borderRadius="xl" shadow="md" bg="white" textAlign="center" p={6}>
          {/* Header */}
          <Center mb={4}>
            <Box w={16} h={16} bg="red.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
              <ShieldIcon color="red" size={32} />
            </Box>
          </Center>
          <Heading as="h2" size="lg" color="red.600" mb={2}>
            Access Denied
          </Heading>
          <Text color="gray.500" mb={6}>
            You are not authorized to access this page
          </Text>

          {/* Countdown */}
          <VStack gap={1} mb={6}>
            <Text fontSize="sm" color="gray.500">
              You will be redirected to the landing page in
            </Text>
            <Heading size="lg" color="blue.600">
              {countdown}
            </Heading>
            <Text fontSize="sm" color="gray.500">
              {countdown === 1 ? "second" : "seconds"}
            </Text>
          </VStack>

          {/* Button */}
          <Button variant="outline" w="full" onClick={handleRedirectNow}>
            Go to Landing Page Now
          </Button>
        </Box>
      </Box>
    </>
  )
}