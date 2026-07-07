// 分類解讀的固定順序（UI 依此渲染）
export const CATEGORY_KEYS = [
  '愛情婚姻',
  '事業工作',
  '財運',
  '健康',
  '考試學業',
  '訴訟糾紛',
  '失物行人',
] as const

export type CategoryKey = (typeof CATEGORY_KEYS)[number]

// 鹿港天后宮官方十類批註的固定順序
export const OFFICIAL_KEYS = [
  '功名',
  '行人',
  '婚姻',
  '官司',
  '丁口',
  '生意',
  '疾病',
  '出行',
  '失物',
  '田畜',
] as const

export interface Lot {
  id: number // 第幾首
  name: string // 行天宮：干支組合（甲甲…）；鹿港一百籤無名，留空
  level: string // 吉凶等第（大吉／上上／上中／中平／下下…）
  poem: string[] // 四句籤詩原文
  traditional: string // 傳統聖意／解曰古文（行天宮有；鹿港無，留空）
  story?: string // 籤詩典故
  official?: Record<string, string> // 鹿港官方十類批註（功名…田畜）
  modern: string // 白話總解
  categories: Record<CategoryKey, string> // 分類解讀
}

export type TempleId = 'lukang' | 'xingtian'

export interface Temple {
  id: TempleId
  name: string
  system: string // 籤詩系統名
  count: number
  deity: string
  intro: string
}

// 吉凶等第 → 色調分級（顯示用）
export function levelTone(level: string): 'good' | 'mid' | 'poor' {
  if (/下/.test(level)) return 'poor'
  if (/^上|大吉/.test(level)) return 'good'
  return 'mid'
}
