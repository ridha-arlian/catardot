'use client'
// import { useRouter } from 'next/navigation'
import { Box, Heading, Container, Button, Flex, Spinner } from '@chakra-ui/react'
import { useState, Suspense, lazy } from "react";
// import LoginModal from '../../modals/LoginModal'

const GoogleIcon    = lazy(() => import('../../../components/icons/GoogleIcon'));

const IconFallback = () => (
  <Spinner size="sm" color="gray.400"/>
);

export function LandingPage() {
  const [hovered, setHovered] = useState(false);
  // const router = useRouter()

  // const handleDemoClick = () => {
  //   router.push('/demo')
  // }

  return (
    <>
      <Box as="section" id="header" role="banner" height="100vh" bg="blue.normal" position="relative" overflow="hidden" aria-label="Hero section">
        <Container maxW="container.md" position="relative" zIndex={2} height="100%">
          <Flex width="100%" height="100%" justifyContent="center" alignItems="center"> 
            <Box textAlign="center" role="region" aria-labelledby="hero-heading">
              <Heading id="hero-heading" as="h1" textStyle="roboto" color="white" mb="20px" m={0} p={0} role="heading" aria-level={1}>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit.
              </Heading>
              <Flex direction={{ base: "column", md: "row" }} justify="center" gap={4} width="100%" role="group" aria-label="Action buttons">
                
                {/* <Button variant='solid' colorPalette="brown" color="black" fontSize="18px" px="30px" py="15px" _hover={{ boxShadow: "0px 14px 30px -15px rgba(0, 0, 0, 0.75)" }} width={{ base: "80%", md: "auto" }} margin={{ base: "0 auto", md: "unset" }} onClick={handleDemoClick} aria-label="Try a demo of our application" tabIndex={0} role="button">
                  Try a Demo
                </Button> */}
                <Button variant="outline" px="2" py="7" rounded="lg" justifyContent="center" _hover={{ bg: "brown.500", color: "black" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} aria-label="Login with Google" tabIndex={0}>
                  <Suspense fallback={<IconFallback />}>
                    <GoogleIcon isHovered={hovered}/>
                  </Suspense>
                  Sign-in with Google 
                </Button>
                {/* <LoginModal /> */}
              </Flex>
            </Box>
          </Flex>
        </Container>
      </Box>
    </>
  )
}