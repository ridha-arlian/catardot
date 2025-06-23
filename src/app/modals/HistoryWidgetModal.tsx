/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react'
import { Box, Text, VStack, HStack, Button, Textarea, Card, Dialog, Portal, CloseButton } from '@chakra-ui/react'
import { useColorModeValue } from "@/components/ui/color-mode"
import { FiCalendar, FiEdit3, FiSave, FiX, FiEye } from 'react-icons/fi'

interface JournalEntry {
  id: string
  content: string
  storyDate: string
  createdAt: string
  userId: string
}

interface HistoryWidgetModalProps {
  entry: JournalEntry
  onSave: (updatedEntry: JournalEntry) => void
}

export function HistoryWidgetModal({ entry, onSave }: HistoryWidgetModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(entry.content)
  const [isSaving, setIsSaving] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const contentColor = useColorModeValue('gray.600', 'gray.400')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const resetState = () => {
    setEditedContent(entry.content)
    setIsEditing(false)
    setIsSaving(false)
  }

  const cancelRequest = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    const controller = new AbortController()
    setAbortController(controller)
    try {
      const response = await fetch('/api/story', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: entry.id,
          content: editedContent,
          userId: entry.userId
        }),
        signal: controller.signal
      })

      const data = await response.json()

      if (data.success) {
        onSave({ ...entry, content: editedContent })
        setIsEditing(false)
      } else {
        console.error('Error updating journal:', data.error)
        resetState()
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        resetState()
      }
    } finally {
      setIsSaving(false)
      setAbortController(null)
    }
  }

  const handleCancel = () => {
    cancelRequest()
    resetState()
  }

  const handleClose = () => {
    cancelRequest()
    handleCancel()
  }
  
  return (
    <>
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
                  {isEditing ? 'Edit Catatan' : 'Detail Catatan'}
                </Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                <VStack align="stretch" gap={4}>
                  <Card.Root bg={useColorModeValue('blue.50', 'blue.900')} variant="outline">
                    <Card.Body py={3}>
                      <HStack justify="flex-start" align="center" gap={2}>
                        <Box as={FiCalendar} color="blue.500" />
                        <Text fontSize="sm" fontWeight="medium" color="blue.700">
                          {formatDate(entry.storyDate)}
                        </Text>
                      </HStack>
                    </Card.Body>
                  </Card.Root>

                  <Box>
                    {isEditing ? (
                      <Textarea autoresize value={editedContent} onChange={(e) => setEditedContent(e.target.value)} placeholder="Tulis Catatan di sini..."/>
                    ) : (
                      <Box p={4} border="1px solid" borderColor={borderColor} borderRadius="md" bg={cardBg} maxH="300px" overflowY="auto">
                        <Text fontSize="sm" lineHeight="1.6" whiteSpace="pre-wrap">
                          {entry.content}
                        </Text>
                      </Box>
                    )}
                  </Box>

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
                      <Button colorScheme="blue" onClick={handleSave} disabled={!editedContent.trim() || isSaving} loading={isSaving}>
                        <FiSave />
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
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
                        Edit Catatan
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
    </>
  )
}

export default HistoryWidgetModal