import type { ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * フォーム送信用の共通ボタン。
 *
 * 送信中は disabled にして、表示文言も「ログイン中です…」などへ切り替える。
 */
type SubmitButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> & {
  children: ReactNode
  isSubmitting?: boolean
  submittingLabel: ReactNode
}

export function SubmitButton({
  children,
  className = '',
  disabled,
  isSubmitting = false,
  submittingLabel,
  ...buttonProps
}: SubmitButtonProps) {
  // btn-primary は globals.css の共通クラス。画面側から className で追加指定もできる。
  const buttonClassName = ['btn-primary w-full', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={buttonClassName}
      type="submit"
      // 外から渡された disabled と、送信中フラグのどちらかが true なら押せない。
      disabled={disabled || isSubmitting}
      {...buttonProps}
    >
      {isSubmitting ? submittingLabel : children}
    </button>
  )
}
