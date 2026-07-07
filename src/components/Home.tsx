import { useMemo, useState } from 'react'
import { temples, getTemple } from '../content/temples'
import { useApp } from '../state'
import { dailyLot } from '../lib/daily'
import { getLot, lotsByTemple } from '../content'
import { searchLots } from '../lib/search'

export function Home() {
  const go = useApp((s) => s.go)
  const recent = useApp((s) => s.recent)
  const clearHistory = useApp((s) => s.clearHistory)
  const openLot = useApp((s) => s.openLot)
  const [query, setQuery] = useState('')
  const daily = useMemo(() => dailyLot(), [])
  const dailyData = daily && getLot(daily.temple, daily.id)
  const hits = useMemo(() => searchLots(query), [query])

  return (
    <main>
      <section className="hero">
        <h2 className="hero-title">求得一支籤，來這裡看解</h2>
        <p className="hero-sub">選擇宮廟，輸入籤號即可查解籤；也可以線上求籤。</p>
      </section>

      <section className="temple-cards">
        {temples
          .filter((t) => lotsByTemple[t.id].length > 0)
          .map((t) => (
          <div key={t.id} className={`temple-card temple-${t.id}`}>
            <h3>{t.name}</h3>
            <p className="temple-system">
              {t.system}・共 {t.count} 首
            </p>
            <p className="temple-deity">{t.deity}</p>
            <p className="temple-intro">{t.intro}</p>
            <div className="temple-actions">
              <button className="btn primary" onClick={() => go({ name: 'browse', temple: t.id })}>
                查籤號
              </button>
              <button className="btn" onClick={() => go({ name: 'draw', temple: t.id })}>
                線上求籤
              </button>
            </div>
          </div>
        ))}
      </section>

      {dailyData && daily && (
        <section className="daily">
          <button className="daily-card" onClick={() => openLot(daily.temple, daily.id)}>
            <span className="daily-label">今日一籤</span>
            <span className="daily-line">{dailyData.poem[0]}</span>
            <span className="daily-meta">
              {getTemple(daily.temple)?.name}・第 {daily.id} 首 →
            </span>
          </button>
        </section>
      )}

      <section className="search">
        <input
          className="search-input"
          type="search"
          placeholder="搜籤詩字句或典故，如「風雲」「劉備」"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query.trim().length >= 2 && (
          <ul className="search-results">
            {hits.length === 0 && <li className="search-empty">沒有找到符合的籤詩</li>}
            {hits.map((h) => (
              <li key={`${h.temple}-${h.lot.id}`}>
                <button className="recent-item" onClick={() => openLot(h.temple, h.lot.id)}>
                  <span className="recent-temple">{getTemple(h.temple)?.name}</span>
                  <span className="recent-id">第 {h.lot.id} 首</span>
                  <span className="recent-q">{h.line}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {recent.length > 0 && (
        <section className="recent">
          <div className="recent-head">
            <h3>最近的籤</h3>
            <button className="btn subtle" onClick={clearHistory}>
              清除
            </button>
          </div>
          <ul className="recent-list">
            {recent.map((e) => (
              <li key={`${e.temple}-${e.id}`}>
                <button className="recent-item" onClick={() => openLot(e.temple, e.id, e.question)}>
                  <span className="recent-temple">{getTemple(e.temple)?.name}</span>
                  <span className="recent-id">第 {e.id} 首</span>
                  {e.question && <span className="recent-q">「{e.question}」</span>}
                  <span className="recent-date">{e.askedAt}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
