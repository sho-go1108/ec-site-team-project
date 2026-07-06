import { formatPrice } from '@/lib/money'

type CartItem = {
  product_id: number
  name: string
  price: number
  image_url: string
  size: string
  quantity: number
}

type CartItemRowProps = {
  item: CartItem
  onUpdateQuantity: (productId: number, size: string, quantity: number) => void
  onRemove: (productId: number, size: string) => void
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
    onUpdateQuantity(item.product_id, item.size, item.quantity - 1)
  }

  const handleIncrease = () => {
    onUpdateQuantity(item.product_id, item.size, item.quantity + 1)
  }

  return (
    <div className="flex gap-4 border-b py-4">
      <img
        src={item.image_url}
        alt={item.name}
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
              className="h-8 w-8 rounded border disabled:cursor-not-allowed disabled:opacity-40"
            >
              -
            </button>

            <span className="w-6 text-center">{item.quantity}</span>

            <button
              type="button"
              onClick={handleIncrease}
              className="h-8 w-8 rounded border"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.product_id, item.size)}
            className="text-sm text-red-600 hover:underline"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}