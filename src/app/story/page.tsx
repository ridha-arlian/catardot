/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { Box} from '@chakra-ui/react'
import { Story } from '@/app/components/journal/story'
import { Navbar } from '@/app/components/journal/navbar'
import { Footer } from '@/app/components/journal/footer'

export default function StoryPage() {

  return (
    <>
      <Box minH='50vh' bg={{ base: 'whiteAlpha.400', _dark: 'blackAlpha.400' }} py={2} overflow='hidden'>
        
        <Navbar/>

        <Box minH='50vh' mt='60px' bg='gray.50'>

          <Story onDateChange={function (date: string): void {
            throw new Error('Function not implemented.')
          } } />

          <Footer/>
        
        </Box>
      </Box>
    </>
  )
}