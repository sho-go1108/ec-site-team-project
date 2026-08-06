'use client'

/**
 * カートの状態管理（React Context + localStorage 永続化）。
 *
 * カートはバックエンドに保存せず、ブラウザの localStorage で管理する
 * （design/state-management.md の方針）。
 *
 * 使い方:
 *   const { items, addItem, totalPrice } = useCart()
 *
 * Provider はルートの app/layout.tsx で <CartProvider> を配置済み。
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Size } from '@/lib/types'

export type CartItem = {
  /** product_id と size から作る一意キー（例: "1:M"） */
  id: string
  product_id: number
  name: string
  price: number
  image_url: string
  size: Size
  quantity: number
}

/** addItem に渡す入力（id はライブラリ側で生成するので不要） */
export type AddCartItemInput = Omit<CartItem, 'id'>

type CartContextValue = {
  items: CartItem[]
  isReady: boolean
  addItem: (input: AddCartItemInput) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const STORAGE_KEY = 'finaltest.cart.items'

const itemKey = (productId: number, size: Size) =>
  `${productId}:${size}`

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({
  children,
}: {
  children: ReactNode
}) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isReady, setIsReady] = useState(false)

  // 初回マウント時に localStorage から復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)

      if (raw) {
        setItems(JSON.parse(raw) as CartItem[])
      }
    } catch {
      setItems([])
    } finally {
      setIsReady(true)
    }
  }, [])

  // 復元完了後、items が変わるたびに localStorage へ保存
  useEffect(() => {
    if (!isReady) return

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items),
      )
    } catch {
      // 保存失敗は無視
    }
  }, [items, isReady])

  function addItem(input: AddCartItemInput) {
    const id = itemKey(input.product_id, input.size)

    setItems((prev) => {
      const existing = prev.find((item) => item.id === id)

      if (existing) {
        return prev.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity + input.quantity,
              }
            : item,
        )
      }

      return [...prev, { ...input, id }]
    })
  }

  function updateQuantity(
    id: string,
    quantity: number,
  ) {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity }
          : item,
      ),
    )
  }

  function removeItem(id: string) {
    setItems((prev) =>
      prev.filter((item) => item.id !== id),
    )
  }

  function clearCart() {
    setItems([])
  }

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  const totalPrice = items.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0,
  )

  return (
    <CartContext.Provider
      value={{
        items,
        isReady,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error(
      'useCart は <CartProvider> の内側で使用してください',
    )
  }

  return context
}