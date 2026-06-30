/**
 * APIクライアント（共通のfetchラッパー）。
 *
 * バックエンド（Hono / Spring Boot）への通信はすべてこのファイル経由で行う。
 * - ベースURLは環境変数 NEXT_PUBLIC_API_BASE から取得（.env 参照）
 * - エラーレスポンスは ApiRequestError に変換して throw する
 *
 * 使い方:
 *   import { api } from '@/lib/apiClient'
 *   const data = await api.get<ProductsResponse>('/api/products?page=1')
 *   const res  = await api.post<UserResponse>('/api/auth/login', { email, password })
 */

/** バックエンドが返すエラーオブジェクトの形（design/backend-design.md 参照） */
export type ApiErrorBody = {
  code: string
  message: string
  details?: { field: string; message: string }[]
}

/** バックエンドのエラーコード */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'UNKNOWN'

/**
 * API通信が失敗したときに throw される例外。
 * 画面側では try/catch で受け取り、status / code / details を使って
 * エラーメッセージの出し分けを行う。
 */
export class ApiRequestError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly details: { field: string; message: string }[]

  constructor(status: number, body: { error?: ApiErrorBody }) {
    const err = body?.error
    super(err?.message ?? 'リクエストに失敗しました')
    this.name = 'ApiRequestError'
    this.status = status
    this.code = (err?.code as ApiErrorCode) ?? 'UNKNOWN'
    this.details = err?.details ?? []
  }

  /** details からフィールド名 → メッセージのマップを作る（フォームのエラー表示に使う） */
  fieldErrors(): Record<string, string> {
    const map: Record<string, string> = {}
    for (const d of this.details) map[d.field] = d.message
    return map
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (!res.ok) {
    let body: { error?: ApiErrorBody } = {}
    try {
      body = await res.json()
    } catch {
      // JSONでないエラーレスポンスは無視（ApiRequestError 側でデフォルトメッセージになる）
    }
    throw new ApiRequestError(res.status, body)
  }

  // 204 No Content はボディなし
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
