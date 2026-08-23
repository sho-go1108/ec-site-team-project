/**
 * S09 注文履歴（注文一覧）
 */
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { RequireAuth } from '@/components/RequireAuth'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageTitle } from '@/components/layout/PageTitle'
import { EmptyState, ErrorState, LoadingState } from '@/components/status'
import { useAuth } from '@/contexts/AuthContext'
import { api, ApiRequestError } from '@/lib/apiClient'
import { formatPrice } from '@/lib/money'
import type { OrderSummary, OrdersResponse } from '@/lib/types'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { formatOrderDate } from '@/lib/date'

// 注文履歴を仕様どおり「新しい注文が上」に並べ替える。
function sortByNewest(orders: OrderSummary[]): OrderSummary[] {
  return [...orders].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
  )
}

// ログインユーザーの注文履歴を取得し、画面状態ごとの表示を切り替える。
function OrdersContent() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id

  useEffect(() => {
    // RequireAuth通過後にユーザーIDが取れたタイミングで、注文履歴を取得する。
    if (userId === undefined) {
      setOrders([])
      setError('ユーザー情報を取得できませんでした。再度ログインしてください。')
      setLoading(false)
      return
    }

    // 画面を離れた後にAPIレスポンスが返っても、state更新しないようにする。
    let isActive = true
    const params = new URLSearchParams({ user_id: String(userId) })

    setLoading(true)
    setError(null)

    api
      .get<OrdersResponse>(`/api/orders?${params.toString()}`)
      .then((data) => {
        if (!isActive) {
          return
        }

        setOrders(data.orders)
      })
      .catch((caught: unknown) => {
        if (!isActive) {
          return
        }

        if (caught instanceof ApiRequestError) {
          setError(
            caught.code === 'UNAUTHORIZED'
              ? 'ログインが必要です。'
              : '注文履歴の取得に失敗しました。時間をおいて再度お試しください。',
          )
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
  }, [userId])

  // API側の並び順に依存せず、画面側でも仕様どおり新しい順にそろえる。
  const sortedOrders = useMemo(() => sortByNewest(orders), [orders])

  // ローディング・エラー・0件・通常表示の順に画面状態を分岐する。
  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <ErrorState
        title="注文履歴を読み込めませんでした"
        message={error}
        retryLabel="再読み込み"
        reload
      />
    )
  }

  if (sortedOrders.length === 0) {
    return (
      <EmptyState
        title="注文履歴がありません"
        actionLabel="商品一覧へ"
        actionHref="/products"
      />
    )
  }

  return (
    <div className="space-y-4">
      {sortedOrders.map((order) => (
        <article
          className="rounded border border-line bg-paper p-4 sm:p-5"
          key={order.id}
        >
          {/* 640px以上では仕様どおり横並び、スマホ幅では縦並びにする。 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-3 sm:grid-cols-4 sm:items-center sm:gap-6">
              <div>
                <p className="text-xs font-semibold text-muted">注文番号</p>
                <p className="mt-1 font-semibold">#{order.id}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">注文日</p>
                <p className="mt-1">{formatOrderDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">合計金額</p>
                <p className="mt-1 font-semibold">
                  {formatPrice(order.total_price)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">ステータス</p>
                <p className="mt-1">{ORDER_STATUS_LABELS[order.status]}</p>
              </div>
            </div>

            <Link
              className="btn-secondary w-full sm:w-auto"
              href={`/orders/${order.id}`}
            >
              詳細
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <RequireAuth>
      <PageLayout>
        <PageTitle title="注文履歴" />
        <OrdersContent />
      </PageLayout>
    </RequireAuth>
  )
}
