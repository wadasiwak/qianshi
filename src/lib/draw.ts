// 線上求籤：抽籤 + 擲筊，機率忠實模擬實體筊杯。
// 一對筊各有平凸兩面：一平一凸=聖筊(1/2)、兩平=笑筊(1/4)、兩凸=陰筊(1/4)。

export type JiaoResult = '聖筊' | '笑筊' | '陰筊'

export function throwJiao(): JiaoResult {
  const a = Math.random() < 0.5
  const b = Math.random() < 0.5
  if (a !== b) return '聖筊'
  return a ? '笑筊' : '陰筊'
}

export function drawLotId(count: number): number {
  return Math.floor(Math.random() * count) + 1
}

export const jiaoMeaning: Record<JiaoResult, string> = {
  聖筊: '一平一凸——神明應允，此籤便是給你的指引。',
  笑筊: '兩面朝上——神明微笑未置可否，心再靜一靜，重新請籤。',
  陰筊: '兩面朝下——此籤不合所問，重新請籤。',
}
