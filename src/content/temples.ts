import type { Temple } from './types'

export const temples: Temple[] = [
  {
    id: 'lukang',
    name: '鹿港天后宮',
    system: '天后宮一百籤',
    count: 100,
    deity: '天上聖母（媽祖）',
    intro:
      '創建於明末的鹿港天后宮，奉祀湄洲開基媽祖。天后宮一百籤與澎湖天后宮、台南大天后宮同系統，每首附功名、婚姻、疾病等十類批註。',
  },
  {
    id: 'meiji',
    name: '明治神宮',
    system: '大御心（御歌籤）',
    count: 30,
    deity: '明治天皇・昭憲皇太后',
    intro:
      '東京明治神宮的おみくじ稱「大御心」，不占吉凶：三十首皆為明治天皇御製與昭憲皇太后御歌，以一首和歌贈你一句人生心法。',
  },
  {
    id: 'xingtian',
    name: '行天宮',
    system: '百首籤（關帝靈籤）',
    count: 100,
    deity: '關聖帝君（恩主公）',
    intro:
      '台北行天宮主祀關聖帝君，籤詩共一百首，源自關帝靈籤系統，每首各配一則歷史典故，以事喻理。',
  },
]

// no-jiao: 神社おみくじ直接抽，不擲筊
export const noJiao: Record<string, boolean> = { meiji: true }

export function getTemple(id: string) {
  return temples.find((t) => t.id === id)
}
