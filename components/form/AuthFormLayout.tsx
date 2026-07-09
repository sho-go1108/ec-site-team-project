import type { ReactNode } from 'react'
import { PageTitle } from '@/components/layout/PageTitle'
import { PageLayout } from '@/components/layout/PageLayout'

/**
 * 認証系フォームの共通レイアウト。
 *
 * 会員登録・ログインのような画面で、ページ幅・タイトル・下部リンクの配置をそろえる。
 * 実際の入力欄や送信ボタンは children として受け取る。
 */
type AuthFormLayoutProps = {
  title: string
  children: ReactNode
  /** 例: 「ログインはこちら」「会員登録はこちら」のリンク */
  bottomLink?: ReactNode
}

export function AuthFormLayout({
  title,
  children,
  bottomLink,
}: AuthFormLayoutProps) {
  return (
    <PageLayout contentClassName="max-w-md">
      <PageTitle title={title} />
      {children}

      {/* bottomLink が渡された画面だけ、フォーム下に補助リンクを表示する。 */}
      {bottomLink && (
        <p className="mt-6 text-center text-sm text-muted">
          {bottomLink}
        </p>
      )}
    </PageLayout>
  )
}
