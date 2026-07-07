import { useApp } from './state'
import { Home } from './components/Home'
import { Browse } from './components/Browse'
import { LotDetail } from './components/LotDetail'
import { DrawFlow } from './components/DrawFlow'

export default function App() {
  const view = useApp((s) => s.view)
  const go = useApp((s) => s.go)

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="clickable" onClick={() => go({ name: 'home' })}>
          解籤
        </h1>
        <span className="header-sub">鹿港天后宮・行天宮</span>
      </header>

      {view.name === 'home' && <Home />}
      {view.name === 'browse' && <Browse temple={view.temple} />}
      {view.name === 'draw' && <DrawFlow temple={view.temple} />}
      {view.name === 'detail' && (
        <LotDetail temple={view.temple} id={view.id} question={view.question} />
      )}

      <footer className="app-footer">
        <p>
          籤詩原文與傳統解曰為民間流傳古籤；白話翻譯與分類解讀為本站整理，僅供參考，
          重大決定請以自己的判斷為主。
        </p>
        <p>© 2026 wadasiwak. All rights reserved.</p>
      </footer>
    </div>
  )
}
