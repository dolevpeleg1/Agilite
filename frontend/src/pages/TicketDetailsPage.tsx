import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Product, TicketWithReplies } from '../types'
import { fetchTicket, fetchProduct, addReply, closeTicket } from '../api'

const PLACEHOLDER_IMAGE = 'https://placehold.co/120x120?text=Image%0ANot%0AAvailable&size=22'

function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<TicketWithReplies | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  useEffect(() => {
    const ticketId = id ? parseInt(id, 10) : NaN
    if (isNaN(ticketId)) {
      setError('Invalid ticket ID')
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const ticketData = await fetchTicket(ticketId)
        if (cancelled) return
        setTicket(ticketData)
        const productRes = await fetchProduct(ticketData.productId).catch(() => null)
        if (!cancelled && productRes) setProduct(productRes)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load ticket.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  async function handleSubmitReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!ticket || !replyContent.trim()) return
    setReplyError(null)
    try {
      setIsSubmittingReply(true)
      const newReply = await addReply(ticket.id, replyContent.trim())
      setTicket((prev) =>
        prev ? { ...prev, replies: [...(prev.replies ?? []), newReply] } : null
      )
      setReplyContent('')
    } catch (e) {
      setReplyError(e instanceof Error ? e.message : 'Failed to add reply.')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  async function handleCloseTicket() {
    if (!ticket) return
    try {
      setIsClosing(true)
      const updated = await closeTicket(ticket.id)
      setTicket((prev) => (prev ? { ...prev, status: updated.status } : null))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to close ticket.')
    } finally {
      setIsClosing(false)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getProductImageSrc() {
    const raw = product?.images?.[0] ?? ''
    if (!raw) return null
    if (raw.includes('placehold.co')) return PLACEHOLDER_IMAGE
    return raw
  }

  if (loading) {
    return (
      <section>
        <p className="tickets-loading">Loading ticket…</p>
      </section>
    )
  }

  if (error || !ticket) {
    return (
      <section>
        <p className="form-status-error">{error ?? 'Ticket not found.'}</p>
        <Link to="/tickets" className="button button-secondary" style={{ marginTop: '1rem' }}>
          Back to tickets
        </Link>
      </section>
    )
  }

  const canReply = ticket.status === 'open'
  const imageSrc = getProductImageSrc()

  return (
    <section>
      <header className="page-header">
        <p className="page-kicker">Ticket #{ticket.id}</p>
        <div className="page-title-row">
          <div>
            <h2 className="page-title">{ticket.subject}</h2>
            <p className="page-subtitle">
              {ticket.name} · {formatDate(ticket.createdAt)}
            </p>
          </div>
          <span className={`status-badge status-badge-${ticket.status}`}>
            {ticket.status}
          </span>
        </div>
      </header>

      <div className="form-grid">
        <div className="form-card">
          <div className="ticket-details-meta">
            <div>
              <span className="ticket-details-label">Customer</span>
              <p className="ticket-details-value">{ticket.name}</p>
              <p className="ticket-details-muted">{ticket.email}</p>
            </div>
            <div>
              <span className="ticket-details-label">Product</span>
              <div className="ticket-details-product">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={product?.title ?? 'Product'}
                    className="product-card-image"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = PLACEHOLDER_IMAGE
                    }}
                  />
                ) : (
                  <div className="product-card-image" aria-hidden="true" />
                )}
                <div>
                  <p className="ticket-details-value">
                    {product?.title ?? `Product #${ticket.productId}`}
                  </p>
                  {product && (
                    <p className="ticket-details-muted">
                      ${product.price.toFixed(2)}
                      {product.category?.name ? ` · ${product.category.name}` : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="field-group">
            <span className="ticket-details-label">Message</span>
            <p className="ticket-details-message">{ticket.message}</p>
          </div>

          <div className="ticket-conversation">
            <h3 className="ticket-conversation-title">Conversation</h3>
            <div className="ticket-replies">
              {(ticket.replies ?? []).length === 0 ? (
                <p className="ticket-replies-empty">No replies yet.</p>
              ) : (
                (ticket.replies ?? []).map((reply) => (
                  <div key={reply.id} className="ticket-reply">
                    <p className="ticket-reply-content">{reply.content}</p>
                    <p className="ticket-reply-date">{formatDate(reply.createdAt)}</p>
                  </div>
                ))
              )}
            </div>

            {canReply && (
              <form onSubmit={handleSubmitReply} className="ticket-reply-form">
                <div className="field-group">
                  <label className="field-label" htmlFor="reply-content">
                    Add reply
                  </label>
                  <textarea
                    id="reply-content"
                    className="field-textarea"
                    rows={3}
                    placeholder="Write your reply…"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    disabled={isSubmittingReply}
                  />
                </div>
                {replyError && <p className="field-error">{replyError}</p>}
                <div className="ticket-actions">
                  <button
                    type="submit"
                    className="button"
                    disabled={isSubmittingReply || !replyContent.trim()}
                  >
                    {isSubmittingReply ? 'Sending…' : 'Submit reply'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {canReply && (
            <div className="ticket-actions">
              <button
                type="button"
                className="button-secondary button"
                onClick={handleCloseTicket}
                disabled={isClosing}
              >
                {isClosing ? 'Closing…' : 'Close ticket'}
              </button>
            </div>
          )}

          <Link to="/tickets" className="button-ghost button">
            ← Back to tickets
          </Link>
        </div>
      </div>
    </section>
  )
}

export default TicketDetailsPage
