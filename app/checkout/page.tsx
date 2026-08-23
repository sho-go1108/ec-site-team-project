'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { RequireAuth } from '@/components/RequireAuth'
import { FormError } from '@/components/form/FormError'
import { SubmitButton } from '@/components/form/SubmitButton'
import { TextField } from '@/components/form/TextField'
import { OrderSummary } from '@/components/cart/OrderSummary'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageTitle } from '@/components/layout/PageTitle'
import { LoadingState } from '@/components/status'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { api, ApiRequestError } from '@/lib/apiClient'
import {
  shippingSchema,
  type CreateOrderInput,
  type ShippingInput,
} from '@/lib/schemas'
import type { OrderResponse } from '@/lib/types'

type ShippingErrors = Partial<Record<keyof ShippingInput, string>>

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    items,
    isReady,
    totalPrice,
    clearCart,
  } = useCart()

  const isCompletingOrder = useRef(false)

  const [shipping, setShipping] = useState<ShippingInput>({
    shipping_name: '',
    shipping_postal_code: '',
    shipping_address: '',
    shipping_phone: '',
  })

  const [errors, setErrors] = useState<ShippingErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    setShipping({
      shipping_name: user.name,
      shipping_postal_code: user.postal_code ?? '',
      shipping_address: user.address ?? '',
      shipping_phone: user.phone ?? '',
    })
  }, [user])

  useEffect(() => {
    if (!isReady) return
    if (isCompletingOrder.current) return

    if (items.length === 0) {
      router.replace('/cart')
    }
  }, [isReady, items.length, router])

  const updateField = (
    field: keyof ShippingInput,
    value: string,
  ) => {
    const next = {
      ...shipping,
      [field]: value,
    }

    setShipping(next)

    // 編集中のフィールドだけバリデーションする
    const fieldSchema = shippingSchema.shape[field]
    const result = fieldSchema.safeParse(value)

    setErrors((prev) => ({
      ...prev,
      [field]: result.success
        ? undefined
        : result.error.issues[0]?.message,
    }))
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setFormError(null)

    const result = shippingSchema.safeParse(shipping)

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors

      setErrors({
        shipping_name: fieldErrors.shipping_name?.[0],
        shipping_postal_code:
          fieldErrors.shipping_postal_code?.[0],
        shipping_address:
          fieldErrors.shipping_address?.[0],
        shipping_phone: fieldErrors.shipping_phone?.[0],
      })

      return
    }

    if (!user) {
      setFormError('ユーザー情報を取得できませんでした。')
      return
    }

    if (items.length === 0) {
      router.replace('/cart')
      return
    }

    const requestBody: CreateOrderInput = {
      user_id: user.id,
      ...result.data,
      items: items.map((item) => ({
        product_id: item.product_id,
        size: item.size,
        quantity: item.quantity,
      })),
    }

    try {
      setIsSubmitting(true)

      const response = await api.post<OrderResponse>(
        '/api/orders',
        requestBody,
      )

      isCompletingOrder.current = true
      clearCart()

      router.push(
        `/checkout/complete?orderId=${response.order.id}`,
      )
    } catch (error) {
      if (error instanceof ApiRequestError) {
        const detailMessage = error.details
          .map((detail) => detail.message)
          .join(' / ')

        setFormError(
          detailMessage
            ? `${error.message}：${detailMessage}`
            : error.message,
        )
        return
      }

      setFormError('注文に失敗しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  // localStorage復元前に空の注文フォームを描画しない
  if (!isReady) {
    return (
      <RequireAuth>
        <PageLayout contentClassName="max-w-6xl">
          <PageTitle title="注文確認" />
          <LoadingState />
        </PageLayout>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <PageLayout contentClassName="max-w-6xl">
        <PageTitle title="注文確認" />

        <form
          className="mx-auto max-w-4xl"
          onSubmit={handleSubmit}
        >
          <section className="mx-auto max-w-[480px]">
            <h2 className="mb-6 text-xl font-bold">
              配送先
            </h2>

            <div className="space-y-5">
              <TextField
                id="shipping-name"
                label="氏名"
                value={shipping.shipping_name}
                error={errors.shipping_name}
                onChange={(value) =>
                  updateField('shipping_name', value)
                }
              />

              <TextField
                id="shipping-postal-code"
                label="郵便番号"
                value={shipping.shipping_postal_code}
                placeholder="123-4567"
                error={errors.shipping_postal_code}
                onChange={(value) =>
                  updateField(
                    'shipping_postal_code',
                    value,
                  )
                }
              />

              <TextField
                id="shipping-address"
                label="住所"
                value={shipping.shipping_address}
                error={errors.shipping_address}
                onChange={(value) =>
                  updateField('shipping_address', value)
                }
              />

              <TextField
                id="shipping-phone"
                label="電話番号"
                type="tel"
                value={shipping.shipping_phone}
                placeholder="090-1234-5678"
                error={errors.shipping_phone}
                onChange={(value) =>
                  updateField('shipping_phone', value)
                }
              />
            </div>
          </section>

          <section className="mt-12">
            <OrderSummary
              items={items}
              totalPrice={totalPrice}
              showButton={false}
            />

            <div className="mt-8 space-y-4">
              <FormError message={formError} />

              <SubmitButton
                isSubmitting={isSubmitting}
                submittingLabel="注文中..."
                disabled={items.length === 0}
              >
                注文を確定する
              </SubmitButton>
            </div>
          </section>
        </form>
      </PageLayout>
    </RequireAuth>
  )
}
