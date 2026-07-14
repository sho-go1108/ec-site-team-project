import type { ComponentPropsWithoutRef } from 'react'

/**
 * label・input・補足文・フィールドエラーをまとめて表示する共通部品。
 *
 * value や type など通常の input props はページ側から渡し、
 * 入力された文字列だけ onChange(value) でページ側へ返す。
 */
type TextFieldProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'onChange'
> & {
  id: string
  label: string
  error?: string
  helpText?: string
  onChange: (value: string) => void
}

export function TextField({
  id,
  label,
  error,
  helpText,
  className = '',
  onChange,
  ...inputProps
}: TextFieldProps) {
  // label / help / error を input と関連付けるため、id から派生したIDを作る。
  const errorId = `${id}-error`
  const helpId = `${id}-help`

  // 補足文やエラー文があるときだけ aria-describedby にIDを渡す。
  const describedBy = [
    helpText ? helpId : undefined,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>

      <input
        id={id}
        className={`field-input ${error ? 'field-input--error' : ''} ${className}`}
        // 呼び出し元は event ではなく、入力された文字列だけを受け取れる。
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />

      {helpText && (
        <p id={helpId} className="mt-1 text-xs text-muted">
          {helpText}
        </p>
      )}

      {error && (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
