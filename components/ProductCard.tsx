"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { formatPrice } from "@/lib/money";
import type { ProductSummary } from "@/lib/types";

type ProductCardProps = {
  product: ProductSummary;
  priority?: boolean;
};

// フォールバック画像
const NO_IMAGE_SRC = "/assets/no-image.png";

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    setFailedSrc(null);
  }, [product.id]);

  const normalizedImageUrl = product.image_url?.trim() ?? "";
  const preferredSrc =
    normalizedImageUrl.length > 0 ? normalizedImageUrl : NO_IMAGE_SRC;

  const imageSrc = preferredSrc === failedSrc ? NO_IMAGE_SRC : preferredSrc;

  return (
    <Link
      href={`/products/${product.id}`}
      className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
      aria-label={`${product.name} の商品詳細へ`}
    >
      <article
        className="
          rounded-lg border border-line bg-paper p-4
          transition-transform duration-200 ease-out
          hover:-translate-y-1 hover:shadow-md
        "
      >
        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md bg-muted">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            priority={priority}
            className="object-cover"
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
            onError={() => {
              setFailedSrc(preferredSrc);
            }}
          />
        </div>

        <h3 className="line-clamp-1 text-base font-semibold text-ink">
          {product.name}
        </h3>
        <p className="mt-2 text-lg font-bold text-ink">
          {formatPrice(product.price)}
        </p>
      </article>
    </Link>
  );
}