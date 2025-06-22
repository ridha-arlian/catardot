'use client'
import { Box, VStack, HStack, Text, Card, Status } from '@chakra-ui/react'
import { useColorModeValue } from "@/components/ui/color-mode"

export const StatusWidget = () => {
  const cardBg = useColorModeValue('white', 'gray.800')
  return (
    <Box flex="1" display="flex" ms="3">
      <VStack align="start">
        <Card.Root  bg={cardBg} shadow="md" width="100%" borderLeft="4px solid" borderLeftColor="orange.500">
          <Card.Body py={4}>
            {/* Status Header */}
            <HStack>
              <Status.Root size="lg" colorPalette="red">
                <Status.Indicator />
              </Status.Root>
              <Box color="orange.500" fontSize="xl"/>
              <Text fontWeight="semibold" color="orange.600" fontSize="lg">
                Belum Menulis Jurnal
              </Text>
            </HStack>
            {/* Status Message */}
            <Text fontSize="md" color={useColorModeValue("gray.600", "gray.400")} lineHeight="1.5">
              Kamu belum menulis jurnal harian hari ini.
            </Text>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  )
}