"use client"

import React from "react"
import { LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Navbar } from "@/app/components/journal/navbar"
import { Avatar, Box, Button, Flex, Heading, HStack, Stack, Text, VStack, SkeletonCircle, Clipboard, IconButton, Input, InputGroup, Badge, Skeleton } from "@chakra-ui/react"

export default function ProfilePage() {
  const { data: session, status } = useSession()

  const isLoading = status === "loading"

  const generateSpreadsheetUrl = (spreadsheetId: string) => {
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
  }

  const ClipboardIconButton = () => {
    return (
      <Clipboard.Trigger asChild>
        <IconButton variant="outline" color="gray.500" borderColor="sage.500" border="2px solid" _hover={{ color: "brand.500", borderColor: "brand.500", bg:"inherit" }} size="xs" me="-2">
          <Clipboard.Indicator />
        </IconButton>
      </Clipboard.Trigger>
    )
  }

  return (
    <Flex minH="100vh" align="center" justify="center" p={4} bg="bg.canvas">

      {/* Navbar */}
      <Navbar/>

      <Box w="full" maxW="md" bg="inherit" border="2px solid" shadow="sm" borderColor="sage.500" borderRadius="xl" backdropFilter="blur(8px)" p={8}>
        
        {isLoading ? (
          <VStack gap={6} textAlign="center">
            <SkeletonCircle size="20" border="1px solid" borderColor="gray.600"/>
            
            <Stack gap={2} w="full" align="center">
              <Skeleton height="32px" width="200px" borderRadius="md" />
              <Skeleton height="20px" width="250px" borderRadius="md" />
            </Stack>

            <Box w="full" mt={4}>
              <Skeleton height="24px" width="150px" borderRadius="md" mx="auto" mb={3} />
              <Skeleton height="40px" width="full" borderRadius="md" />
            </Box>

            <Skeleton height="40px" width="full" borderRadius="md" mt={2} />
          </VStack>
        ) : (
          <>
            <VStack gap={4} textAlign="center">
              <Box position="relative" display="inline-block">
                <Avatar.Root size={{ base: "lg", sm: "md", md: "lg", lg: "lg", xl: "lg" }}>
                  <Avatar.Fallback name={session?.user?.name ?? "User"} />
                  <Avatar.Image src={session?.user?.image ?? "https://bit.ly/sage-adebayo"} />
                </Avatar.Root>
              </Box>

              <Stack gap={1}>
                <Heading textStyle="headingProfile" color={{ base: "brand.500", _dark: "white" }}>
                  {session?.user?.name}
                </Heading>
                <HStack justify="center" gap={2}>
                  <Badge textStyle="subHeadingProfile" bg="inherit" p={1} color="gray.500">
                    {session?.user?.email}
                  </Badge>
                </HStack>
              </Stack>
            </VStack>

            <Box my={6}>
              <Text color={{ base: "brand.500", _dark: "white" }} mb={3} textAlign="center" textStyle="headingSheetsProfile">
                My Spreadsheets
              </Text>
              <Stack gap={2}>
                {session?.user?.spreadsheetId && (
                  <Clipboard.Root color="gray.500" value={generateSpreadsheetUrl(session.user.spreadsheetId)}>
                    <InputGroup w="full" textStyle="linkSheetsProfile" endElement={<ClipboardIconButton />}>
                      <Clipboard.Input border="2px solid" borderColor="sage.500" asChild>
                        <Input />
                      </Clipboard.Input>
                    </InputGroup>
                  </Clipboard.Root>
                )}
              </Stack>
            </Box>
            
            <Button w="full" textStyle="buttonProfile" variant="outline" border="2px solid" borderColor="red.200" color="red.600" _hover={{ bg: "red.500", color: "white", borderColor: "red.500" }} onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut size={16}/>
              Logout
            </Button>
          </>
        )}
      </Box>
    </Flex>
  )
}