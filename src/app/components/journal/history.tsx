/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useDebounce } from "use-debounce"
import { monthNames } from "@/app/utils/month"
import { toaster } from "@/components/ui/toaster"
import { RefreshCw, Edit3, Save, X } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Box, VStack, HStack, Text, Portal, Select, createListCollection, Button, Skeleton, Textarea, Center, Badge } from "@chakra-ui/react"

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

  const isLoadingRef = useRef(false)
  const lastRefreshTrigger = useRef(0)

  const fetchEntries = useCallback(async (forceRefresh = false) => {
    const key = `${debouncedYear}-${debouncedMonth}`

    if (isLoadingRef.current && !forceRefresh) {
      console.log("Fetch already in progress, skipping...")
      return
    }

    if (!forceRefresh) {
      const cachedData = cache[key]
      if (cachedData) {
        console.log(`Using cached data for ${key}`)
        setEntries(cachedData)
        return
      }
    }

    isLoadingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        month: debouncedMonth,
        year: debouncedYear
      })
      
      if (forceRefresh) params.append('refresh', 'true')

      console.log(`Fetching entries for ${debouncedMonth}/${debouncedYear}${forceRefresh ? ' (force)' : ''}`)

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
      console.log(`✅ Fetched ${entriesArray.length} entries for ${debouncedMonth}/${debouncedYear}`)
      
    } catch (err) {
      console.error("❌ Error fetching monthly entries:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch entries")
      setEntries([])
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [debouncedMonth, debouncedYear])

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
      
      setEntries(prev => prev.map(entry => (entry.storyDate === entryDate || entry.date === entryDate) ? { ...entry, content: editContent } : entry))
      
      const key = `${debouncedYear}-${debouncedMonth}`
      setCache(prev => ({
        ...prev,
        [key]: prev[key]?.map(entry => (entry.storyDate === entryDate || entry.date === entryDate) ? { ...entry, content: editContent } : entry) || []
      }))
      
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
    console.log(`Month/Year changed: ${debouncedMonth}/${debouncedYear}`)
    fetchEntries()
  }, [debouncedMonth, debouncedYear, fetchEntries])

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && refreshTrigger !== lastRefreshTrigger.current) {
      console.log(`🔄 Refresh trigger activated: ${refreshTrigger}`)
      lastRefreshTrigger.current = refreshTrigger
      
      const timeoutId = setTimeout(() => {
        fetchEntries(true)
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [refreshTrigger, fetchEntries])

  const handleManualRefresh = useCallback(() => {
    if (isLoadingRef.current) {
      console.log("Already refreshing, skipping manual refresh")
      return
    }
    console.log("🔄 Manual refresh triggered")
    fetchEntries(true)
  }, [fetchEntries])

  const invalidateCurrentCache = useCallback(() => {
    const key = `${debouncedYear}-${debouncedMonth}`
    setCache(prev => {
      const newCache = { ...prev }
      delete newCache[key]
      console.log(`🗑️  Cache invalidated for ${key}`)
      return newCache
    })
  }, [debouncedYear, debouncedMonth])

  return (
    <>
      <VStack gap={6} align="stretch">
        <Box border="2px solid" borderColor="sage.500" borderRadius="md" bg="bg.canvas" shadow="sm" overflow="hidden">
          <Box p={4} borderBottom="2px solid" borderColor="sage.500" bg="bg.canvas">
            <HStack gap={3} justify="center">
              <Select.Root collection={monthCollection} size="sm" width="140px" value={[selectedMonth]} onValueChange={(val) => {
                const newMonth = Array.isArray(val.value) ? val.value[0] : val.value
                console.log(`Month changed to: ${newMonth}`)
                setSelectedMonth(newMonth)
                invalidateCurrentCache()
              }}>
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger bg="bg.canvas" border="2px solid" borderColor="sage.500" textStyle="selectHistory">
                    <Select.ValueText placeholder="Month" textStyle="selectHistory" />
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

              <Select.Root collection={yearCollection} size="sm" width="110px" value={[selectedYear]} onValueChange={(val) => {
                const newYear = Array.isArray(val.value) ? val.value[0] : val.value
                console.log(`Year changed to: ${newYear}`)
                setSelectedYear(newYear)
                invalidateCurrentCache()
              }}>
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger bg="bg.canvas" border="2px solid" borderColor="sage.500" textStyle="selectHistory">
                    <Select.ValueText placeholder="Year" textStyle="selectHistory" />
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

              <Button size="sm" variant="outline" onClick={handleManualRefresh} disabled={loading || isLoadingRef.current} bg="bg.canvas" border="2px solid" borderColor="sage.500" px={3}>
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
                Try Again
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
                      <Skeleton height="20px" width="200px"/>
                      <Skeleton height="16px" width="100%"/>
                      <Skeleton height="16px" width="80%"/>
                      <Skeleton height="24px" width="60px"/>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            ) : entries.length > 0 ? (
              <VStack gap={4} p={4} align="stretch">
                {/* Summary Info */}
                <Box p={2} bg="bg.canvas" borderRadius="md" border="2px solid" borderColor="sage.500">
                  <Text textStyle="summaryHistory" color="white">
                    Total {entries.length} stories in {monthNames[parseInt(selectedMonth) - 1]} {selectedYear}
                  </Text>
                </Box>

                {entries.map((entry) => {
                  const entryDate = entry.storyDate || entry.date
                  if (!entryDate) return null
                
                  const isEditing = editingId === entryDate
                  const today = new Date()
                  const entryDateObj = new Date(entryDate)
                  const isTodayEntry = entryDateObj.toDateString() === today.toDateString()

                  return (
                    <Box key={entryDate} shadow="sm" p={4} borderRadius="md" border="2px solid" borderColor="sage.500">
                      <VStack align="start" gap={3} w="100%">
                        <Text textStyle="headingHistoryList">
                          {(() => {
                            const date = new Date(entryDate)
                            const weekday = date.toLocaleDateString("en-GB", { weekday: "long" })
                            const datepart = date.toLocaleDateString("en-GB", { 
                              year: "numeric", 
                              month: "long", 
                              day: "numeric" 
                            })
                            return `${weekday}, ${datepart}`
                          })()}
                          {isTodayEntry && (
                            <Badge ml={1} colorPalette="green" mt="2" textStyle="badgeHistoryList">
                              Today
                            </Badge>
                          )}
                        </Text>
                        
                        {isEditing ? (
                          <VStack gap={4} align="stretch" w="100%">
                            <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} textStyle="contentHistoryList" color="white" autoresize autoFocus disabled={isSaving}/>
                                                      
                            <HStack gap={2} justify="center">
                              <Button size="sm" variant="outline" onClick={() => handleSaveEdit(entryDate)} disabled={!editContent.trim() || isSaving} bg="bg.canvas" color="white" border="1px solid" borderColor="sage.500">
                                <Save size={14} />
                                {isSaving ? "Saving..." : "Save"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isSaving} border="1px solid" borderColor="sage.500">
                                <X size={14} />
                                Cancel
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
                              {!isTodayEntry ? (
                                <Button variant="outline" size="sm" onClick={() => startEdit(entry)} border="1px solid" borderColor="sage.500" textStyle="ButtonStoryBoxEdit">
                                  <Edit3 size={14} />
                                  Edit
                                </Button>
                              ) : (
                                <Text textStyle="infoTodayHistoryList" color="gray.400" textAlign="center">
                                  Edit in the main box for today&apos;s story
                                </Text>
                              )}
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
                  No stories for this month and year
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </VStack>
    </>
  )
}