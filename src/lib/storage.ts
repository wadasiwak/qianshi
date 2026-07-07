import type { TempleId } from '../content/types'

// 最近查過的籤（localStorage，最多 12 筆，新的在前）
export interface RecentEntry {
  temple: TempleId
  id: number
  askedAt: string // ISO 日期
  question?: string // 求籤時輸入的所問之事
}

const KEY = 'qianshi.recent.v1'
const MAX = 12

export function loadRecent(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function addRecent(entry: RecentEntry): RecentEntry[] {
  const list = loadRecent().filter(
    (e) => !(e.temple === entry.temple && e.id === entry.id),
  )
  list.unshift(entry)
  const trimmed = list.slice(0, MAX)
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed))
  } catch {
    // 隱私模式等寫入失敗就算了
  }
  return trimmed
}

export function clearRecent(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
