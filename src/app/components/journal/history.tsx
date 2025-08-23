/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useDebounce } from "use-debounce"
import { monthNames } from "@/app/utils/month"
import { useState, useEffect, useCallback } from "react"
import { HistoryModal } from "@/app/components/modals/historyModal"
import { Box, VStack, HStack, Text, Portal, Select, createListCollection, Button } from "@chakra-ui/react"

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

  const handleEntryUpdate = (updatedEntry: Partial<JournalEntry>) => {
    const targetDate = updatedEntry.storyDate || updatedEntry.date
    if (!targetDate) return
    setEntries((prev) => prev.map((e) => (e.storyDate === targetDate || e.date === targetDate) ? { ...e, ...updatedEntry } : e))
    const key = `${debouncedYear}-${debouncedMonth}`
    setCache(prev => ({ ...prev, [key]: prev[key]?.map(e => (e.storyDate === targetDate || e.date === targetDate) ? { ...e, ...updatedEntry } : e) || [] }))
    console.log(`Local state updated for ${targetDate}`)
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
        <HStack gap={4} justify="space-between">
          <HStack gap={4}>
            {/* Select Bulan */}
            <Select.Root collection={monthCollection} size="sm" width="150px" value={[selectedMonth]} onValueChange={(val) => {
              const newMonth = Array.isArray(val.value) ? val.value[0] : val.value
              setSelectedMonth(newMonth)
              invalidateCurrentCache()
            }}>
              <Select.HiddenSelect />
              <Select.Label>
                Select Month
              </Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select Month" />
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
                        <Select.Item item={item} key={item.value}>
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
            <Select.Root collection={yearCollection} size="sm" width="120px" value={[selectedYear]} onValueChange={(val) => {
              const newYear = Array.isArray(val.value) ? val.value[0] : val.value
              setSelectedYear(newYear)
              invalidateCurrentCache()
            }}>
              <Select.HiddenSelect />
              <Select.Label>
                Select Year
              </Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select Year" />
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
                        <Select.Item item={item} key={item.value}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.ItemGroup>
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </HStack>
          <Button size="sm" variant="outline" onClick={handleManualRefresh} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </HStack>

        {/* Error State */}
        {error && (
          <Box p={4} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
            <Text color="red.600" fontSize="sm">
              Error: {error}
            </Text>
            <Button size="sm" mt={2} onClick={handleManualRefresh}>
              Coba Lagi
            </Button>
          </Box>
        )}

        {/* History List */}
        {loading ? (
          <Box p={6} textAlign="center">
            <Text>
              Memuat catatan...
            </Text>
          </Box>
        ) : entries.length > 0 ? (
          entries.map((entry) => {
            const entryDate = entry.storyDate || entry.date
            if (!entryDate) {
              console.warn("Entry without date found:", entry)
              return null
            }
            return (
              <Box key={entryDate} shadow="sm" p={4} _hover={{ shadow: "md" }} borderRadius="md" border="1px solid" borderColor="gray.200">
                <VStack align="start" gap={2}>
                  <Text fontWeight="bold" fontSize="md">
                    {new Date(entryDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    {entry.content}
                  </Text>
                  <HistoryModal entry={entry} onSave={handleEntryUpdate}/>
                </VStack>
              </Box>
            )
          })
        ) : (
          <Box p={6} textAlign="center">
            <Text>
              Belum ada catatan untuk bulan & tahun ini
            </Text>
          </Box>
        )}
        {entries.length > 0 && (
          <Box p={3} bg="blue.50" borderRadius="md">
            <Text fontSize="sm" color="blue.700">
              Total {entries.length} catatan di {monthNames[parseInt(selectedMonth) - 1]} {selectedYear}
            </Text>
          </Box>
        )}
      </VStack>
    </>
  )
}