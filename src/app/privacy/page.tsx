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
              Last Updated: September 02, 2025
            </Badge>
            
            <Text color="gray.700" mb={6} lineHeight="1.6">
              This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
            </Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Definitions
            </Heading>
            <Text color="gray.700" mb={4} lineHeight="1.6">
              <Text as="span" fontWeight="bold">Company</Text> refers to Catardot. <Text as="span" fontWeight="bold">Country</Text> refers to Indonesia. <Text as="span" fontWeight="bold">Personal Data</Text> is any information that relates to an identified or identifiable individual. <Text as="span" fontWeight="bold">Service</Text> refers to the Website accessible from catardot.vercel.app.
            </Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Data Collection
            </Heading>
            <Text color="gray.700" mb={4} lineHeight="1.6">
              <Text as="span" fontWeight="bold">Usage Data:</Text> Collected automatically including your Device&apos;s IP address, browser type and version, pages visited, time and date of visit, time spent on pages, unique device identifiers and diagnostic data. For mobile devices, we collect device type, unique ID, IP address, operating system, and browser type.
            </Text>
            <Text color="gray.700" mb={4} lineHeight="1.6">
              <Text as="span" fontWeight="bold">Third-Party Social Media Services:</Text> Allow account creation through Google. We may collect Personal data already associated with your account such as name, email address.
            </Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Use of Personal Data
            </Heading>
            <Text color="gray.700" mb={2} lineHeight="1.6">We may use Personal Data for:</Text>
            <Text color="gray.700" mb={1} lineHeight="1.6">• To provide and maintain our Service and monitor usage</Text>
            <Text color="gray.700" mb={1} lineHeight="1.6">• To manage Your Account and registration as a user</Text>
            <Text color="gray.700" mb={1} lineHeight="1.6">• For performance of contracts and purchased services</Text>
            <Text color="gray.700" mb={1} lineHeight="1.6">• To manage Your requests and support</Text>
            <Text color="gray.700" mb={4} lineHeight="1.6">• For data analysis, usage trends, and service improvement</Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Sharing Personal Information
            </Heading>
            <Text color="gray.700" mb={2} lineHeight="1.6">We may share Your information:</Text>
            <Text color="gray.700" mb={1} lineHeight="1.6">• With Service Providers to monitor and analyze service use</Text>
            <Text color="gray.700" mb={4} lineHeight="1.6">• With Your consent for any other purpose</Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Data Retention & Transfer
            </Heading>
            <Text color="gray.700" mb={4} lineHeight="1.6">
              We retain Personal Data only as long as necessary for purposes in this Policy. We retain data to comply with legal obligations, resolve disputes, and enforce agreements. Your information may be transferred to computers outside your jurisdiction where data protection laws may differ.
            </Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Your Rights
            </Heading>
            <Text color="gray.700" mb={4} lineHeight="1.6">
              You have the right to delete or request assistance in deleting Personal Data we have collected. You may update, amend, or delete information through your Account settings or by contacting us. We may retain certain information when legally obligated.
            </Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Disclosure Requirements
            </Heading>
            <Text color="gray.700" mb={4} lineHeight="1.6">
              We may disclose Personal Data if required by law, for business transactions, law enforcement requests, or to comply with legal obligations, protect company rights, investigate wrongdoing, protect user safety, or defend against legal liability.
            </Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Security & Children&apos;s Privacy
            </Heading>
            <Text color="gray.700" mb={4} lineHeight="1.6">
              While we strive to protect Your Personal Data using commercially acceptable means, no internet transmission or electronic storage is 100% secure. Our Service does not address anyone under 13. We do not knowingly collect information from children under 13 without parental consent.
            </Text>

            <Heading as="h2" size="md" color="brand.500" mb={4}>
              Changes & Links
            </Heading>
            <Text color="gray.700" mb={6} lineHeight="1.6">
              We may update this Privacy Policy periodically. Changes are effective when posted. We have no control over third-party websites linked from our Service and advise reviewing their privacy policies.
            </Text>

            <Text color="gray.600" fontSize="sm" mb={4}>
              For questions about this Privacy Policy, contact us:
            </Text>

            <Text color="gray.600" fontSize="sm">
              Email: <Link href="mailto:ridhaarlian@proton.me" color="blue.500">ridhaarlian@proton.me</Link>
              <br />
              Website: <Link href="http://catardot.vercel.app" color="blue.500">catardot.vercel.app</Link>
            </Text>
          </Box>
        </Container>
      </Box>
    </>
  )
}