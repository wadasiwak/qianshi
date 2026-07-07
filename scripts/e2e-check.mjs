// 端到端測試：查號碼 → 解籤頁 → 分類解讀 → 求籤擲筊流程 → 最近的籤。
// 需先 npm run build；本腳本自行啟動 vite preview（port 5211，避開 dev server 5210）。
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const PORT = 5211
const BASE_URL = `http://localhost:${PORT}/`

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: 'ignore',
})

const fail = (msg) => {
  console.error(`FAIL: ${msg}`)
  server.kill()
  process.exit(1)
}

try {
  for (let i = 0; i < 30; i++) {
    try {
      await fetch(BASE_URL)
      break
    } catch {
      await new Promise((r) => setTimeout(r, 300))
      if (i === 29) fail('preview server 沒起來')
    }
  }

  const browser = await chromium.launch()
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] })
  const page = await context.newPage()
  await page.goto(BASE_URL)

  // 1. 首頁：兩張宮廟卡
  await page.waitForSelector('.temple-cards', { timeout: 5000 })
  const cards = await page.$$('.temple-card')
  if (cards.length !== 2) fail(`首頁應有 2 張宮廟卡，實得 ${cards.length}`)

  // 2. 進鹿港 → 全籤 grid 100 格
  await page.click('.temple-lukang .btn.primary')
  await page.waitForSelector('.lot-grid', { timeout: 3000 })
  const lukangCells = await page.$$('.lot-cell')
  if (lukangCells.length !== 100) fail(`鹿港 grid 應 100 格，實得 ${lukangCells.length}`)

  // 3. 輸入號碼 23 → 解籤頁完整（鹿港有官方十類批註，無傳統解曰）
  await page.fill('.number-input input', '23')
  await page.click('.number-input .btn.primary')
  await page.waitForSelector('.poem-card', { timeout: 3000 })
  const poemLines = await page.$$('.poem-vertical p')
  if (poemLines.length !== 4) fail(`籤詩應四句，實得 ${poemLines.length}`)
  const detail = await page.textContent('.detail')
  for (const label of ['宮廟批註', '白話總解', '分類解讀']) {
    if (!detail.includes(label)) fail(`解籤頁缺「${label}」`)
  }
  const officialItems = await page.$$('.official-item')
  if (officialItems.length !== 10) fail(`鹿港官方批註應 10 類，實得 ${officialItems.length}`)

  // 4. 分類解讀 accordion：七類都在、點開有內容
  const cats = await page.$$('.cat')
  if (cats.length !== 7) fail(`分類解讀應 7 類，實得 ${cats.length}`)
  await cats[0].click()
  const catBody = await page.textContent('.cat-body')
  if (!catBody || catBody.length < 10) fail('分類解讀點開後內容過短')

  // 5. 行天宮 grid 100 格 + 直接 hash 開第 77 首
  await page.goto(`${BASE_URL}#xingtian`)
  await page.reload()
  await page.waitForSelector('.lot-grid', { timeout: 3000 })
  const xtCells = await page.$$('.lot-cell')
  if (xtCells.length !== 100) fail(`行天宮 grid 應 100 格，實得 ${xtCells.length}`)
  await page.goto(`${BASE_URL}#xingtian/77`)
  await page.reload()
  await page.waitForSelector('.poem-card', { timeout: 3000 })
  const no = await page.textContent('.poem-no')
  if (!no.includes('第77首')) fail(`hash 直開應顯示第77首，實得 ${no}`)
  const xtDetail = await page.textContent('.detail')
  if (!xtDetail.includes('傳統解曰')) fail('行天宮解籤頁缺「傳統解曰」')

  // 6. 求籤流程：抽籤 → 擲筊到聖筊 → 看解籤（笑/陰筊時重抽，最多 20 輪必中）
  await page.goto(`${BASE_URL}#lukang/draw`)
  await page.reload()
  await page.waitForSelector('.draw-panel', { timeout: 3000 })
  await page.fill('.question-input', 'e2e 測試')
  await page.click('.draw-panel .btn.primary')
  let sheng = false
  for (let round = 0; round < 20 && !sheng; round++) {
    await page.waitForSelector('.drawn-stick', { timeout: 6000 })
    await page.click('.draw-panel .btn.primary') // 擲筊
    await page.waitForSelector('.jiao-result', { timeout: 3000 })
    const jiao = await page.textContent('.jiao-result')
    if (jiao === '聖筊') sheng = true
    await page.click('.draw-panel .btn.primary') // 看解籤 or 重新抽籤
  }
  if (!sheng) fail('擲筊 20 輪都沒聖筊（機率 ~1e-6，應是流程壞了）')
  await page.waitForSelector('.poem-card', { timeout: 3000 })
  const asked = await page.textContent('.asked-question')
  if (!asked.includes('e2e 測試')) fail('解籤頁應顯示所問之事')

  // 6b. 分享此籤：複製的連結應含 hash，開新分頁能還原同一首
  await page.click('.detail-actions .btn:first-child')
  const shared = await page.evaluate(() => navigator.clipboard.readText())
  if (!/#(lukang|xingtian)\/\d+$/.test(shared)) fail(`分享連結格式不對：${shared}`)
  const page2 = await context.newPage()
  await page2.goto(shared)
  await page2.waitForSelector('.poem-card', { timeout: 5000 })
  await page2.close()

  // 7. 回首頁 → 最近的籤有紀錄，重整後仍在（localStorage）
  await page.click('.app-header h1')
  await page.waitForSelector('.recent', { timeout: 3000 })
  await page.reload()
  await page.waitForSelector('.recent', { timeout: 3000 })
  const recent = await page.textContent('.recent')
  if (!recent.includes('第') || !recent.includes('首')) fail('最近的籤應有紀錄')

  // 8. 今日一籤：卡片存在、點擊直達解籤頁
  const dailyLine = await page.textContent('.daily-line')
  if (!dailyLine || dailyLine.length < 5) fail('今日一籤應顯示籤詩首句')
  await page.click('.daily-card')
  await page.waitForSelector('.poem-card', { timeout: 3000 })
  await page.click('.app-header h1')

  // 9. 搜尋：用今日一籤的首句片段搜，應至少一筆命中
  await page.fill('.search-input', dailyLine.slice(0, 3))
  await page.waitForSelector('.search-results .recent-item', { timeout: 3000 })
  await page.click('.search-results .recent-item')
  await page.waitForSelector('.poem-card', { timeout: 3000 })

  await browser.close()
  console.log('e2e OK：宮廟卡、查號碼、解籤頁、分類解讀、hash 直開、求籤擲筊、分享、最近紀錄、今日一籤、搜尋全部通過')
} finally {
  server.kill()
}
