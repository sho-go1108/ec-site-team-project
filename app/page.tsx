import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import CategoryList from "@/components/CategoryList";
import { api, ApiRequestError } from "@/lib/apiClient";
import type { Category, ProductSummary } from "@/lib/types";

type RecommendedProductsResponse = {
  products: ProductSummary[];
};

async function getCategories(): Promise<Category[]> {
  const data = await api.get<{ categories: Category[] }>("/api/categories");
  return data.categories;
}

async function getRecommendedProducts(): Promise<ProductSummary[]> {
  const data = await api.get<
    RecommendedProductsResponse
  >("/api/products/recommended");
  return data.products;
}

export default async function HomePage() {
  try {
    const [categories, recommendedProducts] = await Promise.all([
      getCategories(),
      getRecommendedProducts(),
    ]);

    const visibleCategories = categories.slice(0, 4);

    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 lg:px-8">
        <section className="mb-10 rounded-2xl bg-muted p-6 md:p-10">
          <h1 className="mb-3 text-2xl font-bold md:text-3xl">
            お気に入りの一品を見つけよう
          </h1>
          <p className="mb-5 text-sm text-ink/80 md:text-base">
            カテゴリから探して、あなたにおすすめの商品をチェックできます。
          </p>
          <Link
            href="/products"
            className="inline-flex rounded-md bg-ink px-4 py-2 text-paper"
          >
            商品を見る
          </Link>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">カテゴリ</h2>
          {visibleCategories.length === 0 ? (
            <p className="text-sm text-ink/80">
              表示できるカテゴリがありません。
            </p>
          ) : (
            <CategoryList categories={visibleCategories} />
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">おすすめ商品</h2>
          {recommendedProducts.length === 0 ? (
            <p className="text-sm text-ink/80">
              現在表示できるおすすめ商品はありません。
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {recommendedProducts.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    );
  } catch (error: unknown) {
    const message =
      error instanceof ApiRequestError
        ? "データの取得に失敗しました。時間をおいて再度お試しください。"
        : "通信エラーが発生しました。時間をおいて再度お試しください。";

    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-10 md:px-6 lg:px-8">
        <p className="mb-4 text-red-600">{message}</p>
        <Link href="/" className="inline-flex rounded-md border px-4 py-2">
          再読み込み
        </Link>
      </main>
    );
  }
}