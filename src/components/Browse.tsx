import { useState } from 'react'
import type { TempleId } from '../content/types'
import { levelTone } from '../content/types'
import { getTemple } from '../content/temples'
import { lotsByTemple } from '../content'
import { useApp } from '../state'

export function Browse({ temple }: { temple: TempleId }) {
  const info = getTemple(temple)!
  const lots = lotsByTemple[temple]
  const openLot = useApp((s) => s.openLot)
  const go = useApp((s) => s.go)
  const [input, setInput] = useState('')

  const n = Number(input)
  const valid = Number.isInteger(n) && n >= 1 && n <= info.count

  const submit = () => {
    if (valid) openLot(temple, n)
  }

  return (
    <main>
      <nav className="crumbs">
        <button className="btn subtle" onClick={() => go({ name: 'home' })}>
          ← 回首頁
        </button>
      </nav>

      <section className="browse-head">
        <h2>{info.name}</h2>
        <p className="hero-sub">
          {info.system}・共 {info.count} 首
        </p>
        <div className="number-input">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={info.count}
            placeholder={`第幾首（1–${info.count}）`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button className="btn primary" disabled={!valid} onClick={submit}>
            看解籤
          </button>
        </div>
        <button className="btn draw-entry" onClick={() => go({ name: 'draw', temple })}>
          🙏 手邊沒有籤？線上求一支
        </button>
      </section>

      <section className={`lot-grid grid-${temple}`}>
        {lots.map((lot) => (
          <button
            key={lot.id}
            className={`lot-cell tone-${levelTone(lot.level)}`}
            onClick={() => openLot(temple, lot.id)}
            title={`${lot.name} ${lot.level}`}
          >
            <span className="lot-cell-id">{lot.id}</span>
            <span className="lot-cell-level">{lot.level}</span>
          </button>
        ))}
      </section>
    </main>
  )
}
