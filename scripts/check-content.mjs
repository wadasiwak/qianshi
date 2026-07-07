// 內容完整性檢查：60+100 首齊全、四句都在、必要欄位不缺。
// build 前跑（CI 也跑），缺漏直接 fail。
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CATEGORY_KEYS = ['愛情婚姻', '事業工作', '財運', '健康', '考試學業', '訴訟糾紛', '失物行人']
const OFFICIAL_KEYS = ['功名', '行人', '婚姻', '官司', '丁口', '生意', '疾病', '出行', '失物', '田畜']

let errors = 0
const err = (msg) => {
  console.error(`✗ ${msg}`)
  errors++
}

// 從生成的 TS 檔取出陣列（檔案格式固定，直接 eval JSON 行）
function loadLots(file) {
  const src = readFileSync(join(root, 'src/content', file), 'utf8')
  const lines = src.split('\n').filter((l) => l.trim().startsWith('{'))
  return lines.map((l) => JSON.parse(l.trim().replace(/,$/, '')))
}

function checkTemple(file, label, expected, opts = {}) {
  let lots
  try {
    lots = loadLots(file)
  } catch (e) {
    err(`${label}: 讀取失敗 ${e.message}`)
    return
  }
  if (opts.optional && lots.length === 0) {
    console.log(`- ${label}: 尚未收錄（optional，跳過）`)
    return
  }
  if (lots.length !== expected) err(`${label}: 應有 ${expected} 首，實際 ${lots.length}`)
  const seen = new Set()
  for (const lot of lots) {
    const tag = `${label} 第${lot.id}首`
    if (seen.has(lot.id)) err(`${tag}: id 重複`)
    seen.add(lot.id)
    if (!(lot.id >= 1 && lot.id <= expected)) err(`${tag}: id 超出範圍`)
    if (opts.waka) {
      // 和歌：分句數不定，只驗非空
      if (!Array.isArray(lot.poem) || lot.poem.length < 2 || lot.poem.some((p) => !p)) {
        err(`${tag}: 和歌分句異常`)
      }
      if (!lot.gloss) err(`${tag}: 缺歌語淺釋`)
    } else {
      if (!Array.isArray(lot.poem) || lot.poem.length !== 4) err(`${tag}: 籤詩不是四句`)
      else if (lot.poem.some((p) => !p || p.length < 5)) err(`${tag}: 有過短的句子`)
      if (!lot.level) err(`${tag}: 缺吉凶等第`)
    }
    if (opts.traditional && !lot.traditional) err(`${tag}: 缺傳統解曰`)
    if (opts.official) {
      for (const key of OFFICIAL_KEYS) {
        if (!lot.official?.[key]) err(`${tag}: 缺官方批註「${key}」`)
      }
    }
    if (!lot.modern) err(`${tag}: 缺白話總解`)
    if (!opts.waka) {
      for (const key of CATEGORY_KEYS) {
        if (!lot.categories?.[key]) err(`${tag}: 缺分類解讀「${key}」`)
      }
    }
  }
}

checkTemple('lukang.ts', '鹿港', 100, { official: true })
checkTemple('xingtian.ts', '行天宮', 100, { traditional: true })
checkTemple('meiji.ts', '明治神宮', 30, { waka: true, optional: true })

if (errors) {
  console.error(`\n共 ${errors} 個問題`)
  process.exit(1)
}
console.log('✓ 內容檢查通過：鹿港 100 + 行天宮 100 + 明治神宮 30，欄位齊全')
