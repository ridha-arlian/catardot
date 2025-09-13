"use client"
import { ShieldIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ColorModeButton } from "@/components/ui/color-mode"
import { Box, VStack, Heading, Text, Button, Center } from "@chakra-ui/react"

export default function NotAuthorizedPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleRedirectNow = () => router.push("/")

  return (
    <>
      <Box minH="100vh" bg="bg.canvas" display="flex" alignItems="center" justifyContent="center" p={4}>
        <Box position="fixed" top="4" right="4" zIndex="50">
          <Button rel="noopener noreferrer" size="sm" boxSize={10} variant="ghost" bg="inherit" _hover={{ transform: "scale(1.2) rotate(5deg)", border:"1px solid", borderColor:"sage.500" }} asChild>
            <ColorModeButton />
          </Button>
        </Box>
        
        <Box maxW="md" w="full" border="2px solid" borderRadius="xl" borderColor="sage.500" shadow="md" bg="white" textAlign="center" p={6}>
          {/* Header */}
          <Center mb={4}>
            <Box w={16} h={16} bg="red.200" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
              <ShieldIcon color="red" size={32} />
            </Box>
          </Center>
          <Heading as="h2" textStyle="headingNotAuth" color="red.600" mb={6}>
            Access Denied
          </Heading>
          <Text color="gray.500" textStyle="subHeadingNotAuth" mb={6}>
            You are not authorized to access this page
          </Text>

          {/* Countdown */}
          <VStack gap={1} mb={6}>
            <Text textStyle="textNotAuth" color="gray.500">
              You will be re-directed to the landing page in
            </Text>
            <Heading textStyle="countNotAuth" color="blue.600" mt={4} mb={2}>
              {countdown}
            </Heading>
            <Text textStyle="textNotAuth" color="gray.500">
              {countdown === 1 ? "second" : "seconds"}
            </Text>
          </VStack>

          {/* Button */}
          <Button textStyle="buttonNotAuth" color="black" variant="outline" w="full" _hover={{ bg: { base:"brand.100", _dark:"sage.500" }, color:{ _dark:"black" } }} onClick={handleRedirectNow}>
            Go to Landing Page Now
          </Button>
        </Box>
      </Box>
    </>
  )
}