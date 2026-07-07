// 把 content-raw/ 的原文 JSON 與 interpretations/ 的解讀 JSON 合併，
// 生成 src/content/lukang.ts 與 xingtian.ts。
// 用法：node scripts/build-content.mjs
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const rawDir = join(root, 'content-raw')
const interpDir = join(root, 'content-raw', 'interpretations')

function loadChunks(prefix) {
  const files = readdirSync(rawDir)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
    .sort()
  const lots = files.flatMap((f) => JSON.parse(readFileSync(join(rawDir, f), 'utf8')))
  lots.sort((a, b) => a.id - b.id)
  return lots
}

function loadInterps(prefix) {
  if (!existsSync(interpDir)) return new Map()
  const files = readdirSync(interpDir)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
    .sort()
  const map = new Map()
  for (const f of files) {
    for (const item of JSON.parse(readFileSync(join(interpDir, f), 'utf8'))) {
      map.set(item.id, item)
    }
  }
  return map
}

function emit(varName, comment, lots, outFile) {
  const interps = loadInterps(varName.replace('Lots', ''))
  const merged = lots.map((l) => {
    const extra = interps.get(l.id) ?? {}
    return {
      id: l.id,
      name: l.name ?? '',
      level: l.level ?? '',
      poem: l.poem ?? [],
      traditional: l.traditional ?? '',
      ...(l.story ? { story: l.story } : {}),
      ...(l.title ? { title: l.title } : {}),
      ...(l.gloss ? { gloss: l.gloss } : {}),
      ...(l.official ? { official: l.official } : {}),
      // 大御心的 modern 直接寫在原始檔；漢籤的 modern 來自 interpretations/
      modern: l.modern ?? extra.modern ?? '',
      categories: extra.categories ?? {},
    }
  })
  const body = merged.map((l) => `  ${JSON.stringify(l)},`).join('\n')
  const src = `import type { Lot } from './types'

// ${comment}
// 此檔由 scripts/build-content.mjs 從 content-raw/ 生成，勿手改——改 content-raw 後重跑 npm run content。
export const ${varName}: Lot[] = [
${body}
]
`
  writeFileSync(outFile, src)
  console.log(`${outFile}: ${merged.length} 首（含解讀 ${merged.filter((l) => l.modern).length} 首）`)
}

emit(
  'lukangLots',
  '鹿港天后宮一百籤（100 首，官方線上求籤定本＋同系統補等第）。',
  loadChunks('lukang-'),
  join(root, 'src/content/lukang.ts'),
)
emit(
  'xingtianLots',
  '行天宮百首籤（100 首）。',
  loadChunks('xingtian-'),
  join(root, 'src/content/xingtian.ts'),
)
emit(
  'meijiLots',
  '明治神宮大御心（30 首御歌籤）。',
  loadChunks('meiji-'),
  join(root, 'src/content/meiji.ts'),
)
