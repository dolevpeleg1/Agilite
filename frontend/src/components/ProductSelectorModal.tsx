import { useEffect, useState } from 'react'
import type { Product } from '../types'
import { fetchProducts } from '../api'

interface ProductSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (product: Product) => void
}

export function ProductSelectorModal({ isOpen, onClose, onSelect }: ProductSelectorModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchProducts()
        if (!cancelled) {
          setProducts(data)
        }
      } catch (e) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'Failed to load products.'
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Select product"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="page-kicker">Products</p>
            <h2 className="page-title">Select product</h2>
          </div>
          <button type="button" className="button-ghost" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="modal-body">
          {loading && <p>Loading products…</p>}
          {error && <p className="form-status-error">{error}</p>}

          {!loading && !error && (
            <ul className="product-list">
              {products.map((product) => {
                const rawImage = product.images?.[0] ?? ''
                const shouldForcePlaceholder = rawImage.includes('placehold.co')
                const imageSrc = shouldForcePlaceholder
                  ? 'https://placehold.co/120x120?text=Image%0ANot%0AAvailable&size=22'
                  : rawImage

                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      className="product-card-button"
                      onClick={() => {
                        onSelect(product)
                        onClose()
                      }}
                    >
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={product.title}
                          className="product-card-image"
                          onError={(event) => {
                            event.currentTarget.onerror = null
                            event.currentTarget.src =
                              'https://placehold.co/120x120?text=Image%0ANot%0AAvailable&size=22'
                          }}
                        />
                      ) : (
                        <div className="product-card-image" aria-hidden="true" />
                      )}
                      <div className="product-card-content">
                        <div className="product-card-title">{product.title}</div>
                        <div className="product-card-meta">
                          ${product.price.toFixed(2)}
                          {product.category?.name ? ` · ${product.category.name}` : null}
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

