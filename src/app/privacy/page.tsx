import { ColorModeButton } from '@/components/ui/color-mode'
import { Box, Container, Heading, Text, Badge, Link, Button } from '@chakra-ui/react'

export default function Home() {
  return (
    <>
      <Box bg="bg.canvas" minH="100vh">
        
        <Box position="fixed" top="4" right="4" zIndex="50">
          <Button rel="noopener noreferrer" size="sm" boxSize={10} variant="ghost" bg="inherit" _hover={{ transform: "scale(1.2) rotate(5deg)", border:"1px solid", borderColor:"sage.500" }} asChild>
            <ColorModeButton />
          </Button>
        </Box>

        <Container maxW="2xl" py={8}>
          <Box bg="white" p={8} borderRadius="lg" shadow="lg" borderWidth="1px" borderColor="gray.200">
            <Heading as="h1" size="lg" color="brand.500" mb={3}>
              Catardot Privacy Policy
            </Heading>
            
            <Badge colorScheme="green" mb={6}>
              Last Updated: March 30, 2026
            </Badge>
            
            <Text color="gray.700" mb={6} lineHeight="1.6">
              This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
            </Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Definitions
            </Heading>
            <Text color="gray.700" mb={4} lineHeight="1.6">
              <Text as="span" fontWeight="bold">Company</Text> refers to Catardot. <Text as="span" fontWeight="bold">Country</Text> refers to Indonesia. <Text as="span" fontWeight="bold">Personal Data</Text> is any information that relates to an identified or identifiable individual. <Text as="span" fontWeight="bold">Service</Text> refers to the Website accessible from <Link href="https://catardot.ridhaarlian.my.id" color="blue.500">https://catardot.ridhaarlian.my.id</Link>.
            </Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Google User Data & Scopes
            </Heading>
            <Text color="gray.700" mb={4} lineHeight="1.6">
              Our Service uses Google OAuth to provide core features. We specifically request access to <Text as="span" fontWeight="bold">See, edit, create, and delete your Google Sheets spreadsheets</Text>.
            </Text>
            <Text color="gray.700" mb={4} lineHeight="1.6">
              <Text as="span" fontWeight="bold">How we use this data:</Text> Catardot uses the Google Sheets API to automatically create a dedicated spreadsheet in your Google Drive to store your journaling entries. We only store the Spreadsheet ID in our database, which is <Text as="span" fontWeight="bold">fully encrypted at rest</Text>. We do NOT store your actual journal content on our servers.
            </Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Use of Personal Data
            </Heading>
            <Text color="gray.700" mb={2} lineHeight="1.6">We may use Personal Data for:</Text>
            <Text color="gray.700" mb={1} lineHeight="1.6">• To provide and maintain the "Homework for Life" journaling service</Text>
            <Text color="gray.700" mb={1} lineHeight="1.6">• To manage Your Account and authentication via Google</Text>
            <Text color="gray.700" mb={1} lineHeight="1.6">• To execute authorized API calls to your personal Google Sheets</Text>
            <Text color="gray.700" mb={4} lineHeight="1.6">• To ensure the security of encrypted access keys</Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Data Retention & Your Rights
            </Heading>
            <Text color="gray.700" mb={4} lineHeight="1.6">
              We retain Personal Data only as long as necessary. Since your journal data is stored in your own Google Sheets, you maintain full control and ownership. You have the right to delete your account, which will remove the encrypted Spreadsheet ID from our records.
            </Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Security
            </Heading>
            <Text color="gray.700" mb={4} lineHeight="1.6">
              We use industry-standard encryption to protect sensitive identifiers. However, no method of transmission over the internet is 100% secure.
            </Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Changes & Links
            </Heading>
            <Text color="gray.700" mb={6} lineHeight="1.6">
              We may update this Privacy Policy periodically. Changes are effective when posted on this page.
            </Text>

            <Text color="gray.600" fontSize="sm" mb={4}>
              For questions about this Privacy Policy, contact us:
            </Text>

            <Text color="gray.600" fontSize="sm">
              Email: <Link href="mailto:ridha.arlian19@gmail.com" color="blue.500">ridha.arlian19@gmail.com</Link>
              <br />
              Website: <Link href="https://catardot.ridhaarlian.my.id" color="blue.500">catardot.ridhaarlian.my.id</Link>
            </Text>
          </Box>
        </Container>
      </Box>
    </>
  )
}