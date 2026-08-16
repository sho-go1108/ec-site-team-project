'use client'

import { StatusDisplay } from './StatusDisplay'

export type ErrorStateProps = {
  // 任意：エラーの見出し
  title?: string
  // 任意：エラーの補足説明
  message?: string
  // 任意：再試行ボタンの文言
  retryLabel?: string
  // 任意：指定すると再試行ボタンを表示
  onRetry?: () => void
}

/** データの取得に失敗したときに表示する。 */
export function ErrorState({
  title = 'データを読み込めませんでした',
  message = '時間をおいて、もう一度お試しください。',
  retryLabel = 'もう一度試す',
  onRetry,
}: ErrorStateProps) {
  return (
    <StatusDisplay
      icon={
        <svg
          className="size-10 text-danger"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M12 7.5v5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      }
      title={title}
      message={message}
      role="alert"
      action={
        onRetry ? (
          <button type="button" className="btn-primary" onClick={onRetry}>
            {retryLabel}
          </button>
        ) : undefined
      }
    />
  )
}
