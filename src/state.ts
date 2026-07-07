import { create } from 'zustand'
import type { TempleId } from './content/types'
import { loadRecent, addRecent, type RecentEntry } from './lib/storage'

export type View =
  | { name: 'home' }
  | { name: 'browse'; temple: TempleId }
  | { name: 'draw'; temple: TempleId }
  | { name: 'detail'; temple: TempleId; id: number; question?: string }

interface AppState {
  view: View
  recent: RecentEntry[]
  go: (view: View) => void
  openLot: (temple: TempleId, id: number, question?: string) => void
  clearHistory: () => void
}

// URL hash 同步：#lukang/23 可直接分享單首籤
export function viewToHash(view: View): string {
  switch (view.name) {
    case 'home':
      return ''
    case 'browse':
      return `#${view.temple}`
    case 'draw':
      return `#${view.temple}/draw`
    case 'detail':
      return `#${view.temple}/${view.id}`
  }
}

export function hashToView(hash: string): View {
  const m = hash.replace(/^#/, '').split('/')
  const temple = m[0] === 'lukang' || m[0] === 'xingtian' ? m[0] : null
  if (!temple) return { name: 'home' }
  if (m[1] === 'draw') return { name: 'draw', temple }
  const id = Number(m[1])
  if (Number.isInteger(id) && id > 0) return { name: 'detail', temple, id }
  return { name: 'browse', temple }
}

export const useApp = create<AppState>((set) => ({
  view: hashToView(location.hash),
  recent: loadRecent(),
  go: (view) => {
    history.replaceState(null, '', viewToHash(view) || location.pathname)
    set({ view })
  },
  openLot: (temple, id, question) => {
    const entry: RecentEntry = {
      temple,
      id,
      askedAt: new Date().toISOString().slice(0, 10),
      question,
    }
    const recent = addRecent(entry)
    history.replaceState(null, '', `#${temple}/${id}`)
    set({ view: { name: 'detail', temple, id, question }, recent })
  },
  clearHistory: () => set({ recent: [] }),
}))
