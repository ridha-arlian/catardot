// /* eslint-disable @typescript-eslint/no-unused-vars */
import { auth } from "../../../auth"
import { Box } from "@chakra-ui/react"
import { redirect } from "next/navigation"
import { Story } from "@/app/components/journal/story"
import { Footer } from "@/app/components/journal/footer"
import { Navbar } from "@/app/components/journal/navbar"

export default async function StoryPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/not-authorized');
  }

  return (
    <>
      <Box minH="50vh" bg={{ base: "whiteAlpha.400", _dark: "blackAlpha.400" }} py={2} overflow="hidden">
        
        <Navbar/>

        <Box minH="50vh" mt="60px" bg="gray.50">

          <Story />

          <Footer/>
        
        </Box>
      </Box>
    </>
  )
}