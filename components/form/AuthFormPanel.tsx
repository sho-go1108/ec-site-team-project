import type { ComponentPropsWithoutRef } from 'react'

/**
 * 認証系フォームの外枠。
 *
 * <form> の props をそのまま受け取れるので、各ページ側で onSubmit や noValidate を渡せる。
 * 見た目だけをここで共通化し、送信処理はページ側に任せる。
 */
type AuthFormPanelProps = ComponentPropsWithoutRef<'form'>

export function AuthFormPanel({ children, ...formProps }: AuthFormPanelProps) {
  return (
    <form
      className="space-y-6 rounded border border-line bg-paper p-6 sm:p-8"
      {...formProps}
    >
      {children}
    </form>
  )
}
