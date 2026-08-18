import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import CategoryList from "@/components/CategoryList";
import Pagination from "@/components/Pagination";
import { ApiRequestError, api } from "@/lib/apiClient";

import type {
  CategoriesResponse,
  ProductsResponse,
  ProductSort,
} from "@/lib/types";

type SearchParams = {
  category?: string;
  sort?: string;
  page?: string;
};

const SORT_OPTIONS: ReadonlyArray<{ value: ProductSort; label: string }> = [
  { value: "newest", label: "新着順" },
  { value: "price_asc", label: "価格が低い順" },
  { value: "price_desc", label: "価格が高い順" },
];

const DEFAULT_LIMIT = 12;

function normalizePage(raw?: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function normalizeSort(raw?: string): ProductSort {
  const values = new Set<ProductSort>(["newest", "price_asc", "price_desc"]);
  if (raw && values.has(raw as ProductSort)) return raw as ProductSort;
  return "newest";
}

function createProductsPath(params: {
  category?: string;
  sort?: ProductSort;
  page?: number;
}): string {
  const sp = new URLSearchParams();
  if (params.category && params.category !== "all") sp.set("category", params.category);
  if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
  if (params.page && params.page > 1) sp.set("page", String(params.page));

  const qs = sp.toString();
  return qs ? `/products?${qs}` : "/products";
}

async function getCategories(): Promise<CategoriesResponse["categories"]> {
  const data = await api.get<CategoriesResponse>("/api/categories");
  return data.categories;
}

async function getProducts(params: {
  category?: string;
  sort: ProductSort;
  page: number;
  limit: number;
}): Promise<ProductsResponse> {
  const sp = new URLSearchParams();

  if (params.category && params.category !== "all") {
    sp.set("category", params.category);
  }
  sp.set("sort", params.sort);
  sp.set("page", String(params.page));
  sp.set("limit", String(params.limit));

  const data = await api.get<ProductsResponse>(`/api/products?${sp.toString()}`);
  return data;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const currentCategory = sp.category ?? "all";
  const currentSort = normalizeSort(sp.sort);
  const currentPage = normalizePage(sp.page);

  let categories: CategoriesResponse["categories"];
  let productsRes: ProductsResponse;

  try {
    [categories, productsRes] = await Promise.all([
      getCategories(),
      getProducts({
        category: currentCategory,
        sort: currentSort,
        page: currentPage,
        limit: DEFAULT_LIMIT,
      }),
    ]);
  } catch (error: unknown) {
    const message =
      error instanceof ApiRequestError
        ? "商品一覧の取得に失敗しました。（APIエラー）"
        : "商品一覧の取得に失敗しました。時間をおいて再度お試しください。";

    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-10 md:px-6 lg:px-8">
        <p className="mb-4 text-red-600">{message}</p>
        <Link href="/products" className="inline-flex rounded-md border px-4 py-2">
          再読み込み
        </Link>
      </main>
    );
  }

  const totalPages = productsRes.pagination.total_pages;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">商品一覧</h1>
        <p className="text-sm text-ink/80">カテゴリや並び順で商品を絞り込めます。</p>
      </header>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">カテゴリ</h2>
          <Link href="/products" className="text-sm underline underline-offset-2">
            絞り込みをクリア
          </Link>
        </div>

        <CategoryList
          categories={categories}
          selected={currentCategory}
          sort={currentSort}
        />
      </section>

      <section className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-ink/80">全 {productsRes.pagination.total_count} 件</p>

        <form action="/products" method="get" className="flex items-center gap-2">
          {currentCategory !== "all" ? (
            <input type="hidden" name="category" value={currentCategory} />
          ) : null}

          <label htmlFor="sort" className="text-sm text-ink/80">
            並び順
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={currentSort}
            className="rounded-md border bg-white px-3 py-2 text-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button type="submit" className="rounded-md border px-3 py-2 text-sm">
            適用
          </button>
        </form>
      </section>

      {productsRes.products.length === 0 ? (
        <section className="rounded-lg border p-6">
          <p className="text-sm text-ink/80">該当する商品がありません。</p>
        </section>
      ) : (
        <>
          <ul className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {productsRes.products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>

          <Pagination
            currentPage={productsRes.pagination.current_page}
            totalPages={totalPages}
            createHref={(page) =>
              createProductsPath({
                category: currentCategory,
                sort: currentSort,
                page,
              })
            }
          />
        </>
      )}
    </main>
  );
}