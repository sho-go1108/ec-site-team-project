'use client'

import { useRouter } from 'next/navigation'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { OrderSummary } from '@/components/cart/OrderSummary'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageTitle } from '@/components/layout/PageTitle'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    items,
    isReady,
    updateQuantity,
    removeItem,
    totalPrice,
  } = useCart()

  const handleCheckout = () => {
    if (!user) {
      router.push('/login?redirect=/checkout')
      return
    }

    router.push('/checkout')
  }

  // localStorageの復元が終わるまでは、空カート判定を行わない
  if (!isReady) {
    return (
      <PageLayout contentClassName="max-w-6xl">
        <PageTitle title="カート" />
      </PageLayout>
    )
  }

  return (
    <PageLayout contentClassName="max-w-6xl">
      <PageTitle title="カート" />

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg">カートに商品がありません</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <OrderSummary
            items={items}
            totalPrice={totalPrice}
            onSubmit={handleCheckout}
          />
        </div>
      )}
    </PageLayout>
  )
}