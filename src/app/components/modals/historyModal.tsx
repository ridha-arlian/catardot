// /* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useColorModeValue } from "@/components/ui/color-mode"
import { FiCalendar, FiEdit3, FiSave, FiX, FiEye } from "react-icons/fi"
import { Box, Text, VStack, HStack, Button, Textarea, Card, Dialog, Portal, CloseButton } from "@chakra-ui/react"

interface JournalEntry {
  storyDate: string
  content: string
}

interface HistoryModalProps {
  entry: Partial<JournalEntry>
  onSave: (updatedEntry: Partial<JournalEntry>) => void
}

export const HistoryModal = ({ entry, onSave }: HistoryModalProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(entry.content || "")

  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const contentColor = useColorModeValue("gray.600", "gray.400")

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  const resetState = () => {
    setEditedContent(entry.content || "")
    setIsEditing(false)
    setIsSaving(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyDate: entry.storyDate,
          content: editedContent
        })
      })

      const data = await response.json()
      
      if (data.success) {
        onSave({ ...entry, content: editedContent })
        setIsEditing(false)
      } else {
        console.error("Error updating journal:", data.error)
        resetState()
      }
    } catch (error) {
      console.error("Fetch error:", error)
      resetState()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Dialog.Root size="lg">
        <Dialog.Trigger asChild>
          <Button size="sm" variant="outline" colorScheme="blue">
            <FiEye />
              Lihat Selengkapnya
            </Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop tabIndex={-1} aria-hidden="true" />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  {isEditing ? "Edit Catatan" : "Detail Catatan"}
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="lg" />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <VStack align="stretch" gap={4}>
                  <Card.Root bg={useColorModeValue("blue.50", "blue.900")} variant="outline">
                    <Card.Body py={3}>
                      <HStack gap={2}>
                        <Box as={FiCalendar} color="blue.500" />
                        <Text fontSize="sm" fontWeight="medium" color="blue.700">
                          {formatDate(entry.storyDate)}
                        </Text>
                      </HStack>
                    </Card.Body>
                  </Card.Root>

                  <Box>
                    {isEditing ? (
                      <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} placeholder="Tulis Catatan di sini..."/>
                    ) : (
                      <Box p={4} border="1px solid" borderColor={borderColor} borderRadius="md" bg={cardBg} maxH="300px" overflowY="auto">
                        <Text fontSize="sm" lineHeight="1.6" whiteSpace="pre-wrap">
                          {entry.content}
                        </Text>
                      </Box>
                    )}
                  </Box>

                  {isEditing && (
                    <Text fontSize="xs" color={contentColor}>
                      Jumlah kata: {editedContent.split(/\s+/).filter(Boolean).length}
                    </Text>
                  )}
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <HStack gap={3}>
                  {isEditing ? (
                    <>
                      <Button variant="outline" colorScheme="gray" onClick={resetState}>
                        <FiX />
                        Batal
                      </Button>
                      <Button colorScheme="blue" onClick={handleSave} disabled={!editedContent.trim()} loading={isSaving}>
                        <FiSave />
                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Dialog.ActionTrigger asChild>
                        <Button variant="outline" colorScheme="gray">
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
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}