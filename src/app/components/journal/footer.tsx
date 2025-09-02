"use client"

import { Mail } from "lucide-react"
import { useState, useEffect } from "react"
import { Box, Container, Flex, HStack, Link, Text } from "@chakra-ui/react"
import { Githubicons, Linkedinicons } from "@/components/icons/iconsDarkMode"

export const Footer = () => {
  const [year, setYear] = useState<number | null>(null)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <>
      <Box as="footer" borderTop="1px solid" borderColor="sage.500" bg="bg.canvas">
        <Container maxW="container.xl" py={6} px={4}>
          <Flex direction={{ base: "column", sm: "row" }} align="center" justify="space-between" gap={{ base: 4, sm: 0 }}>
            <Text textStyle="textFooter" color="fg.muted">
              {year ? `© ${year} Ridha Arlian.` : null}
            </Text>

            <HStack gap={4}>
              <Link target="_blank" rel="noopener noreferrer" href="https://github.com/ridha-arlian" aria-label="GitHub" _hover={{ color: "fg.default" }}>
                <Githubicons boxSize={6} />
              </Link>
              <Link target="_blank" rel="noopener noreferrer" href="https://linkedin.com/in/ridha-arlian" aria-label="LinkedIn" _hover={{ color: "fg.default" }}>
                <Linkedinicons boxSize={6} />
              </Link>
              <Link target="_blank" rel="noopener noreferrer" href="mailto:ridhaarlian@proton.me" aria-label="Email" color="fg.muted" _hover={{ color: "fg.default" }}>
                <Mail size={24} />
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </>
  )
}