# components/

共通コンポーネントを置くフォルダです。

セットアップ済みのもの:

- `RequireAuth.tsx` … 認証必須ページのガード（未ログインなら `/login` へリダイレクト）

これから受講生が実装するもの（`design/components.md` 参照）:

- `AppHeader.tsx` / `AppFooter.tsx` … 共通ヘッダー・フッター
- `ProductCard.tsx` … 商品カード（一覧で使用）
- `CartItemRow.tsx` … カートの明細行
- `OrderSummary.tsx` … 金額サマリー
- `CategoryList.tsx` … カテゴリ一覧

> ヘッダー・フッターはすべての画面で共通なので、`app/layout.tsx` に配置すると便利です。
