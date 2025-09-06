/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import {
  Box,
  Container,
  Input,
  Button,
  Text,
  VStack,
  HStack,
  IconButton,
  useClipboard,
  Card, Flex
} from "@chakra-ui/react"
import { ExternalLink, LogOut, FileSpreadsheet, BookOpen, Copy, Check } from "lucide-react"
import { Navbar } from "@/app/components/journal/navbar"

export default function ProfilePage() {
  const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/your-spreadsheet-id"
  // const { hasCopied, onCopy } = useClipboard(spreadsheetUrl)

  const handleLogout = () => {
    console.log("Logging out...")
  }

  const handleSpreadsheetClick = () => {
    window.open(spreadsheetUrl, "_blank")
  }

  return (
    <Box minH="100vh" bg="bg.canvas" py={{ base: 8, md: 12 }}>
      <Navbar/>
      <Container  h="100%">
        <Flex minH="100vh" align="center" justify="center">
          <Card.Root border="1px solid" borderColor={{ base: "sage.300", _dark: "sage.600" }} shadow="md" rounded="2xl" overflow="hidden">
          {/* <Card.Header borderBottom="1px solid" borderColor="sage.200">
            <Text fontSize="lg" fontWeight="semibold">
              Profile Settings
            </Text>
          </Card.Header> */}

          <Card.Body>
            <VStack gap={6} align="stretch">
              {/* Spreadsheet Link */}
              <Box>
                <HStack mb={2} gap={2}>
                  <FileSpreadsheet size={18} />
                  <Text fontSize="sm" fontWeight="medium">
                    Spreadsheet Link
                  </Text>
                </HStack>
                <HStack gap={2}>
                  <Input
                    value={spreadsheetUrl}
                    // isReadOnly
                    borderColor="sage.200"
                    _hover={{ borderColor: "sage.300" }}
                  />
                  <IconButton
                    aria-label="Copy Link"
                    // onClick={onCopy}
                    variant="outline"
                    size="sm"
                    borderColor="sage.200"
                    // icon={hasCopied ? <Check size={16} /> : <Copy size={16} />}
                  />
                  <IconButton
                    aria-label="Open Spreadsheet"
                    onClick={handleSpreadsheetClick}
                    variant="outline"
                    size="sm"
                    borderColor="sage.200"
                    // icon={<ExternalLink size={16} />}
                  />
                </HStack>
              </Box>

              {/* Notion Connect */}
              <Button
                // leftIcon={<BookOpen size={18} />}
                variant="outline"
                borderColor="sage.200"
                justifyContent="flex-start"
              >
                Connect to Notion
              </Button>
            </VStack>
          </Card.Body>

          <Card.Footer borderTop="1px solid" borderColor="sage.200">
            <Button
              onClick={handleLogout}
              // leftIcon={<LogOut size={18} />}
              colorScheme="red"
              w="full"
            >
              Logout
            </Button>
          </Card.Footer>
        </Card.Root>
        </Flex>
      </Container>
    </Box>
  )
}
