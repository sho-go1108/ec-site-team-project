import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  createHref: (page: number) => string;
};

export default function Pagination({
  currentPage,
  totalPages,
  createHref,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <nav aria-label="ページネーション" className="flex items-center justify-center gap-2">
      {canPrev ? (
        <Link href={createHref(currentPage - 1)} className="rounded-md border px-3 py-2 text-sm">
          前へ
        </Link>
      ) : (
        <span className="rounded-md border px-3 py-2 text-sm text-ink/40">前へ</span>
      )}

      <ol className="flex items-center gap-1">
        {pages.map((page) => {
          const isCurrent = page === currentPage;
          return (
            <li key={page}>
              {isCurrent ? (
                <span
                  aria-current="page"
                  className="inline-flex min-w-9 justify-center rounded-md bg-ink px-3 py-2 text-sm text-paper"
                >
                  {page}
                </span>
              ) : (
                <Link
                  href={createHref(page)}
                  className="inline-flex min-w-9 justify-center rounded-md border px-3 py-2 text-sm"
                >
                  {page}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {canNext ? (
        <Link href={createHref(currentPage + 1)} className="rounded-md border px-3 py-2 text-sm">
          次へ
        </Link>
      ) : (
        <span className="rounded-md border px-3 py-2 text-sm text-ink/40">次へ</span>
      )}
    </nav>
  );
}