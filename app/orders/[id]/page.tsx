/**
 * S10 注文詳細。
 */
'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { RequireAuth } from '@/components/RequireAuth'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageTitle } from '@/components/layout/PageTitle'
import { EmptyState, ErrorState, LoadingState } from '@/components/status'
import { api, ApiRequestError } from '@/lib/apiClient'
import { formatPrice } from '@/lib/money'
import type { OrderDetail, OrderResponse, OrderStatus } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { formatOrderDate } from '@/lib/date'

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className="inline-flex rounded border border-line bg-paper-soft px-3 py-1 text-sm font-semibold text-ink">
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}

function OrdersDetailContent() {
  const { user } = useAuth()
  const userId = user?.id
  const params = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderId = params.id

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      setError('注文情報を確認できませんでした。')
      return
    }

    let isActive = true

    setLoading(true)
    setError(null)
    setOrder(null)

    api
      .get<OrderResponse>(`/api/orders/${orderId}`)
      .then((data) => {
        if (!isActive) {
          return
        }

        if (data.order.user_id !== userId) {
          setOrder(null)
          setError('注文が見つかりません')
          return
        }

        setOrder(data.order)
      })
      .catch((caught: unknown) => {
        if (!isActive) {
          return
        }

        if (caught instanceof ApiRequestError) {
          // 形式不正のID（/orders/abc など）も「見つからない」として扱う
          if (caught.code === 'NOT_FOUND' || caught.code === 'VALIDATION_ERROR') {
            setError('注文が見つかりません')
            return
          }

          if (caught.code === 'UNAUTHORIZED') {
            setError('ログインが必要です。')
            return
          }

          setError('注文詳細の取得に失敗しました。時間をおいて再度お試しください。')
        } else {
          setError('通信エラーが発生しました。時間をおいて再度お試しください。')
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [orderId, userId])

  if (loading) {
    return (
      <>
        <PageTitle title="注文詳細" />
        <LoadingState />
      </>
    )
  }

  if (error === '注文が見つかりません') {
    return (
      <>
        <PageTitle title="注文詳細" />
        <EmptyState title="注文が見つかりません" />
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageTitle title="注文詳細" />
        <ErrorState
          title="注文詳細を読み込めませんでした"
          message={error}
          retryLabel="再読み込み"
          reload
        />
      </>
    )
  }

  if (!order) {
    return (
      <>
        <PageTitle title="注文詳細" />
        <EmptyState title="注文情報がありません" />
      </>
    )
  }

  return (
    <>
      <PageTitle title={`注文詳細 #${order.id}`} />

      <div className="space-y-8">
        <section className="rounded border border-line bg-paper p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold text-muted">ステータス</p>
              <div className="mt-2">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">注文日</p>
              <p className="mt-2 font-semibold">
                {formatOrderDate(order.created_at)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">合計金額</p>
              <p className="mt-2 text-xl font-bold">
                {formatPrice(order.total_price)}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold">注文商品</h2>

          {order.items.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="注文商品がありません" />
            </div>
          ) : (
            <div className="mt-4">
              {order.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  mode="view"
                  item={{
                    id: item.id,
                    name: item.product_name,
                    price: item.price,
                    image_url: item.product_image_url,
                    size: item.size,
                    quantity: item.quantity,
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="rounded border border-line bg-paper p-5 sm:p-6">
          <h2 className="text-xl font-bold">配送先情報</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted">氏名</dt>
              <dd className="mt-1">{order.shipping_name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">郵便番号</dt>
              <dd className="mt-1">{order.shipping_postal_code}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-muted">住所</dt>
              <dd className="mt-1">{order.shipping_address}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">電話番号</dt>
              <dd className="mt-1">{order.shipping_phone}</dd>
            </div>
          </dl>
        </section>

      </div>
    </>
  )
}

export default function OrdersDetailPage() {
  return (
    <RequireAuth>
      <PageLayout>
        <OrdersDetailContent />
      </PageLayout>
    </RequireAuth>
  )
}
