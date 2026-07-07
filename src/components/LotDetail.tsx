import { useState } from 'react'
import type { TempleId } from '../content/types'
import { CATEGORY_KEYS, OFFICIAL_KEYS, levelTone } from '../content/types'
import { getTemple } from '../content/temples'
import { getLot } from '../content'
import { useApp } from '../state'

export function LotDetail({
  temple,
  id,
  question,
}: {
  temple: TempleId
  id: number
  question?: string
}) {
  const info = getTemple(temple)!
  const lot = getLot(temple, id)
  const go = useApp((s) => s.go)
  const [open, setOpen] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = `${location.origin}${location.pathname}#${temple}/${id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt('複製這個連結分享：', url)
    }
  }

  if (!lot) {
    return (
      <main>
        <p className="missing">
          找不到{info.name}第 {id} 首（共 {info.count} 首）。
        </p>
        <button className="btn" onClick={() => go({ name: 'browse', temple })}>
          回籤詩列表
        </button>
      </main>
    )
  }

  return (
    <main className="detail">
      <nav className="crumbs">
        <button className="btn subtle" onClick={() => go({ name: 'browse', temple })}>
          ← {info.name}
        </button>
      </nav>

      {question && <p className="asked-question">所問之事：「{question}」</p>}

      <section className={`poem-card tone-${levelTone(lot.level)}`}>
        <div className="poem-head">
          <span className="poem-no">
            {info.name}・第{lot.id}首{lot.name && `・${lot.name}`}
            {lot.title && `・「${lot.title}」`}
          </span>
          {lot.level && (
            <span className={`level-badge tone-${levelTone(lot.level)}`}>{lot.level}</span>
          )}
        </div>
        {/* 直式籤詩：四句由右至左 */}
        <div className="poem-vertical">
          {lot.poem.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        {lot.story && <p className="poem-story">典故：{lot.story}</p>}
      </section>

      {lot.official && (
        <section className="block">
          <h3>宮廟批註</h3>
          <div className="official-grid">
            {OFFICIAL_KEYS.map((key) =>
              lot.official![key] ? (
                <div key={key} className="official-item">
                  <span className="official-key">{key}</span>
                  <span className="official-text">{lot.official![key]}</span>
                </div>
              ) : null,
            )}
          </div>
        </section>
      )}

      {lot.gloss && (
        <section className="block">
          <h3>歌語淺釋</h3>
          <p>{lot.gloss}</p>
        </section>
      )}

      {lot.traditional && (
        <section className="block">
          <h3>傳統解曰</h3>
          <p className="traditional-text">{lot.traditional}</p>
        </section>
      )}

      {lot.modern && (
        <section className="block">
          <h3>白話總解</h3>
          <p>{lot.modern}</p>
        </section>
      )}

      {CATEGORY_KEYS.some((key) => lot.categories?.[key]) && (
        <section className="block">
          <h3>分類解讀</h3>
          <div className="categories">
            {CATEGORY_KEYS.map((key) => {
              const text = lot.categories[key]
              if (!text) return null
              const isOpen = open === key
              return (
                <div key={key} className={`cat ${isOpen ? 'open' : ''}`}>
                  <button className="cat-head" onClick={() => setOpen(isOpen ? null : key)}>
                    <span>{key}</span>
                    <span className="cat-arrow">{isOpen ? '▾' : '▸'}</span>
                  </button>
                  {isOpen && <p className="cat-body">{text}</p>}
                </div>
              )
            })}
          </div>
        </section>
      )}

      <div className="detail-actions">
        <button className="btn" onClick={share}>
          {copied ? '已複製 ✓' : '分享此籤'}
        </button>
        <button className="btn" onClick={() => go({ name: 'draw', temple })}>
          再求一籤
        </button>
        <button className="btn" onClick={() => go({ name: 'browse', temple })}>
          查其他籤
        </button>
      </div>
    </main>
  )
}
