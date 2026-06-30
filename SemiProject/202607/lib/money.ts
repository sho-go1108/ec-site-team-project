/** 金額を日本円表記にフォーマットするヘルパー。 例: 2980 → "¥2,980" */
const formatter = new Intl.NumberFormat('ja-JP')

export function formatPrice(value: number): string {
  return `¥${formatter.format(value)}`
}
