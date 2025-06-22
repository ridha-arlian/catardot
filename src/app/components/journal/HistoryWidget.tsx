/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, useEffect } from 'react'
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Badge, 
  Button,
  Card,
  Heading
} from '@chakra-ui/react'
import { useColorModeValue } from "@/components/ui/color-mode"
import { FiEye, FiEdit } from 'react-icons/fi'
import HistoryWidgetModal from '../../modals/HistoryWidgetModal'

interface JournalEntry {
  id: string
  date: string
  title: string
  content: string
  moment?: string
  createdAt: string
}

interface JournalHistoryProps {
  selectedDate: Date
}

// Mock data untuk testing - satu jurnal per tanggal
const mockJournalData: Record<string, JournalEntry> = {
  '2025-06-15': {
    id: '1',
    date: '2025-06-15',
    title: 'Hari yang Menyenangkan',
    content: 'Hari ini saya bertemu dengan teman lama di kafe. Kami berbincang tentang masa depan dan berbagi cerita tentang pekerjaan masing-masing. Rasanya sangat menyenangkan bisa bertemu kembali setelah sekian lama. Kami juga merencanakan untuk bertemu lagi minggu depan.',
    moment: 'Sore hari',
    createdAt: '2025-06-15T15:30:00Z'
  },
  '2025-06-14': {
    id: '2', 
    date: '2025-06-14',
    title: 'Refleksi Minggu Ini',
    content: 'Minggu ini cukup produktif. Saya berhasil menyelesaikan beberapa project penting dan belajar hal-hal baru. Meskipun ada beberapa tantangan, saya merasa berkembang dan semakin percaya diri. Semoga minggu depan bisa lebih baik lagi.',
    moment: 'Malam hari',
    createdAt: '2025-06-14T21:15:00Z'
  },
  '2025-06-13': {
    id: '3',
    date: '2025-06-13', 
    title: 'Pelajaran Berharga',
    content: 'Hari ini saya belajar bahwa kesabaran adalah kunci. Ada situasi yang membuat saya hampir menyerah, tapi dengan tetap tenang dan fokus, saya bisa melewatinya dengan baik. Ini adalah pelajaran yang akan saya ingat selamanya.',
    moment: 'Pagi hari',
    createdAt: '2025-06-13T08:45:00Z'
  }
}

export const HistoryWidget = ({ selectedDate }: JournalHistoryProps) => {
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const contentColor = useColorModeValue('gray.600', 'gray.400')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const emptyBg = useColorModeValue('gray.50', 'gray.700')

  // Update jurnal ketika tanggal berubah
  useEffect(() => {
    const dateKey = selectedDate.toISOString().split('T')[0]
    const entry = mockJournalData[dateKey] || null
    setCurrentEntry(entry)
  }, [selectedDate])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Handler untuk membuka modal
  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  // Handler untuk menutup modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  // Handler untuk menyimpan perubahan
  const handleSaveChanges = (updatedEntry: JournalEntry) => {
    console.log('Saving changes:', updatedEntry)
    // Nanti akan update data
    setCurrentEntry(updatedEntry)
    setIsModalOpen(false)
  }

  return (
    <>
      <Card.Root bg={cardBg} shadow="md">
        <Card.Body>
          <Heading size="md" mb={4} color="purple.500">
            Riwayat Jurnal
          </Heading>

          {/* Content area dengan tinggi tetap */}
          <Box minH="250px" display="flex" flexDirection="column">
            {currentEntry ? (
              <Box p={4} border="1px solid" borderColor={borderColor} borderRadius="md" _hover={{ bg: hoverBg }} transition="all 0.2s" flex="1" display="flex" flexDirection="column">
                <VStack align="stretch" gap={3} flex="1">
                  {/* Header dengan waktu - Fixed height */}
                  <Box minH="8">
                    {currentEntry.moment && (
                      <Badge colorScheme="green" variant="subtle" size="sm">
                        {formatSelectedDate()}
                      </Badge>
                    )}
                  </Box>

                  {/* Preview konten - Fixed height */}
                  <Box flex="1" minH="20">
                    <Text fontSize="sm" color={contentColor} lineHeight="1.5" lineClamp={4}>
                      {currentEntry.content}
                    </Text>
                  </Box>

                  {/* Tombol aksi - Fixed height */}
                  <Box minH="10" display="flex" alignItems="end">
                    <HStack justify="center" width="100%">
                      <HistoryWidgetModal entry={currentEntry} onSave={handleSaveChanges}/>
                    </HStack>
                  </Box>
                </VStack>
              </Box>
            ) : (
              /* Empty state - Fixed height */
              <Box p={6} bg={emptyBg} borderRadius="md" textAlign="center" flex="1" display="flex" alignItems="center" justifyContent="center">
                <VStack gap={3}>
                  <Box as={FiEdit} fontSize="2xl" color={contentColor} />
                  <Text fontWeight="medium" color={contentColor}>
                    Belum ada jurnal
                  </Text>
                  <Text fontSize="sm" color={contentColor}>
                    Belum ada jurnal yang dibuat untuk tanggal ini
                  </Text>
                  <Button size="sm" colorScheme="blue" variant="outline" onClick={() => { console.log('Mulai menulis jurnal untuk:', formatSelectedDate()) }}>
                    <FiEdit />
                    Mulai Menulis
                  </Button>
                </VStack>
              </Box>
            )}
          </Box>
        </Card.Body>
      </Card.Root>
    </>
  )
}
