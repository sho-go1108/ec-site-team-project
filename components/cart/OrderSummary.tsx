'use client'

import type { CartItem } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/money'

type OrderSummaryProps = {
  items: CartItem[]
  shippingFee?: number
  buttonLabel?: string
  onSubmit: () => void
  disabled?: boolean
}

export function OrderSummary({
  items,
  shippingFee = 0,
  buttonLabel = '注文に進む',
  onSubmit,
  disabled = false,
}: OrderSummaryProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  const total = subtotal + shippingFee
  const isButtonDisabled = disabled || items.length === 0

  return (
    <section
      aria-labelledby="order-summary-title"
      className="rounded border p-6"
    >
      <h2
        id="order-summary-title"
        className="mb-4 text-xl font-bold"
      >
        注文内容
      </h2>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">
            カートに商品がありません
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-4 text-sm"
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))
        )}

        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span>商品合計</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="mt-2 flex justify-between">
            <span>送料</span>
            <span>
              {shippingFee === 0 ? '無料' : formatPrice(shippingFee)}
            </span>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>合計金額</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isButtonDisabled}
        className="mt-6 w-full rounded bg-black px-4 py-3 font-bold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-black"
      >
        {buttonLabel}
      </button>
    </section>
  )
}