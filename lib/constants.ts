import type { OrderStatus } from '@/lib/types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  ordered: '注文済み',
  shipped: '発送済み',
  delivered: '配達済み',
}

export const ORDER_NOT_FOUND_MESSAGE = '注文が見つかりません'
