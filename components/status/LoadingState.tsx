import { StatusDisplay } from './StatusDisplay'

export type LoadingStateProps = {
  // 任意：スピナーの下に表示する文言
  message?: string
}

/** データの読み込み中に表示する。 */
export function LoadingState({ message }: LoadingStateProps) {
  return (
    <StatusDisplay
      icon={
        <span className="block size-9 animate-spin rounded-full border-2 border-line border-t-ink motion-reduce:animate-none" />
      }
      title={message ?? '読み込み中です'}
      ariaLive="polite"
      ariaBusy
      visuallyHideTitle={!message}
    />
  )
}
