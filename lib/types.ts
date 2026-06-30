/**
 * バックエンドAPIのレスポンス型定義。
 *
 * design/api-detail/*.md のレスポンス仕様に対応している。
 * APIから受け取るデータの形（snake_case）をそのまま型にしている。
 */

/** 商品サイズ */
export type Size = 'S' | 'M' | 'L' | 'XL'

/** 商品一覧のソート順 */
export type ProductSort = 'price_asc' | 'price_desc' | 'newest'

/** 注文ステータス */
export type OrderStatus = 'ordered'

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export type User = {
  id: number
  name: string
  email: string
  postal_code: string | null
  address: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export type Category = {
  id: number
  name: string
  slug: string
}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

/** 一覧・おすすめで返る商品（description / sizes は含まない） */
export type ProductSummary = {
  id: number
  category_id: number
  name: string
  price: number
  image_url: string
  is_recommended: boolean
  created_at: string
}

export type ProductSizeStock = {
  id: number
  size: Size
  stock: number
}

/** 詳細で返る商品（description / sizes を含む） */
export type ProductDetail = ProductSummary & {
  description: string
  sizes: ProductSizeStock[]
}

export type Pagination = {
  current_page: number
  total_pages: number
  total_count: number
  limit: number
}

// ---------------------------------------------------------------------------
// Order
// ---------------------------------------------------------------------------

/** 注文一覧の1件（明細詳細・配送先は含まない） */
export type OrderSummary = {
  id: number
  total_price: number
  status: OrderStatus
  created_at: string
  item_count: number
}

export type OrderItem = {
  id: number
  product_id: number
  product_name: string
  product_image_url: string
  price: number
  size: Size
  quantity: number
}

/** 注文詳細（配送先・明細を含む） */
export type OrderDetail = {
  id: number
  user_id: number
  total_price: number
  status: OrderStatus
  shipping_name: string
  shipping_postal_code: string
  shipping_address: string
  shipping_phone: string
  created_at: string
  items: OrderItem[]
}

// ---------------------------------------------------------------------------
// API レスポンスのラッパー型
// ---------------------------------------------------------------------------

export type CategoriesResponse = { categories: Category[] }
export type ProductsResponse = { products: ProductSummary[]; pagination: Pagination }
export type RecommendedProductsResponse = { products: ProductSummary[] }
export type ProductResponse = { product: ProductDetail }
export type UserResponse = { user: User }
export type OrdersResponse = { orders: OrderSummary[] }
export type OrderResponse = { order: OrderDetail }
