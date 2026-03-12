import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Ticket } from '../types'
import { fetchTickets, fetchProducts } from '../api'

type StatusFilter = 'all' | 'open' | 'closed'

function TicketsDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [productMap, setProductMap] = useState<Map<number, string>>(new Map())
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [ticketsData, productsData] = await Promise.all([
          fetchTickets(),
          fetchProducts(),
        ])
        if (!cancelled) {
          setTickets(ticketsData)
          const map = new Map<number, string>()
          productsData.forEach((p) => map.set(p.id, p.title))
          setProductMap(map)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load tickets.')
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

  const filteredTickets =
    filter === 'all'
      ? tickets
      : tickets.filter((t) => t.status === filter)

  function getProductName(ticket: Ticket): string {
    return ticket.productName ?? productMap.get(ticket.productId) ?? `Product #${ticket.productId}`
  }

  function formatDate(createdAt: string): string {
    return new Date(createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <section>
      <header className="page-header">
        <p className="page-kicker">Admin</p>
        <div className="page-title-row">
          <div>
            <h2 className="page-title">Tickets Dashboard</h2>
            <p className="page-subtitle">
              View and manage all submitted support tickets.
            </p>
          </div>
        </div>
      </header>

      <div className="form-grid">
        <div className="form-card">
          <div className="tickets-filter">
            <button
              type="button"
              className={`button-secondary button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              disabled={loading}
            >
              All
            </button>
            <button
              type="button"
              className={`button-secondary button ${filter === 'open' ? 'active' : ''}`}
              onClick={() => setFilter('open')}
              disabled={loading}
            >
              Open
            </button>
            <button
              type="button"
              className={`button-secondary button ${filter === 'closed' ? 'active' : ''}`}
              onClick={() => setFilter('closed')}
              disabled={loading}
            >
              Closed
            </button>
          </div>

          {loading && <p className="tickets-loading">Loading tickets…</p>}
          {error && (
            <div className="form-status">
              <span className="form-status-error">{error}</span>
            </div>
          )}

          {!loading && !error && (
            <>
              {filteredTickets.length === 0 ? (
                <p className="tickets-empty">
                  {tickets.length === 0
                    ? 'No tickets yet.'
                    : 'No tickets match this filter.'}
                </p>
              ) : (
                <div className="tickets-table-wrapper">
                  <div className="tickets-table">
                    <div className="tickets-table-header">
                      <div className="tickets-cell tickets-cell-id">Ticket ID</div>
                      <div className="tickets-cell tickets-cell-customer">Customer</div>
                      <div className="tickets-cell tickets-cell-subject">Subject</div>
                      <div className="tickets-cell tickets-cell-product">Product</div>
                      <div className="tickets-cell tickets-cell-status">Status</div>
                      <div className="tickets-cell tickets-cell-date">Date</div>
                    </div>
                    {filteredTickets.map((ticket) => (
                      <Link
                        key={ticket.id}
                        to={`/tickets/${ticket.id}`}
                        className="tickets-table-row"
                      >
                        <div className="tickets-cell tickets-cell-id">#{ticket.id}</div>
                        <div className="tickets-cell tickets-cell-customer">{ticket.name}</div>
                        <div className="tickets-cell tickets-cell-subject">{ticket.subject}</div>
                        <div className="tickets-cell tickets-cell-product">
                          {getProductName(ticket)}
                        </div>
                        <div className="tickets-cell tickets-cell-status">
                          <span className={`status-badge status-badge-${ticket.status}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <div className="tickets-cell tickets-cell-date">
                          {formatDate(ticket.createdAt)}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default TicketsDashboardPage
