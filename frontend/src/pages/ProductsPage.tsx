import { useEffect, useState } from 'react'
import type { Product } from '../types'
import { fetchProducts } from '../api'

const ITEMS_PER_PAGE = 20
const IMAGE_PLACEHOLDER =
  'https://placehold.co/240x180?text=Image%0ANot%0AAvailable&size=20'

function getProductImageSrc(product: Product): string {
  const rawImage = product.images?.[0] ?? ''
  const shouldForcePlaceholder = rawImage.includes('placehold.co')
  return shouldForcePlaceholder ? IMAGE_PLACEHOLDER : rawImage || IMAGE_PLACEHOLDER
}

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
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
  }, [])

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredProducts =
    !normalizedQuery
      ? products
      : products.filter((product) => product.title.toLowerCase().includes(normalizedQuery))

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProducts = filteredProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  return (
    <section>
      <header className="page-header">
        <p className="page-kicker">Browse</p>
        <div className="page-title-row">
          <h2 className="page-title">Products Catalog</h2>
        </div>
        <div
          className="field-group"
          style={{
            maxWidth: '360px',
            marginTop: '0.25rem',
          }}
        >
          <label className="field-label" htmlFor="product-search">
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
          />
        </div>
      </header>

      {loading && <p className="tickets-loading">Loading products…</p>}
      {error && <p className="form-status-error">{error}</p>}

      {!loading && !error && filteredProducts.length === 0 && (
        <p className="tickets-empty">
          {products.length === 0 ? 'No products available.' : 'No products match your search.'}
        </p>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <>
          <ul className="products-grid">
            {paginatedProducts.map((product) => {
            const imageSrc = getProductImageSrc(product)

            return (
              <li key={product.id} className="product-catalog-card">
                <div className="product-catalog-image-wrap">
                  <img
                    src={imageSrc}
                    alt={product.title}
                    className="product-catalog-image"
                    loading="lazy"
                    width={240}
                    height={180}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = IMAGE_PLACEHOLDER
                    }}
                  />
                </div>
                <div className="product-catalog-body">
                  <div className="product-catalog-title">{product.title}</div>
                  <div className="product-catalog-meta">
                    ${product.price.toFixed(2)}
                    {product.category?.name ? ` · ${product.category.name}` : null}
                  </div>
                </div>
              </li>
            )
          })}
          </ul>

          {totalPages > 1 && (
            <nav className="products-pagination" aria-label="Products pagination">
              <button
                type="button"
                className="button button-secondary"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="products-pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="button button-secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  )
}

export default ProductsPage
