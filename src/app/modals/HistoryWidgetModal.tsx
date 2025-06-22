'use client'
import { useState } from 'react'
import { Box, Text, VStack, HStack, Button, Textarea, Card, Dialog, Portal, CloseButton } from '@chakra-ui/react'
import { useColorModeValue } from "@/components/ui/color-mode"
import { FiCalendar, FiEdit3, FiSave, FiX, FiEye } from 'react-icons/fi'

interface JournalEntry {
  id: string
  date: string
  title: string
  content: string
  moment?: string
  createdAt: string
}

interface HistoryWidgetModalProps {
  entry: JournalEntry
  onSave: (updatedEntry: JournalEntry) => void
}

export function HistoryWidgetModal({ entry, onSave }: HistoryWidgetModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  // const [editedTitle, setEditedTitle] = useState(entry.title)
  const [editedContent, setEditedContent] = useState(entry.content)
  const [editedMoment, setEditedMoment] = useState(entry.moment || '')

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const contentColor = useColorModeValue('gray.600', 'gray.400')
  // const labelColor = useColorModeValue('gray.700', 'gray.300')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleSave = () => {
    const updatedEntry: JournalEntry = {
      ...entry,
      content: editedContent,
      moment: editedMoment
    }
    onSave(updatedEntry)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedContent(entry.content)
    setEditedMoment(entry.moment || '')
    setIsEditing(false)
  }

  const handleClose = () => {
    handleCancel() // Reset form saat tutup
  }

  return (
    <Dialog.Root size="lg">
      <Dialog.Trigger asChild>
        <Button size="sm" variant="outline" colorScheme="blue" >
          <FiEye />
          Lihat Selengkapnya
        </Button>
      </Dialog.Trigger>
      <Portal>               
        <Dialog.Backdrop tabIndex={-1} aria-hidden="true" style={{ pointerEvents: 'auto' }}/>
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {isEditing ? 'Edit Jurnal' : 'Detail Jurnal'}
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              <VStack align="stretch" gap={4}>
                {/* Info tanggal dan waktu */}
                <Card.Root bg={useColorModeValue('blue.50', 'blue.900')} variant="outline">
                  <Card.Body py={3}>
                    <HStack justify="flex-start" align="center" gap={2}>
                      <Box as={FiCalendar} color="blue.500" />
                      <Text fontSize="sm" fontWeight="medium" color="blue.700">
                        {formatDate(entry.date)}
                      </Text>
                    </HStack>
                  </Card.Body>
                </Card.Root>

                {/* Konten */}
                <Box>
                  {isEditing ? (
                    <Textarea autoresize value={editedContent} onChange={(e) => setEditedContent(e.target.value)} placeholder="Tulis isi jurnal di sini..."/>
                  ) : (
                    <Box p={4} border="1px solid" borderColor={borderColor} borderRadius="md" bg={cardBg} maxH="300px" overflowY="auto">
                      <Text fontSize="sm" lineHeight="1.6" whiteSpace="pre-wrap">
                        {entry.content}
                      </Text>
                    </Box>
                  )}
                </Box>

                {/* Word count saat editing */}
                {isEditing && (
                  <Box>
                    <Text fontSize="xs" color={contentColor}>
                      Jumlah kata: {editedContent.split(' ').filter(word => word.length > 0).length}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap={3}>
                {isEditing ? (
                  <>
                    <Button variant="outline"colorScheme="gray"onClick={handleCancel}>
                      <FiX />
                      Batal
                    </Button>
                    <Button colorScheme="blue" onClick={handleSave} data-disabled={!editedContent.trim()}>
                      <FiSave />
                      Simpan Perubahan
                    </Button>
                  </>
                ) : (
                  <>
                    <Dialog.ActionTrigger asChild>
                      <Button variant="outline" colorScheme="gray" onClick={handleClose}>
                        Tutup
                      </Button>
                    </Dialog.ActionTrigger>
                    <Button colorScheme="blue" onClick={() => setIsEditing(true)}>
                      <FiEdit3 />
                      Edit Jurnal
                    </Button>
                  </>
                )}
              </HStack>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="lg" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default HistoryWidgetModal
