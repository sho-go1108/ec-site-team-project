'use client'

import Image from 'next/image'
import type { CartItem } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/money'

type CartItemRowProps = {
  item: CartItem
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const subtotal = item.price * item.quantity
  const isMinQuantity = item.quantity <= 1

  const handleDecrease = () => {
    if (isMinQuantity) return
    onUpdateQuantity(item.id, item.quantity - 1)
  }

  const handleIncrease = () => {
    onUpdateQuantity(item.id, item.quantity + 1)
  }

  return (
    <div className="flex gap-4 border-b py-4">
      <Image
        src={item.image_url}
        alt={item.name}
        width={96}
        height={96}
        className="h-24 w-24 rounded object-cover"
      />

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex justify-between gap-4">
          <div>
            <h3 className="font-bold">{item.name}</h3>
            <p className="text-sm text-gray-500">サイズ：{item.size}</p>
            <p className="text-sm text-gray-600">
              単価：{formatPrice(item.price)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">小計</p>
            <p className="font-bold">{formatPrice(subtotal)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={isMinQuantity}
              aria-label={`${item.name}の数量を減らす`}
              className="h-8 w-8 rounded border transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              −
            </button>

            <span className="w-6 text-center">{item.quantity}</span>

            <button
              type="button"
              onClick={handleIncrease}
              aria-label={`${item.name}の数量を増やす`}
              className="h-8 w-8 rounded border transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="text-sm text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}