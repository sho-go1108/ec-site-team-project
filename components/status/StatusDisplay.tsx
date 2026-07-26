import type { ReactNode } from 'react'

type StatusDisplayProps = {
  icon: ReactNode
  title: string
  message?: string
  action?: ReactNode
  role?: 'status' | 'alert'
  ariaLive?: 'polite' | 'assertive'
  ariaBusy?: boolean
  visuallyHideTitle?: boolean
}

/** Loading / Error / Empty の共通表示枠。画面からは直接使用しない。 */
export function StatusDisplay({
  icon,
  title,
  message,
  action,
  role = 'status',
  ariaLive,
  ariaBusy,
  visuallyHideTitle = false,
}: StatusDisplayProps) {
  const hasContentBelowIcon = !visuallyHideTitle || message || action

  return (
    <section
      className="flex min-h-48 w-full flex-col items-center justify-center px-4 py-12 text-center"
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      aria-busy={ariaBusy}
    >
      <div
        className={hasContentBelowIcon ? 'mb-4 text-muted' : 'text-muted'}
        aria-hidden="true"
      >
        {icon}
      </div>

      {visuallyHideTitle ? (
        <span className="sr-only">{title}</span>
      ) : (
        <h2 className="whitespace-pre-line text-lg font-semibold text-ink">
          {title}
        </h2>
      )}

      {message ? (
        <p className="whitespace-pre-line mt-2 max-w-md text-sm leading-6 text-muted">
          {message}
        </p>
      ) : null}

      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  )
}
