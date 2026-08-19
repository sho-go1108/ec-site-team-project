const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

// APIから返る created_at を、注文日として表示しやすい日本向けの日付に整形する。
export function formatOrderDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return dateFormatter.format(date)
}