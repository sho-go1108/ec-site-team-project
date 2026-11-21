# 衣服ECサイト（チーム開発）

> スクールの模擬案件として、6名のチームで開発した衣服ECサイトのフロントエンドです。
> 私は **トップページ・商品一覧ページ** と、そこで使う **共通コンポーネント（商品カード／カテゴリフィルタ／ページネーション）** を担当しました。

<!-- スクリーンショットは後で追加 -->

---

## 概要

| 項目 | 内容 |
| --- | --- |
| 開発期間 | 2026年7月〜8月（約2か月） |
| 開発人数 | 6名（フロントエンド） |
| 開発形態 | 画面ごとに担当を分担し、feature ブランチ → Pull Request → コードレビュー → develop へマージ |
| 元リポジトリ | [Gennai2750/SemiProject_202607](https://github.com/Gennai2750/SemiProject_202607) |

※ 環境構築・共通部品（API クライアント、レイアウト、状態表示コンポーネントなど）はスクール側で用意された初期状態から開発を始めています。公開はスクール・チームメンバーの許可を得ています。

## 使用技術

- **フレームワーク**: Next.js 15（App Router / Server Components）
- **言語**: TypeScript
- **UI**: React 19 / Tailwind CSS v4
- **バリデーション**: zod
- **状態管理**: React Context + localStorage（認証・カート）
- **パッケージ管理**: pnpm
- **バックエンド**: 別リポジトリの REST API（`http://localhost:8080`）と連携

## 主な機能（チーム全体）

- トップページ（おすすめ商品・カテゴリ）
- 商品一覧（カテゴリ絞り込み・並び替え・ページネーション）
- 商品詳細
- 会員登録・ログイン
- カート・購入手続き
- 注文履歴・注文詳細
- マイページ

## 担当範囲

| 画面・部品 | ファイル | 内容 |
| --- | --- | --- |
| S01 トップページ | `app/page.tsx` | おすすめ商品とカテゴリを並列取得して表示。読み込み中・エラー・0件の表示を実装 |
| S02 商品一覧 | `app/products/page.tsx` | カテゴリ絞り込み・並び替え（新着／価格の昇順・降順）・ページネーションを URL のクエリで管理 |
| 商品カード | `components/ProductCard.tsx` | 商品画像・名前・価格のカード。画像が読めない場合の代替画像表示 |
| カテゴリフィルタ | `components/CategoryFilter.tsx` / `CategoryList.tsx` | カテゴリの切り替えリンク。並び順を保ったまま絞り込み |
| ページネーション | `components/Pagination.tsx` | ページ数が多い場合に「…」で省略して表示 |

担当した Pull Request: [#2](https://github.com/Gennai2750/SemiProject_202607/pull/2) / [#5](https://github.com/Gennai2750/SemiProject_202607/pull/5) / [#13](https://github.com/Gennai2750/SemiProject_202607/pull/13) / [#15](https://github.com/Gennai2750/SemiProject_202607/pull/15)

## 工夫した点

### 1. 絞り込み条件を URL で管理
カテゴリ・並び順・ページ番号を URL のクエリパラメータで管理しました。ページを再読み込みしたり、URL を共有したりしても同じ表示になります。
初期値（「全て」「新着順」「1ページ目」）はクエリから省き、URL が短くなるようにしています。
不正な値（`page=-1` や存在しない並び順など）が来ても、初期値に戻して安全に表示します。

### 2. Server Components でのデータ取得
トップページと商品一覧は Server Components で作り、カテゴリと商品を `Promise.all` で並列に取得して表示を速くしています。
API エラーと通信エラーを分けて、ユーザーに分かりやすいメッセージと再読み込みボタンを出します。

### 3. 画像が読めないときの代替表示
商品画像の URL が空のときや読み込みに失敗したときは、代替画像（No Image）に切り替えます。
レビューで「商品が切り替わってもエラー状態が残る」と指摘を受け、商品 ID が変わったらエラー状態をリセットするよう修正しました。

### 4. アクセシビリティ
- 選択中のカテゴリ・ページに `aria-current="page"` を付与
- キーボード操作用に `focus-visible` でフォーカスリングを表示
- `nav` / `section` に `aria-label` を設定

### 5. スマホ対応
- 商品一覧は画面幅に応じて 2 / 3 / 4 列に切り替え
- カテゴリが多い場合は横スクロールで表示

## チーム開発で学んだこと

- **コードレビューへの対応**: カテゴリフィルタは 2 回のレビュー指摘を受けて修正しました。指摘の意図を確認しながら直すことで、命名や責務の分け方を学びました。
- **コンフリクトの解消**: 他のメンバーと同じ `ProductCard` を編集してコンフリクトが起きました。develop を取り込んで解消し、マージ記号の消し忘れも修正しました。
- **ブランチ運用**: 画面ごとに feature ブランチを切り、こまめに develop を取り込んで差分を小さく保ちました。

<!-- 自分の言葉で、苦労した点・次に活かしたい点を1〜2行足すとより伝わります -->

## ローカルでの起動方法

```bash
# Node.js 22 推奨（20.9 以上）
corepack enable
pnpm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE を設定
pnpm dev                     # http://localhost:3000
```

※ 商品データの表示には、別途バックエンド API（`http://localhost:8080`）の起動が必要です。

---

<details>
<summary>元の README（開発者向けセットアップ手順）</summary>

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

</details>

