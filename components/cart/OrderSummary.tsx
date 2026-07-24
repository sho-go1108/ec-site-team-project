'use client'

import type { CartItem } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/money'

type OrderSummaryProps = {
  items: CartItem[]
  totalPrice: number
  shippingFee?: number
  showButton?: boolean
  buttonLabel?: string
  onSubmit?: () => void
  disabled?: boolean
}

export function OrderSummary({
  items,
  totalPrice,
  shippingFee = 0,
  showButton = true,
  buttonLabel = '注文に進む',
  onSubmit,
  disabled = false,
}: OrderSummaryProps) {
  const total = totalPrice + shippingFee
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
                {item.name}（{item.size}） × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))
        )}

        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span>商品合計</span>
            <span>{formatPrice(totalPrice)}</span>
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

      {showButton && onSubmit && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isButtonDisabled}
          className="btn-primary mt-6 w-full"
        >
          {buttonLabel}
        </button>
      )}
    </section>
  )
}