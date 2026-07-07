import type { Lot, TempleId } from '../content/types'
import { lotsByTemple } from '../content'

export interface SearchHit {
  temple: TempleId
  lot: Lot
  line: string // 命中的那句
}

// 全文搜尋籤詩四句與典故（記得片段就能找回那首籤）
export function searchLots(query: string, limit = 20): SearchHit[] {
  const q = query.trim()
  if (q.length < 2) return []
  const hits: SearchHit[] = []
  for (const temple of Object.keys(lotsByTemple) as TempleId[]) {
    for (const lot of lotsByTemple[temple]) {
      const line = lot.poem.find((p) => p.includes(q)) ?? (lot.story?.includes(q) ? `典故：${lot.story}` : undefined)
      if (line) {
        hits.push({ temple, lot, line })
        if (hits.length >= limit) return hits
      }
    }
  }
  return hits
}
