/**
 * zod によるフォームのバリデーションスキーマ。
 *
 * バックエンド（design/api-detail/*.md）のバリデーションルールに合わせている。
 * フロント側で先にチェックすることで、不正な値の送信を防ぎUXを良くする目的。
 *
 * 使い方（例）:
 *   import { loginSchema, type LoginInput } from '@/lib/schemas'
 *   const result = loginSchema.safeParse({ email, password })
 *   if (!result.success) {
 *     const errors = result.error.flatten().fieldErrors // { email: [...], password: [...] }
 *   }
 */
import { z } from 'zod'

// 郵便番号: XXX-XXXX
const postalCodeRegex = /^\d{3}-\d{4}$/
// 電話番号: 数字とハイフン、10〜15文字
const phoneRegex = /^[\d-]{10,15}$/

// ---------------------------------------------------------------------------
// 認証
// ---------------------------------------------------------------------------

/** POST /api/auth/login */
export const loginSchema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  password: z.string().min(1, 'パスワードを入力してください'),
})
export type LoginInput = z.infer<typeof loginSchema>

/** POST /api/auth/signup */
export const signupSchema = z.object({
  name: z
    .string()
    .min(1, '氏名は1〜100文字で入力してください')
    .max(100, '氏名は1〜100文字で入力してください'),
  email: z
    .string()
    .email('メールアドレスの形式が正しくありません')
    .max(255, 'メールアドレスの形式が正しくありません'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .max(100, 'パスワードは8〜100文字で入力してください'),
})
export type SignupInput = z.infer<typeof signupSchema>

// ---------------------------------------------------------------------------
// ユーザー情報更新 (マイページ)
// ---------------------------------------------------------------------------

/** PUT /api/users/:id （送信したフィールドのみ更新する部分更新） */
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, '氏名は1〜100文字で入力してください')
    .max(100, '氏名は1〜100文字で入力してください'),
  postal_code: z
    .string()
    .regex(postalCodeRegex, '郵便番号の形式が正しくありません')
    .or(z.literal('')),
  address: z.string().max(500, '住所は500文字以内で入力してください'),
  phone: z
    .string()
    .regex(phoneRegex, '電話番号の形式が正しくありません')
    .or(z.literal('')),
})
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

// ---------------------------------------------------------------------------
// 注文 (チェックアウト)
// ---------------------------------------------------------------------------

/** 配送先フォーム（POST /api/orders の shipping_* 部分） */
export const shippingSchema = z.object({
  shipping_name: z
    .string()
    .min(1, '配送先氏名は1〜100文字で入力してください')
    .max(100, '配送先氏名は1〜100文字で入力してください'),
  shipping_postal_code: z
    .string()
    .regex(postalCodeRegex, '郵便番号の形式が正しくありません'),
  shipping_address: z
    .string()
    .min(1, '配送先住所は1〜500文字で入力してください')
    .max(500, '配送先住所は1〜500文字で入力してください'),
  shipping_phone: z
    .string()
    .regex(phoneRegex, '電話番号の形式が正しくありません'),
})
export type ShippingInput = z.infer<typeof shippingSchema>

/** 注文明細1件（POST /api/orders の items[] 要素） */
export const orderItemSchema = z.object({
  product_id: z.number().int().positive(),
  size: z.enum(['S', 'M', 'L', 'XL']),
  quantity: z.number().int().min(1, '数量は1以上を指定してください'),
})
export type OrderItemInput = z.infer<typeof orderItemSchema>

/** POST /api/orders のリクエストボディ全体 */
export const createOrderSchema = shippingSchema.extend({
  user_id: z.number().int().positive(),
  items: z.array(orderItemSchema).min(1, '注文商品を1つ以上指定してください'),
})
export type CreateOrderInput = z.infer<typeof createOrderSchema>
