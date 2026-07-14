"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { formatPrice } from "@/lib/money";
import type { ProductSummary } from "@/lib/types";

type ProductCardProps = {
  product: ProductSummary;
  priority?: boolean;
};

// API画像が取得できない/未設定の場合のフォールバック画像
const NO_IMAGE_SRC = "/assets/no-image.png";

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const initialSrc =
    product.image_url && product.image_url.length > 0
      ? product.image_url
      : NO_IMAGE_SRC;

  // next/image の onError で差し替えるため、表示中srcをstate管理
  const [imageSrc, setImageSrc] = useState<string>(initialSrc);

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
        <div className="block rounded-md">
          <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md bg-muted">
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              priority={priority}
              className="object-cover"
              // グリッド実幅に合わせる
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
              onError={() => {
                // 画像読み込み失敗時は No Image にフォールバック
                setImageSrc(NO_IMAGE_SRC);
              }}
            />
          </div>

          <h3 className="line-clamp-1 text-base font-semibold text-ink">
            {product.name}
          </h3>
          <p className="mt-2 text-lg font-bold text-ink">
            {formatPrice(product.price)}
          </p>
        </div>
      </article>
    </Link>
  );
}
