'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { RequireAuth } from '@/components/RequireAuth'

function OrderCompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const isValidOrderId = orderId !== null && /^[1-9]\d*$/.test(orderId)

  useEffect(() => {
    if (!isValidOrderId) {
      router.replace('/')
    }
  }, [isValidOrderId, router])

  if (!isValidOrderId) return null

  return (
    <main className="container-app py-20 sm:py-28">
      <section className="mx-auto w-full max-w-xl text-center">
        <div className="flex items-center justify-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </span>
          <h1 className="text-3xl font-bold">注文が完了しました</h1>
        </div>
        <p className="mt-4 text-muted">ご注文ありがとうございます。</p>

        <div className="mt-8 rounded border border-line bg-paper-soft px-6 py-5">
          <p className="text-sm text-muted">注文番号</p>
          <p className="mt-1 text-xl font-semibold" aria-label={`注文番号 ${orderId}`}>
            #{orderId}
          </p>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-secondary">
            トップページへ戻る
          </Link>
          <Link href="/orders" className="btn-secondary">
            注文履歴を見る
          </Link>
        </div>
      </section>
    </main>
  )
}

export default function OrderCompletePage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <OrderCompleteContent />
      </Suspense>
    </RequireAuth>
  )
}
