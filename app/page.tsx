/**
 * S01 トップページ（プレースホルダ）。
 *
 * これは環境構築の動作確認用の仮ページです。
 * 受講生はこのファイルを書き換えて、おすすめ商品やカテゴリ一覧を実装してください。
 * 商品データは `api.get<RecommendedProductsResponse>('/api/products/recommended')` で取得できます。
 */
export default function HomePage() {
  return (
    <main className="container-app py-16">
      <h1 className="text-3xl font-bold">XEDGE STORE</h1>
      <p className="mt-4 text-muted">
        フロントエンドの環境構築が完了しました。このページ（app/page.tsx）から実装を始めてください。
      </p>

      <section className="mt-10 rounded border border-line bg-paper-soft p-6">
        <h2 className="font-semibold">セットアップ済みの共通部品</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-soft">
          <li>
            <code>lib/apiClient.ts</code> … API通信の共通ラッパー（<code>api.get / post / put</code>）
          </li>
          <li>
            <code>lib/types.ts</code> … APIレスポンスの型定義
          </li>
          <li>
            <code>lib/schemas.ts</code> … zod のフォームバリデーション
          </li>
          <li>
            <code>lib/money.ts</code> … 金額フォーマット（<code>formatPrice</code>）
          </li>
          <li>
            <code>contexts/AuthContext.tsx</code> … 認証状態（<code>useAuth</code>）
          </li>
          <li>
            <code>contexts/CartContext.tsx</code> … カート状態（<code>useCart</code>）
          </li>
        </ul>
      </section>
    </main>
  )
}
