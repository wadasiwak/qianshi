import type { TempleId } from '../content/types'
import { lotsByTemple } from '../content'

// 每日一籤：以日期字串 hash 出當日固定的（宮廟, 籤號），全天不變、隔日更換。
function hashStr(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h
}

export function dailyLot(date = new Date()): { temple: TempleId; id: number } | null {
  const day = date.toISOString().slice(0, 10)
  const temples = (Object.keys(lotsByTemple) as TempleId[]).filter(
    (t) => lotsByTemple[t].length > 0,
  )
  if (temples.length === 0) return null
  const temple = temples[hashStr(`t:${day}`) % temples.length]
  const lots = lotsByTemple[temple]
  const id = lots[hashStr(`n:${day}`) % lots.length].id
  return { temple, id }
}
