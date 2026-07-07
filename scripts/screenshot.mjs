// 手機版截圖（iPhone 13 尺寸）：首頁、鹿港 grid、解籤頁、求籤頁。
// 需先 npm run build；輸出到 scripts/shots/。
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { chromium, devices } from 'playwright'

const PORT = 5212
const BASE_URL = `http://localhost:${PORT}/`
const outDir = new URL('./shots/', import.meta.url).pathname
mkdirSync(outDir, { recursive: true })

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: 'ignore',
})

try {
  for (let i = 0; i < 30; i++) {
    try {
      await fetch(BASE_URL)
      break
    } catch {
      await new Promise((r) => setTimeout(r, 300))
    }
  }

  const browser = await chromium.launch()
  const context = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await context.newPage()

  const shots = [
    ['', 'home'],
    ['#lukang', 'browse-lukang'],
    ['#lukang/23', 'detail-lukang-23'],
    ['#xingtian/77', 'detail-xingtian-77'],
    ['#lukang/draw', 'draw'],
  ]
  for (const [hash, name] of shots) {
    await page.goto(BASE_URL + hash)
    await page.reload()
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${outDir}${name}.png`, fullPage: true })
    console.log(`${outDir}${name}.png`)
  }

  await browser.close()
} finally {
  server.kill()
}
