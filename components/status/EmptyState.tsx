import Link from 'next/link'
import { StatusDisplay } from './StatusDisplay'

type EmptyStateWithoutAction = {
  actionLabel?: never
  actionHref?: never
}

type EmptyStateWithAction = {
  // 条件付き必須：リンクの文言
  actionLabel: string
  // 条件付き必須：リンクの遷移先
  actionHref: string
}

export type EmptyStateProps = {
  // 必須：空状態の見出し
  title: string
  // 任意：空状態の補足説明
  message?: string
} & (EmptyStateWithoutAction | EmptyStateWithAction)

/** データが0件のときに表示する。 */
export function EmptyState({
  title,
  message,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <StatusDisplay
      icon={
        <svg
          className="size-10"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 8.5h14v10H5zM8 5.5h8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      title={title}
      message={message}
      action={
        actionLabel !== undefined && actionHref !== undefined ? (
          <Link href={actionHref} className="btn-primary">
            {actionLabel}
          </Link>
        ) : undefined
      }
    />
  )
}
