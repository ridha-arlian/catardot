import { auth } from "../../auth"
import { Box } from "@chakra-ui/react"
import { redirect } from "next/navigation"
import { LandingPage } from "@/app/components/landing/landingPage"

export default async function Home() {
  const session = await auth()
  
  if (session?.user) {
    redirect('/story')
  }
  return (
    <>
      <Box bg="bg.canvas">
        <LandingPage />
      </Box>
    </>
  )
}