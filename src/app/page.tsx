import { Box } from '@chakra-ui/react'
import { LandingPage } from './components/landing/LandingPage'

export default function Home() {
  return (
    <>
      <Box bg="blue.normal">
        <LandingPage />
      </Box>
    </>
  )
}