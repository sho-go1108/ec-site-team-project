'use client'

import Image from 'next/image'
import { useEffect, useState, type FormEvent } from 'react'
import { RequireAuth } from '@/components/RequireAuth'
import { FormError } from '@/components/form/FormError'
import { SubmitButton } from '@/components/form/SubmitButton'
import { TextField } from '@/components/form/TextField'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageTitle } from '@/components/layout/PageTitle'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { api, ApiRequestError } from '@/lib/apiClient'
import { formatPrice } from '@/lib/money'
import {
  shippingSchema,
  type CreateOrderInput,
  type ShippingInput,
} from '@/lib/schemas'

type ShippingErrors = Partial<Record<keyof ShippingInput, string>>

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, totalPrice, clearCart } = useCart()

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

  const updateField = (
    field: keyof ShippingInput,
    value: string,
  ) => {
    const next = {
      ...shipping,
      [field]: value,
    }

    setShipping(next)

    const result = shippingSchema.safeParse(next)

    if (result.success) {
      setErrors({})
      return
    }

    const fieldErrors = result.error.flatten().fieldErrors

    setErrors({
      shipping_name: fieldErrors.shipping_name?.[0],
      shipping_postal_code:
        fieldErrors.shipping_postal_code?.[0],
      shipping_address: fieldErrors.shipping_address?.[0],
      shipping_phone: fieldErrors.shipping_phone?.[0],
    })
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
      setFormError('カートに商品がありません。')
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

      await api.post<unknown>('/api/orders', requestBody)

      clearCart()

      // S08実装後に注文完了画面への遷移へ置き換える
      console.log('注文が完了しました。')
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFormError(error.message)
        return
      }

      setFormError('注文に失敗しました。')
    } finally {
      setIsSubmitting(false)
    }
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
            <h2 className="mb-6 text-xl font-bold">
              注文内容
            </h2>

            <div className="divide-y border-y">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-gray-100">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="font-bold">
                      {item.name}
                    </p>

                    <p className="mt-1 text-sm text-muted">
                      サイズ：{item.size}
                    </p>

                    <p className="mt-1 text-sm text-muted">
                      数量：{item.quantity}
                    </p>
                  </div>

                  <p className="font-bold">
                    {formatPrice(
                      item.price * item.quantity,
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between text-lg font-bold">
              <span>合計金額</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

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