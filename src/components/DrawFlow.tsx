import { useRef, useState } from 'react'
import type { TempleId } from '../content/types'
import { getTemple, noJiao } from '../content/temples'
import { useApp } from '../state'
import { drawLotId, throwJiao, jiaoMeaning, type JiaoResult } from '../lib/draw'

type Step =
  | { name: 'intro' }
  | { name: 'shaking' }
  | { name: 'drawn'; id: number }
  | { name: 'jiao'; id: number; result: JiaoResult }

export function DrawFlow({ temple }: { temple: TempleId }) {
  const info = getTemple(temple)!
  const go = useApp((s) => s.go)
  const openLot = useApp((s) => s.openLot)
  const [step, setStep] = useState<Step>({ name: 'intro' })
  const [question, setQuestion] = useState('')
  const timer = useRef<number>(0)

  const shake = () => {
    setStep({ name: 'shaking' })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setStep({ name: 'drawn', id: drawLotId(info.count) })
    }, 1800)
  }

  const askJiao = (id: number) => {
    setStep({ name: 'jiao', id, result: throwJiao() })
  }

  return (
    <main className="draw">
      <nav className="crumbs">
        <button className="btn subtle" onClick={() => go({ name: 'browse', temple })}>
          ← {info.name}
        </button>
      </nav>

      <h2 className="draw-title">{info.name}・線上求籤</h2>

      {step.name === 'intro' && (
        <section className="draw-panel">
          <p className="draw-guide">
            靜下心來，在心中默念自己的姓名、住處，以及想請示的事情。
          </p>
          <input
            className="question-input"
            type="text"
            maxLength={40}
            placeholder="想問的事（可留空，只放在心裡）"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button className="btn primary big" onClick={shake}>
            🙏 誠心抽籤
          </button>
        </section>
      )}

      {step.name === 'shaking' && (
        <section className="draw-panel">
          <div className="stick-tube shaking">
            <span className="stick s1" />
            <span className="stick s2" />
            <span className="stick s3" />
          </div>
          <p className="draw-guide">籤筒搖動中……</p>
        </section>
      )}

      {step.name === 'drawn' && (
        <section className="draw-panel">
          <div className="drawn-stick">
            <span className="drawn-no">
              第<span className="tcu">{step.id}</span>首
            </span>
          </div>
          {noJiao[temple] ? (
            <>
              <p className="draw-guide">御歌一首，贈你今日的心法。</p>
              <button
                className="btn primary big"
                onClick={() => openLot(temple, step.id, question.trim() || undefined)}
              >
                拜見大御心 →
              </button>
            </>
          ) : (
            <>
              <p className="draw-guide">抽到一支籤。擲筊請示神明，這支籤是否合你所問？</p>
              <button className="btn primary big" onClick={() => askJiao(step.id)}>
                擲筊
              </button>
            </>
          )}
        </section>
      )}

      {step.name === 'jiao' && (
        <section className="draw-panel">
          <div className={`jiao-result jiao-${step.result}`}>{step.result}</div>
          <p className="draw-guide">{jiaoMeaning[step.result]}</p>
          {step.result === '聖筊' ? (
            <button
              className="btn primary big"
              onClick={() => openLot(temple, step.id, question.trim() || undefined)}
            >
              看解籤 →
            </button>
          ) : (
            <button className="btn primary big" onClick={shake}>
              重新抽籤
            </button>
          )}
        </section>
      )}
    </main>
  )
}
