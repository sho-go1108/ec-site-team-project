/**
 * フォーム全体のエラー表示。
 *
 * 入力欄ごとのエラーではなく、「ログインに失敗しました」のような
 * フォーム全体に関わるエラーを表示するための部品。
 */
type FormErrorProps = {
  message?: string | null
}

export function FormError({ message }: FormErrorProps) {
  // エラーがないときは余白も表示しないため、何も描画しない。
  if (!message) {
    return null
  }

  return (
    <p
      className="rounded border border-danger p-3 text-sm text-danger"
      role="alert"
    >
      {message}
    </p>
  )
}
