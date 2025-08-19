import { Box } from "@chakra-ui/react"
import { LandingPage } from "@/app/components/landing/landingPage"

export default function Home() {
  return (
    <>
      <Box bg={{ base: "whiteAlpha.400", _dark: "blackAlpha.400" }}>
        <LandingPage />
      </Box>
    </>
  )
}