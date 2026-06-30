# FinalTest Frontend (Next.js)

衣服ECサイトのフロントエンド。Next.js 15 (App Router) + Tailwind CSS v4。

> このリポジトリは**環境構築と共通部品のセットアップまで**が完了した状態です。
> 各画面（ページ）・コンポーネントの実装は受講生が行ってください。

## スタック

- ランタイム: Node.js 22（推奨）／ 20.9 以上で動作
- フレームワーク: Next.js 15 (App Router)
- 言語: TypeScript
- スタイリング: Tailwind CSS v4 (`@tailwindcss/postcss`)
- バリデーション: zod
- 状態管理: React Context + `localStorage`（auth / cart。design/state-management.md 参照）
- パッケージマネージャ: pnpm

## セットアップ

### 1. Node.js をインストール（バージョン 22 推奨 / 20.9 以上）

OSや好みのツールに合わせて選んでください。バージョン要件は `package.json` の `engines` で共通管理しています（`.nvmrc` / `.tool-versions` にも 22 系を記載）。

- **どのOSでも簡単**: [公式インストーラ](https://nodejs.org/)（v22 LTS）をそのまま入れる
- **Windows**:
  - [Volta](https://volta.sh/)（推奨。`package.json` のバージョンを自動で使う）
  - または [fnm](https://github.com/Schniz/fnm) / [nvm-windows](https://github.com/coreybutler/nvm-windows)（`nvm install 22 && nvm use 22`）
- **macOS / Linux / WSL**: [Volta](https://volta.sh/) / [fnm](https://github.com/Schniz/fnm) / [mise](https://mise.jdx.dev/) / [asdf](https://asdf-vm.com/)（`.tool-versions` を読みます）/ [nvm](https://github.com/nvm-sh/nvm)（`nvm use` で `.nvmrc` を読みます）

> `.tool-versions` は asdf / mise 用です（asdf は Windows 非対応）。Windows の方は上記の Volta などを使ってください。

### 2. pnpm を用意

Node に同梱の Corepack を使うのが簡単です（OS共通）。

```bash
corepack enable           # 一度だけ
corepack prepare pnpm@9.15.0 --activate
```

※ Corepack を使わない場合は `npm install -g pnpm` でも可。

### 3. 依存をインストールして起動

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

バックエンド（Hono / Spring Boot）を `http://localhost:8080` で起動しておくと API が叩けます。

## 環境変数

`.env`:

```
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

API のベース URL。`lib/apiClient.ts` から `process.env.NEXT_PUBLIC_API_BASE` で参照されます。
`NEXT_PUBLIC_` プレフィックスが付いた変数だけがブラウザに公開されます。

## スクリプト

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | dev サーバ起動 (port 3000) |
| `pnpm build` | プロダクションビルド |
| `pnpm start` | ビルド結果を起動 |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | 型チェック (`tsc --noEmit`) |

## ディレクトリ構成

```
Next/
├── app/
│   ├── layout.tsx        ルートレイアウト（Providers を配置）
│   ├── providers.tsx     AuthProvider / CartProvider をまとめる
│   ├── globals.css       Tailwind v4 + デザイントークン
│   └── page.tsx          S01 トップ（プレースホルダ。ここから実装開始）
├── components/
│   ├── RequireAuth.tsx   認証必須ページのガード
│   └── README.md         これから作るコンポーネントの一覧
├── contexts/
│   ├── AuthContext.tsx   認証状態（useAuth）
│   └── CartContext.tsx   カート状態（useCart）
└── lib/
    ├── apiClient.ts      API通信の共通ラッパー（api.get / post / put）
    ├── types.ts          APIレスポンスの型定義
    ├── schemas.ts        zod のフォームバリデーション
    └── money.ts          金額フォーマット（formatPrice）
```

## 共通部品の使い方

### API通信 — `lib/apiClient.ts`

```ts
import { api, ApiRequestError } from '@/lib/apiClient'
import type { ProductsResponse } from '@/lib/types'

try {
  const data = await api.get<ProductsResponse>('/api/products?page=1&limit=12')
  // data.products, data.pagination
} catch (e) {
  if (e instanceof ApiRequestError) {
    console.log(e.status, e.code, e.fieldErrors())
  }
}
```

### 認証 — `contexts/AuthContext.tsx`

```tsx
'use client'
import { useAuth } from '@/contexts/AuthContext'

const { user, isLoggedIn, login, logout } = useAuth()
await login(email, password) // 成功すると localStorage に保存される
```

### カート — `contexts/CartContext.tsx`

```tsx
'use client'
import { useCart } from '@/contexts/CartContext'

const { items, addItem, updateQuantity, removeItem, clearCart, totalPrice } = useCart()
addItem({ product_id: 1, name: 'Tシャツ', price: 2980, image_url: '...', size: 'M', quantity: 1 })
```

### フォームバリデーション — `lib/schemas.ts`

```tsx
import { loginSchema } from '@/lib/schemas'

const result = loginSchema.safeParse({ email, password })
if (!result.success) {
  const errors = result.error.flatten().fieldErrors // { email?: string[], password?: string[] }
}
```

### 認証必須ページ — `components/RequireAuth.tsx`

```tsx
'use client'
import { RequireAuth } from '@/components/RequireAuth'

export default function MyPage() {
  return <RequireAuth>{/* ログイン済みのみ表示 */}</RequireAuth>
}
```

## これから実装する画面（`design/screens.md` / `design/routing.md` 参照）

| パス | 画面 | 認証 |
|------|------|:---:|
| `app/page.tsx` | S01 トップ | - |
| `app/products/page.tsx` | S02 商品一覧 | - |
| `app/products/[id]/page.tsx` | S03 商品詳細 | - |
| `app/signup/page.tsx` | S04 会員登録 | - |
| `app/login/page.tsx` | S05 ログイン | - |
| `app/cart/page.tsx` | S06 カート | - |
| `app/checkout/page.tsx` | S07 注文確認 | 要 |
| `app/checkout/complete/page.tsx` | S08 注文完了 | 要 |
| `app/orders/page.tsx` | S09 注文履歴 | 要 |
| `app/orders/[id]/page.tsx` | S10 注文詳細 | 要 |
| `app/mypage/page.tsx` | S11 マイページ | 要 |
