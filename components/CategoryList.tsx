import CategoryFilter, {
  type CategoryItem,
  type CategorySlug,
  type ProductSort,
} from "@/components/CategoryFilter";

export const CATEGORY_ITEMS: readonly CategoryItem[] = [
  { label: "全て", value: "all" },
  { label: "トップス", value: "tops" },
  { label: "インナー", value: "innerwear" },
  { label: "アウター", value: "outerwear" },
  { label: "パンツ", value: "pants" },
] as const;

type CategoryListProps = {
  selected?: CategorySlug;
  sort?: ProductSort;
  categories?: readonly CategoryItem[];
  className?: string;
};

export default function CategoryList({
  selected = "all",
  sort = "newest",
  categories = CATEGORY_ITEMS,
  className,
}: CategoryListProps) {
  return (
    <section aria-label="カテゴリ一覧" className={className}>
      <CategoryFilter categories={categories} selected={selected} sort={sort} />
    </section>
  );
}