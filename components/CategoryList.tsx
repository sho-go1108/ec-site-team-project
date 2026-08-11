import CategoryFilter from "@/components/CategoryFilter";
import type { Category, ProductSort } from "@/lib/types";

type CategoryListProps = {
  selected?: string;
  sort?: ProductSort;
  categories: readonly Category[];
  className?: string;
};

export default function CategoryList({
  selected = "all",
  sort = "newest",
  categories,
  className,
}: CategoryListProps) {
  return (
    <section aria-label="カテゴリ一覧" className={className}>
      <CategoryFilter categories={categories} selected={selected} sort={sort} />
    </section>
  );
}