import CategoryFilter, {
  type CategoryItem,
  type CategorySlug,
} from "@/components/CategoryFilter";
import type { ProductSort } from "@/lib/types";

type CategoryListProps = {
  selected?: CategorySlug;
  sort?: ProductSort;
  categories: readonly CategoryItem[];
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