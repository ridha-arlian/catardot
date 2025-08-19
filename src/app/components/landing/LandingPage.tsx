"use client"

import { useSession, signIn } from "next-auth/react"
import { ColorModeButton } from "@/components/ui/color-mode"
import { BookOpen, CalendarDays, Sparkles, Heart, Leaf } from "lucide-react"
import { SheetsIcons, NotionIcons, GoogleIcons } from "@/components/icons/iconsDarkMode"
import { Box, Container, VStack, Text, Button, Card, Heading, Icon, SimpleGrid, GridItem } from "@chakra-ui/react"

export const LandingPage = () => {
  const { data: session } = useSession()
  console.log(session)
  return (
    <>
      <Box minH="100vh" bg="bg.canvas" position="relative" overflow="hidden">
        <Button position="fixed" top="4" right="4" zIndex="50" rel="noopener noreferrer" size="sm" boxSize={10} variant="ghost" bg="inherit" _hover={{ transform: "scale(1.2)" }} asChild>
          <ColorModeButton />
        </Button>
        
        <Box position="absolute" inset="0" overflow="hidden" pointerEvents="none">
          <Box position="absolute" top="20" left="10" opacity="0.05">
            <Icon as={Leaf} boxSize="24" color="brand.500" transform="rotate(12deg)" />
          </Box>
          <Box position="absolute" top="40" right="16" opacity="0.05">
            <Icon as={Heart} boxSize="16" color="brand.500" transform="rotate(-12deg)" />
          </Box>
          <Box position="absolute" bottom="32" left="20" opacity="0.05">
            <Icon as={Sparkles} boxSize="20" color="brand.500" transform="rotate(45deg)" />
          </Box>
          <Box position="absolute" bottom="20" right="10" opacity="0.05">
            <Icon as={BookOpen} boxSize="18" color="brand.500" transform="rotate(-6deg)" />
          </Box>
          <Box position="absolute" top="40" left="80" opacity="0.05" >
            <Icon as={Sparkles} boxSize="40" color="brand.500" transform="rotate(-12deg)" />
          </Box>
        </Box>

        <Container maxW="2xl" px="6" py="20" position="relative" zIndex="10">
          <VStack textAlign="center" mb="16" spaceY="12">
            <VStack mb="12" spaceY="8">
              <Box position="relative" mt="6" mb="8">
                <Icon as={BookOpen} boxSize="12" color="brand.500" mx="auto" opacity="0.8" />
              </Box>
              
              <Heading color="fg.default" mb="6" textStyle="headingLP">
                Catardot.
              </Heading>
              <Heading textStyle="subHeadingLP" color="fg.default" mb="6">
                Write Less,
                <br />
                <Text as="span" fontWeight="bold">
                  Notice More.
                </Text>
              </Heading>

              <Text color="fg.muted" textStyle="textLP" maxW="lg" mx="auto" mb="12">
                Daily reflection, made gentle and simple <br />
                Inspired by {""}
                <Text as="em" fontWeight="medium" color="fg.default">
                  Homework for Life.
                </Text>
              </Text>
            </VStack>

            {/* Features Grid */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
              {/* Card 1 */}
              <Box p={8} textAlign="center" bg="inherit">
                <Box w={16} h={16} rounded="2xl" display="flex" alignItems="center" justifyContent="center" mx="auto" mb={6} border="1px solid" borderColor="sage.500">
                  <Icon as={CalendarDays} boxSize={10} color="brand.500"/>
                </Box>
                <Heading as="h4" textStyle="headLPGrid" mb={4} color="card.foreground">
                  Daily Practice
                </Heading>
                <Text color="muted.foreground" textStyle="textLPGrid">
                  One sentence each day to nurture a steady habit of reflection.
                </Text>
              </Box>

              {/* Card 2 */}
              <Box p={8} textAlign="center" bg="inherit">
                <Box w={16} h={16} rounded="2xl" display="flex" alignItems="center" justifyContent="center" mx="auto" mb={6} border="1px solid" borderColor="sage.500">
                  <Icon as={Sparkles} boxSize={10} color="brand.500"/>
                </Box>
                <Heading as="h4" textStyle="headLPGrid" mb={4} color="card.foreground">
                  Meaningful Moments
                </Heading>
                <Text color="muted.foreground" textStyle="textLPGrid">
                  Focus on what truly matters by distilling your day into its most significant moment.
                </Text>
              </Box>

              {/* Card 3 */}
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Box p={8} textAlign="center" maxW="lg" mx="auto" bg="inherit">
                  <Box w={16} h={16} rounded="2xl" display="flex" alignItems="center" justifyContent="center" mx="auto" mb={6} border="1px solid" borderColor="sage.500">
                    <Icon as={BookOpen} boxSize={10} color="brand.500"/>
                  </Box>
                  <Heading as="h4" textStyle="headLPGrid" mb={4} color="card.foreground">
                    Personal Journey
                  </Heading>
                  <Text color="muted.foreground" textStyle="textLPGrid">
                    Create a living timeline of your life, one sentence at a time.
                  </Text>
                </Box>
              </GridItem>
            </SimpleGrid>
                        
            {/* Login card */}
            <Card.Root bg="inherit" maxW="md" w="full" mx="auto" shadow="sm" border="1px solid" borderColor="sage.500">
              <Card.Header textAlign="center" pb={4}>
                <Heading textStyle="headingLPLogin">
                  Begin Your Journey
                </Heading>
                <Text color="gray.500" textStyle="textLPLogin">
                  Sign in with Google to start your one-sentence-a-day practice
                </Text>
              </Card.Header>
              <Card.Body>
                <VStack gap={4}>
                  <Button w="full" bg="white" color="gray.800" borderWidth={1} borderColor="gray.300" _hover={{ bg: "gray.50" }} textStyle="googleLPLogin" onClick={() => signIn("google", { redirectTo: "/story" })}>
                    <GoogleIcons boxSize={8}/>
                    Continue with Google
                  </Button>
                  <Text textStyle="textLPLogin" color="gray.500" textAlign="center">
                    Your reflections are stored in your own Google Sheets — private to you and accessible only with your account.
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          </VStack>

          <VStack textAlign="center" spaceY="12">

            <Box borderTop="1px" borderColor="sage.500" pt="12" w="full">
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={10} mt="12">
                {/* Feature Card */}
                <Box position="relative" p={6} rounded="2xl" bg="inherit" shadow="sm" border="1px solid" borderColor="sage.500" overflow="hidden" textAlign="center">
                  
                  {/* Background Icon */}
                  <Icon as={SheetsIcons} boxSize="40" color="brand.100" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%) rotate(-20deg)" opacity={0.15} zIndex={0}/>

                  {/* Foreground Content */}
                  <VStack gap={3} position="relative" zIndex={1}>
                    <Text color="brand.600" textStyle="miniHeadingLPFeat">
                      Feature
                    </Text>
                    <Text textStyle='headingLPFeat'>
                      Google Sheets Integration
                    </Text>
                    <Text color="fg.muted" textStyle='textLPFeat' maxW="xs" mx="auto">
                      Your daily reflections automatically sync to your personal Google Spreadsheet
                    </Text>
                  </VStack>
                </Box>

                {/* Next Update Card */}
                <Box position="relative" p={6} rounded="2xl" bg="bg.subtle" shadow="sm" border="1px dashed" borderColor="sage.500" overflow="hidden" textAlign="center">
                  
                  {/* Background Icon */}
                  <Icon as={NotionIcons} boxSize="36" color="gray.200" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%) rotate(25deg)" opacity={0.12}/>

                  {/* Foreground Content */}
                  <VStack gap={3} position="relative" zIndex={1}>
                    <Text color="fg.muted" textStyle="miniHeadingLPFeat">
                      Next Update
                    </Text>
                    <Text textStyle="headingLPFeat">
                      Notion Integration
                    </Text>
                    <Text textStyle="textLPFeat" color="fg.muted/70" maxW="xs" mx="auto">
                      Connect your journal to your Notion workspace
                    </Text>
                  </VStack>
                </Box>
              </SimpleGrid>

              {/* About Section */}
              <Box as="section" py={{ base: 16, md: 20 }} px={6} textAlign="center">
                <VStack maxW="2xl" mx="auto" gap={6}>
                  <Text fontSize="sm" fontWeight="semibold" color="brand.600" letterSpacing="wide" textTransform="uppercase">
                    About the Method
                  </Text>

                  <Heading size="xl" fontWeight="bold">
                    Homework for Life
                  </Heading>
                  <Text color="fg.muted" fontSize="lg" lineHeight="tall">
                    Storyteller <Text as="span" fontWeight="semibold">Matthew Dicks</Text> once asked himself a simple question: 
                    how do you notice the moments that make an ordinary day worth remembering?  
                    <br /><br />
                    His answer became <Text as="span" color="brand.600" fontWeight="semibold">Homework for Life</Text> — a gentle practice of writing 
                    just one sentence each day. Over time, those small notes grow into a living archive 
                    of meaning, memory, and perspective.
                  </Text>
                </VStack>
              </Box>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  )
}