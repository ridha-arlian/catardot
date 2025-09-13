import { Box } from "@chakra-ui/react"
import { Story } from "@/app/components/journal/story"
import { Footer } from "@/app/components/journal/footer"
import { Navbar } from "@/app/components/journal/navbar"

export default function StoryPage() {
  return (
    <>
      <Box minH="50vh" bg="bg.canvas" py={2} overflow="hidden">
        
        <Navbar/>
        
        <Box minH="50vh" mt="60px" bg="gray.50">
          
          <Story />
          
          <Footer/>
        
        </Box>
      </Box>
    </>
  )
}