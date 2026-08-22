/**
 * フォーム送信時に、最初の入力エラー項目へフォーカスを移すための共通処理。
 *
 * fields の順番を画面上の入力順とそろえておくと、キーボード・スクリーンリーダー利用者が
 * 修正すべき最初の項目へ自然に移動できる。
 */
export function focusFirstErrorField<T extends string>(
  fields: T[],
  errors: Partial<Record<T, string | undefined>>,
) {
  const firstErrorField = fields.find((field) => errors[field])

  if (firstErrorField) {
    document.getElementById(firstErrorField)?.focus()
  }
}

/**
 * エラー表示を始めた入力欄を記録する型。
 * 未操作の項目には、入力中からエラーを出さないために使う。
 */
export type TouchedFields<T extends string> = Partial<Record<T, boolean>>

/**
 * 送信時に全フィールドのエラーを表示できるよう、すべて touched=true にする。
 */
export function createTouchedFields<T extends string>(
  fields: T[],
): TouchedFields<T> {
  return fields.reduce<TouchedFields<T>>(
    (current, field) => ({
      ...current,
      [field]: true,
    }),
    {},
  )
}
