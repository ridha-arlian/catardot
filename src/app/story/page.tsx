/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Box} from "@chakra-ui/react"
import { useSession } from "next-auth/react"
import { Story } from "@/app/components/journal/story"
import { Navbar } from "@/app/components/journal/navbar"
import { Footer } from "@/app/components/journal/footer"
import NotAuthorizedPage from "@/app/not-authorized/page"

export default function StoryPage() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return null
  if (status === "unauthenticated" || !session) {
    return <NotAuthorizedPage />
  }

  return (
    <>
      <Box minH="50vh" bg={{ base: "whiteAlpha.400", _dark: "blackAlpha.400" }} py={2} overflow="hidden">
        
        <Navbar/>

        <Box minH="50vh" mt="60px" bg="gray.50">

          <Story onDateChange={function (date: string): void {
            throw new Error("Function not implemented.")
          } } />

          <Footer/>
        
        </Box>
      </Box>
    </>
  )
}