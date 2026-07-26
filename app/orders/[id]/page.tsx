/**
 * S10 注文詳細。
 */
'use client'

import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { RequireAuth } from '@/components/RequireAuth'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageTitle } from '@/components/layout/PageTitle'
import { api, ApiRequestError } from '@/lib/apiClient'
import { formatPrice } from '@/lib/money'
import type { OrderDetail, OrderResponse, OrderStatus } from '@/lib/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  ordered: '注文済み',
  shipped: '発送済み',
  delivered: '配達済み',
}

// 注文日は画面仕様に合わせて YYYY/MM/DD 形式で表示する。
const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function formatOrderDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return dateFormatter.format(date)
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className="inline-flex rounded border border-line bg-paper-soft px-3 py-1 text-sm font-semibold text-ink">
      {STATUS_LABELS[status]}
    </span>
  )
}

function OrdersDetailContent() {
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

        setOrder(data.order)
      })
      .catch((caught: unknown) => {
        if (!isActive) {
          return
        }

        if (caught instanceof ApiRequestError) {
          if (caught.code === 'NOT_FOUND') {
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
  }, [orderId])

  if (loading) {
    return (
      <>
        <PageTitle title="注文詳細" />
        <p className="rounded border border-line bg-paper-soft p-6 text-center text-muted">
          読み込み中です。
        </p>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageTitle title="注文詳細" />
        <div className="rounded border border-danger bg-paper p-6 text-center">
          <p className="text-danger" role="alert">
            {error}
          </p>
        </div>
      </>
    )
  }

  if (!order) {
    return (
      <>
        <PageTitle title="注文詳細" />
        <div className="rounded border border-line bg-paper-soft p-6 text-center">
          <p className="text-muted">注文情報がありません。</p>
        </div>
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
            <p className="mt-4 rounded border border-line bg-paper-soft p-6 text-center text-muted">
              注文商品がありません。
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line rounded border border-line bg-paper">
              {order.items.map((item) => (
                <li
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
                  key={item.id}
                >
                  <Image
                    src={item.product_image_url}
                    alt={item.product_name}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded border border-line bg-paper-soft object-cover"
                  />

                  <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-bold">{item.product_name}</h3>
                      {/* 商品情報は現在の商品マスタではなく、注文時点のスナップショットを表示する。 */}
                      <p className="mt-2 text-sm text-muted">
                        サイズ：{item.size}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        数量：{item.quantity}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs font-semibold text-muted">小計</p>
                      <p className="mt-1 font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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
