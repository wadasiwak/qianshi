import type { Lot, TempleId } from './types'
import { lukangLots } from './lukang'
import { xingtianLots } from './xingtian'

export const lotsByTemple: Record<TempleId, Lot[]> = {
  lukang: lukangLots,
  xingtian: xingtianLots,
}

export function getLot(temple: TempleId, id: number): Lot | undefined {
  return lotsByTemple[temple].find((l) => l.id === id)
}
