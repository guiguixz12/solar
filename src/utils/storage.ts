import type { HistoryEntry } from '../types'

const KEY = 'solarfield_history'
const MAX_ENTRIES = 10

export function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveEntry(entry: HistoryEntry): void {
  const history = loadHistory()
  history.unshift(entry)
  if (history.length > MAX_ENTRIES) history.length = MAX_ENTRIES
  localStorage.setItem(KEY, JSON.stringify(history))
}

export function deleteEntry(id: string): void {
  const history = loadHistory().filter((e) => e.id !== id)
  localStorage.setItem(KEY, JSON.stringify(history))
}

export function clearHistory(): void {
  localStorage.removeItem(KEY)
}
