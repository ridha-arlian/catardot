'use client'

import { useDebounce } from 'use-debounce'
import { useState, useEffect } from 'react'
import { monthNames } from '@/app/utils/data/month'
import { HistoryModal } from '@/app/modals/historyModal'
import { Box, VStack, HStack, Text, Portal, Select, createListCollection } from '@chakra-ui/react'

interface JournalEntry {
  storyDate: string
  content: string
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }).map((_, i) => currentYear - i)

const monthCollection = createListCollection({
  items: monthNames.map((month, idx) => ({
    label: month,
    value: (idx + 1).toString(),
    category: 'Months',
  })),
})

const yearCollection = createListCollection({
  items: years.map((y) => ({
    label: y.toString(),
    value: y.toString(),
    category: 'Years',
  })),
})

export const History = () => {
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [cache, setCache] = useState<Record<string, JournalEntry[]>>({})
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1 ).toString())
  
  const [debouncedYear] = useDebounce(selectedYear, 300)
  const [debouncedMonth] = useDebounce(selectedMonth, 300)

  useEffect(() => {
    const key = `${debouncedYear}-${debouncedMonth}`

    if (cache[key]) {
      setEntries(cache[key])
      return
    }

    const fetchEntries = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/story?month=${debouncedMonth}&year=${debouncedYear}`)
        const data = await res.json()
        const entriesArray = Array.isArray(data) ? data : []
        setEntries(entriesArray)
        setCache(prev => ({ ...prev, [key]: entriesArray }))
      } catch (err) {
        console.error('Error fetching monthly entries:', err)
        setEntries([])
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [debouncedMonth, debouncedYear, cache])

  return (
    <>
      <VStack gap={6} align="stretch">
        <HStack gap={4}>
          {/* Select Bulan */}
          <Select.Root collection={monthCollection} size="sm" width="150px" value={[selectedMonth]} onValueChange={(val) => setSelectedMonth(Array.isArray(val.value) ? val.value[0] : val.value)}>
            <Select.HiddenSelect />
            <Select.Label>Select Month</Select.Label>
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
          <Select.Root collection={yearCollection} size="sm" width="120px" value={[selectedYear]} onValueChange={(val) => setSelectedYear(Array.isArray(val.value) ? val.value[0] : val.value)}>
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

        {/* History List */}
        {loading ? (
          <Box p={6} textAlign="center">
            <Text>
              Memuat catatan...
            </Text>
          </Box>
        ) : entries.length > 0 ? (
          entries.map((entry) => (
            <Box key={entry.storyDate} shadow="sm" p={4} _hover={{ shadow: 'md' }}>
              <VStack align="start" gap={2}>
                <Text fontWeight="bold">
                  {new Date(entry.storyDate).toLocaleDateString('id-ID')}
                </Text>
                <Text fontSize="sm">
                  {entry.content}
                </Text>
                <HistoryModal entry={entry} onSave={ 
                  (updatedEntry) => { 
                    setEntries((prev) => 
                      prev.map( (e) => 
                        e.storyDate === entry.storyDate ? { ...e, ...updatedEntry } : e 
                      )
                    )
                    const key = `${debouncedYear}-${debouncedMonth}`
                    setCache(prev => ({ ...prev, [key]: prev[key].map(e => e.storyDate === entry.storyDate ? { ...e, ...updatedEntry } : e) }))
                  }}
                />
              </VStack>
            </Box>
          ))
        ) : (
          <Box p={6} textAlign="center">
            <Text>
              Belum ada catatan untuk bulan & tahun ini
            </Text>
          </Box>
        )}
      </VStack>
    </>
  )
}