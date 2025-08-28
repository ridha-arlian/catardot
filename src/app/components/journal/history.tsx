/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useDebounce } from "use-debounce"
import { monthNames } from "@/app/utils/month"
import { toaster } from "@/components/ui/toaster"
import { RefreshCw, Edit3, Save, X } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Box, VStack, HStack, Text, Portal, Select, createListCollection, Button, Skeleton, Separator, Textarea, Center } from "@chakra-ui/react"

interface JournalEntry {
  storyDate: string
  content: string
  date?: string
}

interface HistoryProps {
  refreshTrigger?: number
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }).map((_, i) => currentYear - i)

const monthCollection = createListCollection({
  items: monthNames.map((month, idx) => ({
    label: month,
    value: (idx + 1).toString(),
    category: "Months",
  })),
})

const yearCollection = createListCollection({
  items: years.map((y) => ({
    label: y.toString(),
    value: y.toString(),
    category: "Years",
  })),
})

export const History = ({ refreshTrigger }: HistoryProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [cache, setCache] = useState<Record<string, JournalEntry[]>>({})
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1 ).toString())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const [debouncedYear] = useDebounce(selectedYear, 300)
  const [debouncedMonth] = useDebounce(selectedMonth, 300)

  const fetchEntries = useCallback(async (forceRefresh = false) => {
    const key = `${debouncedYear}-${debouncedMonth}`

    if (!forceRefresh && cache[key]) {
      setEntries(cache[key])
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        month: debouncedMonth,
        year: debouncedYear
      })
      
      if (forceRefresh) params.append('refresh', 'true')

      const res = await fetch(`/api/story?${params}`, {
        credentials: "include"
      })
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      
      const data = await res.json()
      
      const entriesArray = Array.isArray(data) ? data.map((entry: any) => ({
        storyDate: entry.storyDate || entry.date,
        content: entry.content,
        date: entry.date || entry.storyDate
      })) : []
      
      entriesArray.sort((a, b) => new Date(b.storyDate).getTime() - new Date(a.storyDate).getTime())
      setEntries(entriesArray)
      setCache(prev => ({ ...prev, [key]: entriesArray }))
      console.log(`Fetched ${entriesArray.length} entries for ${debouncedMonth}/${debouncedYear}`)
      
    } catch (err) {
      console.error("Error fetching monthly entries:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch entries")
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [debouncedMonth, debouncedYear, cache])

  const saveEntryToAPI = async (content: string, date: string) => {
    const response = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        content,
        storyDate: date
      }),
      credentials: "include"
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Gagal menyimpan catatan")
    return data
  }

  const handleSaveEdit = async (entryDate: string) => {
    if (!editContent.trim()) {
      toaster.create({
        title: "Catatan Kosong",
        description: "Mohon isi catatan terlebih dahulu",
        type: "warning",
        duration: 3000,
      })
      return
    }

    setIsSaving(true)
    
    const savePromise = saveEntryToAPI(editContent, entryDate)
    
    toaster.promise(savePromise, {
      success: {
        title: "Catatan Berhasil Diperbarui!",
        description: "Perubahan Anda telah tersimpan",
        duration: 3000,
      },
      error: {
        title: "Gagal Memperbarui Catatan",
        description: "Terjadi kesalahan saat menyimpan. Silakan coba lagi",
        duration: 5000,
      },
      loading: {
        title: "Menyimpan...",
        description: "Sedang memperbarui catatan Anda"
      },
    })

    try {
      await savePromise
      
      // Update local state
      setEntries(prev => prev.map(entry => 
        (entry.storyDate === entryDate || entry.date === entryDate) 
          ? { ...entry, content: editContent }
          : entry
      ))
      
      // Update cache
      const key = `${debouncedYear}-${debouncedMonth}`
      setCache(prev => ({
        ...prev,
        [key]: prev[key]?.map(entry => 
          (entry.storyDate === entryDate || entry.date === entryDate)
            ? { ...entry, content: editContent }
            : entry
        ) || []
      }))
      
      // Exit edit mode
      setEditingId(null)
      setEditContent("")
      
    } catch (error) {
      console.error("Error updating entry:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const startEdit = (entry: JournalEntry) => {
    const entryDate = entry.storyDate || entry.date
    if (!entryDate) {
      console.error("Cannot edit entry: no date found")
      return
    }
    setEditingId(entryDate)
    setEditContent(entry.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  useEffect(() => {
    fetchEntries()
  }, [debouncedMonth, debouncedYear, fetchEntries])

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log("Refresh trigger activated, force refreshing history")
      fetchEntries(true)
    }
  }, [refreshTrigger, fetchEntries])

  const handleManualRefresh = () => {
    console.log("Manual refresh triggered")
    fetchEntries(true)
  }

  const invalidateCurrentCache = () => {
    const key = `${debouncedYear}-${debouncedMonth}`
    setCache(prev => {
      const newCache = { ...prev }
      delete newCache[key]
      return newCache
    })
    console.log(`Cache invalidated for ${key}`)
  }

  return (
    <>
      <VStack gap={6} align="stretch">
        {/* Main Container */}
        <Box border="2px solid" borderColor="sage.500" borderRadius="md" bg="bg.canvas" shadow="sm" overflow="hidden">
          {/* Filter Controls */}
          <Box p={4} borderBottom="2px solid" borderColor="sage.500" bg="bg.canvas">
            <HStack gap={3} justify="center">
              {/* Select Bulan */}
              <Select.Root collection={monthCollection} size="sm" width="140px" value={[selectedMonth]} onValueChange={(val) => {
                const newMonth = Array.isArray(val.value) ? val.value[0] : val.value
                setSelectedMonth(newMonth)
                invalidateCurrentCache()
              }}>
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger bg="bg.canvas" border="2px solid" borderColor="sage.500" textStyle="selectHistory">
                    <Select.ValueText placeholder="Pilih Bulan" textStyle="selectHistory" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      <Select.ItemGroup key="Months">
                        {monthCollection.items.map((item) => (
                          <Select.Item item={item} key={item.value} textStyle="selectHistory">
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.ItemGroup>
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>

              {/* Select Tahun */}
              <Select.Root collection={yearCollection} size="sm" width="110px" value={[selectedYear]} onValueChange={(val) => {
                const newYear = Array.isArray(val.value) ? val.value[0] : val.value
                setSelectedYear(newYear)
                invalidateCurrentCache()
              }}>
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger bg="bg.canvas" border="2px solid" borderColor="sage.500" textStyle="selectHistory">
                    <Select.ValueText placeholder="Tahun" textStyle="selectHistory" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      <Select.ItemGroup key="Years">
                        {yearCollection.items.map((item) => (
                          <Select.Item item={item} key={item.value} textStyle="selectHistory">
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.ItemGroup>
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>

              {/* Refresh Button */}
              <Button size="sm" variant="outline" onClick={handleManualRefresh} disabled={loading} bg="bg.canvas" border="2px solid" borderColor="sage.500" px={3}>
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </Button>
            </HStack>
          </Box>

          {/* Error State */}
          {error && (
            <Box p={4} bg="red.50" borderBottom="1px solid" borderColor="red.200">
              <Text color="red.600" fontSize="sm">
                Error: {error}
              </Text>
              <Button size="sm" mt={2} onClick={handleManualRefresh}>
                Coba Lagi
              </Button>
            </Box>
          )}

          {/* History List */}
          <Box maxH="500px" overflowY="auto" scrollbar="thin">
            {loading ? (
              <VStack gap={3} p={4}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Box key={index} w="100%" shadow="sm" p={4} borderRadius="md" border="2px solid" borderColor="sage.500">
                    <VStack align="start" gap={3}>
                      <Skeleton height="20px" width="200px" />
                      <Skeleton height="16px" width="100%" />
                      <Skeleton height="16px" width="80%" />
                      <Skeleton height="24px" width="60px" />
                    </VStack>
                  </Box>
                ))}
              </VStack>
            ) : entries.length > 0 ? (
              <VStack gap={4} p={4} align="stretch">
                {/* Summary Info */}
                <Box p={2} bg="bg.canvas" borderRadius="md" border="2px solid" borderColor="sage.500">
                  <Text textStyle="summaryHistory" color="white">
                    Total {entries.length} catatan di {monthNames[parseInt(selectedMonth) - 1]} {selectedYear}
                  </Text>
                </Box>

                {entries.map((entry) => {
                  const entryDate = entry.storyDate || entry.date
                  if (!entryDate) return null
                  
                  const isEditing = editingId === entryDate

                  return (
                    <Box key={entryDate} shadow="sm" p={4} borderRadius="md" border="2px solid" borderColor="sage.500">
                      <VStack align="start" gap={3} w="100%">
                        {/* Date Header */}
                        <Text textStyle="headingHistoryList">
                          {new Date(entryDate).toLocaleDateString("id-ID", { 
                            weekday: "long", 
                            year: "numeric", 
                            month: "long", 
                            day: "numeric" 
                          })}
                        </Text>
                        {isEditing ? (
                          <VStack gap={4} align="stretch" w="100%">
                            <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} textStyle="contentHistoryList" color="white" autoresize autoFocus disabled={isSaving}/>
                                                      
                            <HStack gap={2} justify="center">
                              <Button size="sm" variant="outline" onClick={() => handleSaveEdit(entryDate)} disabled={!editContent.trim() || isSaving} bg="bg.canvas" color="white" border="1px solid" borderColor="sage.500">
                                <Save size={14} />
                                {isSaving ? "Menyimpan..." : "Simpan"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isSaving} border="1px solid" borderColor="sage.500">
                                <X size={14} />
                                Batal
                              </Button>
                            </HStack>
                          </VStack>
                        ) : (
                          <VStack gap={3} align="stretch" w="100%">
                            <Box rounded="md" p={3} border="1px solid" borderColor="sage.500" bg="bg.canvas">
                              <Text textStyle="contentHistoryList" color="white" fontStyle="italic">
                                &quot;{entry.content}&quot;
                              </Text>
                            </Box>

                            <Center>
                              <Button variant="outline" size="sm" onClick={() => startEdit(entry)} border="1px solid" borderColor="sage.500"textStyle="ButtonStoryBoxEdit">
                                <Edit3 size={14} />
                                Sunting
                              </Button>
                            </Center>
                          </VStack>
                        )}
                      </VStack>
                    </Box>
                  )
                })}
              </VStack>
            ) : (
              <Box p={6} textAlign="center">
                <Text color="gray.500">
                  Belum ada catatan untuk bulan & tahun ini
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </VStack>
    </>
  )
}