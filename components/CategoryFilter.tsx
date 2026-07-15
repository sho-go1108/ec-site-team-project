import Link from "next/link";

export type ProductSort = "newest" | "price-asc" | "price-desc";
export type CategorySlug = "all" | "tops" | "innerwear" | "outerwear" | "pants";

export type CategoryItem = {
  label: string;
  value: CategorySlug;
};

type CategoryFilterProps = {
  categories: readonly CategoryItem[];
  selected: CategorySlug;
  sort: ProductSort;
  className?: string;
};

export function buildProductsHref(category: CategorySlug, sort: ProductSort): string {
  const params = new URLSearchParams();

  if (category !== "all") {
    params.set("category", category);
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
      <ul className="flex min-w-max items-center gap-2 overflow-x-auto pb-1">
        {categories.map((category) => {
          const isActive = category.value === selected;

          return (
            <li key={category.value} className="shrink-0">
              <Link
                href={buildProductsHref(category.value, sort)}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
                  isActive
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper text-ink hover:bg-muted",
                ].join(" ")}
              >
                {category.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}