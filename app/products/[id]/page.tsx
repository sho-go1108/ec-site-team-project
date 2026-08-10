'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { api, ApiRequestError } from '@/lib/apiClient'
import { formatPrice } from '@/lib/money'
import type {
  ProductDetail,
  ProductResponse,
  ProductSizeStock,
  Size,
} from '@/lib/types'
import { QuantityStepper } from '@/components/QuantityStepper'
import { ToastContainer, type ToastItem } from '@/components/Toast'

const NO_IMAGE_SRC = '/assets/no-image.png'

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const { items, addItem } = useCart()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<Size | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [imageError, setImageError] = useState(false)

  function getAvailableQuantity(sizeStock: ProductSizeStock) {
    if (!product) return 0

    const quantityInCart = items.find(
      (item) =>
        item.product_id === product.id && item.size === sizeStock.size,
    )?.quantity ?? 0

    return Math.max(0, sizeStock.stock - quantityInCart)
  }

  const selectedSizeStock = product?.sizes.find((sizeStock) => sizeStock.size === selectedSize)
  const availableQuantity = selectedSizeStock ? getAvailableQuantity(selectedSizeStock) : 0
  const hasAvailableSize = product?.sizes.some((sizeStock) => getAvailableQuantity(sizeStock) > 0) ?? false
  const normalizedImageUrl = product?.image_url.trim() ?? ''
  const imageSrc = imageError || normalizedImageUrl.length === 0 ? NO_IMAGE_SRC : normalizedImageUrl

  useEffect(() => {
    let isActive = true

    async function fetchProduct() {
      setProduct(null)
      setSelectedSize(null)
      setQuantity(1)
      setImageError(false)
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const data = await api.get<ProductResponse>(`/api/products/${params.id}`)

        if (isActive) setProduct(data.product)
      } catch (error) {
        if (!isActive) return

        if (error instanceof ApiRequestError) {
          if (error.status === 404 || error.code === 'NOT_FOUND') {
            setErrorMessage('商品が見つかりません')
          } else {
            setErrorMessage(error.message)
          }
        } else {
          setErrorMessage('商品の取得に失敗しました')
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    fetchProduct()

    return () => { isActive = false }
  }, [params.id])

  const handleCloseToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }, [])

  function handleSizeSelect(sizeStock: ProductSizeStock) {
    if (getAvailableQuantity(sizeStock) <= 0) return
    if (selectedSize === sizeStock.size) return

    setSelectedSize(sizeStock.size)
    setQuantity(1)
  }

  function handleAddToCart() {
    if (!product || !selectedSize || availableQuantity <= 0) return

    const quantityToAdd = Math.min(quantity, availableQuantity)
    const willExhaustAvailableQuantity = quantityToAdd >= availableQuantity

    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size: selectedSize,
      quantity: quantityToAdd,
    })
    setQuantity(1)
    if (willExhaustAvailableQuantity) setSelectedSize(null)

    const newToast: ToastItem = {
      id: crypto.randomUUID(),
      message: `${quantityToAdd}点をカートに追加しました`,
    }
    setToasts((currentToasts) => [newToast, ...currentToasts].slice(0, 5))
  }

  if (isLoading) {
    return <p>読み込み中です...</p>
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>
  }

  if (!product) {
    return <p>商品が見つかりません</p>
  }

  return (
    <main className="container-app py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </div>

        <section>
          <h1 className="text-2xl font-bold">{product.name}</h1>

          <p className="mt-4 text-xl font-semibold">
            {formatPrice(product.price)}
          </p>

          <p className="mt-6 whitespace-pre-wrap leading-7 text-gray-700">
            {product.description}
          </p>
          <div className="mt-8">
            <p className="font-semibold">サイズ</p>

            <div className="mt-3 flex flex-wrap gap-3">
              {product.sizes.map((sizeStock) => (
                <button
                  key={sizeStock.id}
                  type="button"
                  disabled={getAvailableQuantity(sizeStock) <= 0}
                  aria-pressed={selectedSize === sizeStock.size}
                  onClick={() => handleSizeSelect(sizeStock)}
                  className={`min-w-12 rounded-md border px-4 py-2 ${selectedSize === sizeStock.size
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line bg-paper text-ink'
                    } disabled:opacity-40`}
                >
                  {sizeStock.size}
                </button>
              ))}
            </div>

            {!hasAvailableSize ? (
              <p className="mt-3 text-sm font-medium text-danger" role="status">
                現在選択できるサイズはありません
              </p>
            ) : null}

            {selectedSizeStock ? (
              <p className="mt-3 text-sm text-muted" aria-live="polite">
                追加可能：残り{availableQuantity}点
              </p>
            ) : null}

            {selectedSizeStock && availableQuantity > 0 ? (
              <div className="mt-8">
                <p className="font-semibold">数量</p>

                <div className="mt-3">
                  <QuantityStepper
                    value={quantity}
                    min={1}
                    max={availableQuantity}
                    onChange={setQuantity}
                    decreaseLabel="数量を1減らす"
                    increaseLabel="数量を1増やす"
                  />
                </div>
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedSize || availableQuantity <= 0}
              className="btn-primary mt-8 w-full disabled:!cursor-default"
            >
              カートに追加
            </button>
          </div>
        </section>
      </div>

      <ToastContainer toasts={toasts} onClose={handleCloseToast} />
    </main>
  )
}
