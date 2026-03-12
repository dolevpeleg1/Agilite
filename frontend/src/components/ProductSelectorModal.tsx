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
  const [searchQuery, setSearchQuery] = useState('')

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

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredProducts =
    !normalizedQuery
      ? products
      : products.filter((product) => product.title.toLowerCase().includes(normalizedQuery))

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
          <div
            className="field-group"
            style={{
              flexShrink: 0,
              maxWidth: '420px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <label
              className="field-label"
              htmlFor="product-search"
              style={{ marginBottom: 0, whiteSpace: 'nowrap' }}
            >
              Search products
            </label>
            <input
              id="product-search"
              className="field-input"
              type="search"
              placeholder="Filter by name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              style={{ flex: 1, minWidth: 0 }}
            />
          </div>

          {loading && <p>Loading products…</p>}
          {error && <p className="form-status-error">{error}</p>}

          {!loading && !error && (
            <ul className="product-list">
              {filteredProducts.map((product) => {
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

