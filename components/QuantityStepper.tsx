'use client'

type QuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  decreaseLabel: string
  increaseLabel: string
  min?: number
  max?: number
  size?: 'sm' | 'md'
}

export function QuantityStepper({
  value,
  onChange,
  decreaseLabel,
  increaseLabel,
  min = 1,
  max,
  size = 'md',
}: QuantityStepperProps) {
  const isMinQuantity = value <= min
  const isMaxQuantity = max !== undefined && value >= max
  const buttonSizeClass = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10 text-lg'
  const valueSizeClass = size === 'sm' ? 'w-6' : 'min-w-8'
  const gapClass = size === 'sm' ? 'gap-3' : 'gap-4'

  function handleDecrease() {
    if (isMinQuantity) return
    onChange(Math.max(min, value - 1))
  }

  function handleIncrease() {
    if (isMaxQuantity) return
    onChange(max === undefined ? value + 1 : Math.min(max, value + 1))
  }

  return (
    <div className={`flex items-center ${gapClass}`}>
      <button
        type="button"
        onClick={handleDecrease}
        disabled={isMinQuantity}
        aria-label={decreaseLabel}
        className={`${buttonSizeClass} rounded-md border border-line bg-paper text-ink disabled:opacity-40`}
      >
        −
      </button>

      <span className={`${valueSizeClass} text-center`} aria-live="polite">
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrease}
        disabled={isMaxQuantity}
        aria-label={increaseLabel}
        className={`${buttonSizeClass} rounded-md border border-line bg-paper text-ink disabled:opacity-40`}
      >
        ＋
      </button>
    </div>
  )
}
