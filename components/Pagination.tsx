import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  createHref: (page: number) => string;
};

type PageItem = number | "...";

function buildPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);

  for (let p = currentPage - 1; p <= currentPage + 1; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);

  const items: PageItem[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i];
    const prev = sorted[i - 1];

    if (i > 0 && page - prev > 1) {
      items.push("...");
    }
    items.push(page);
  }

  return items;
}

export default function Pagination({
  currentPage,
  totalPages,
  createHref,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  const items = buildPageItems(currentPage, totalPages);

  return (
    <nav aria-label="ページネーション" className="flex items-center justify-center gap-2">
      {canPrev ? (
        <Link
          href={createHref(currentPage - 1)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          前へ
        </Link>
      ) : (
        <span className="rounded-md border px-3 py-2 text-sm text-gray-400">前へ</span>
      )}

      {items.map((item, idx) =>
        item === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-sm text-gray-500">
            …
          </span>
        ) : item === currentPage ? (
          <span
            key={item}
            aria-current="page"
            className="rounded-md border bg-black px-3 py-2 text-sm text-white"
          >
            {item}
          </span>
        ) : (
          <Link key={item} href={createHref(item)} className="rounded-md border px-3 py-2 text-sm">
            {item}
          </Link>
        )
      )}

      {canNext ? (
        <Link
          href={createHref(currentPage + 1)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          次へ
        </Link>
      ) : (
        <span className="rounded-md border px-3 py-2 text-sm text-gray-400">次へ</span>
      )}
    </nav>
  );
}