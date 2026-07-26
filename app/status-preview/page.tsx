'use client'

import { PageLayout } from '@/components/layout/PageLayout'
import { PageTitle } from '@/components/layout/PageTitle'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/status'

export default function StatusPreviewPage() {
  return (
    <PageLayout contentClassName="max-w-6xl">
      <PageTitle title="状態表示コンポーネント" />

      <p className="mb-8 text-center text-sm text-muted">
        Loading・Error・Emptyの表示確認用ページです。
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <section>
          <p className="mb-3 font-semibold">Loading</p>
          <div className="rounded border border-line bg-paper">
            <LoadingState message="読み込み中です" />
          </div>
        </section>

        <section>
          <p className="mb-3 font-semibold">Error</p>
          <div className="rounded border border-line bg-paper">
            <ErrorState onRetry={() => window.location.reload()} />
          </div>
        </section>

        <section>
          <p className="mb-3 font-semibold">Empty</p>
          <div className="rounded border border-line bg-paper">
            <EmptyState
              title="注文履歴がありません"
              message="商品を購入すると、こちらに注文履歴が表示されます。"
              actionLabel="商品を探す"
              actionHref="/products"
            />
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
