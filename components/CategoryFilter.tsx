import Link from "next/link";
import type { Category, ProductSort } from "@/lib/types";

type CategoryFilterProps = {
  categories: readonly Category[];
  selected: string;
  sort: ProductSort;
  className?: string;
};

export function buildProductsHref(categorySlug: string, sort: ProductSort): string {
  const params = new URLSearchParams();

  if (categorySlug !== "all") {
    params.set("category", categorySlug);
  }

  if (sort !== "newest") {
    params.set("sort", sort);
  }

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export default function CategoryFilter({
  categories,
  selected,
  sort,
  className,
}: CategoryFilterProps) {
  return (
    <nav aria-label="カテゴリフィルタ" className={className}>
      <div className="overflow-x-auto pb-1">
        <ul className="flex min-w-max items-center gap-2">
          <li className="shrink-0">
            <Link
              href={buildProductsHref("all", sort)}
              aria-current={selected === "all" ? "page" : undefined}
              className={[
                "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
                selected === "all"
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-ink hover:bg-muted/60",
              ].join(" ")}
            >
              全て
            </Link>
          </li>

          {categories.map((category) => {
            const isActive = category.slug === selected;

            return (
              <li key={category.id} className="shrink-0">
                <Link
                  href={buildProductsHref(category.slug, sort)}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
                    isActive
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-paper text-ink hover:bg-muted/60",
                  ].join(" ")}
                >
                  {category.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}