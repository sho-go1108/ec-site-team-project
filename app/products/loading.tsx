import { PageLayout } from '@/components/layout/PageLayout'
import { PageTitle } from '@/components/layout/PageTitle'
import { LoadingState } from '@/components/status'

export default function ProductsLoading() {
  return (
    <PageLayout>
      <PageTitle title="商品一覧" />
      <LoadingState />
    </PageLayout>
  )
}
