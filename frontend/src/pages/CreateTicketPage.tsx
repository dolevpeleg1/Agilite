import { useState } from 'react'
import type { Product, TicketCreatePayload } from '../types'
import { createTicket } from '../api'
import { ProductSelectorModal } from '../components/ProductSelectorModal'

interface Errors {
  email?: string
  name?: string
  product?: string
  subject?: string
  message?: string
}

function CreateTicketPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const [errors, setErrors] = useState<Errors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  function validate() {
    const nextErrors: Errors = {}

    if (!email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!name.trim()) {
      nextErrors.name = 'Name is required.'
    }

    if (!selectedProduct) {
      nextErrors.product = 'Please select a product for this ticket.'
    }

    if (!subject.trim()) {
      nextErrors.subject = 'Subject is required.'
    }

    if (!message.trim()) {
      nextErrors.message = 'Message is required.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitSuccess(null)
    setSubmitError(null)

    const isValid = validate()
    if (!isValid || !selectedProduct) {
      return
    }

    const payload: TicketCreatePayload = {
      email: email.trim(),
      name: name.trim(),
      subject: subject.trim(),
      message: message.trim(),
      productId: selectedProduct.id,
    }

    try {
      setIsSubmitting(true)
      await createTicket(payload)
      setSubmitSuccess('Your ticket has been submitted successfully.')
      setEmail('')
      setName('')
      setSubject('')
      setMessage('')
      setSelectedProduct(null)
      setErrors({})
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to submit ticket. Please try again.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <header className="page-header">
        <p className="page-kicker">Support</p>
        <div className="page-title-row">
          <div>
            <h2 className="page-title">Create Ticket</h2>
            <p className="page-subtitle">
              Submit a support request linked to a specific product from our catalog.
            </p>
          </div>
          <div className="page-meta">Expected response time: &lt; 24 hours</div>
        </div>
      </header>

      <div className="form-grid">
        <form className="form-card" noValidate onSubmit={handleSubmit}>
          <div className="field-group">
            <div className="field-label-row">
              <label className="field-label" htmlFor="email">
                Email
                <span className="field-label-required">*</span>
              </label>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              className="field-input"
              placeholder="customer@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email ? <p className="field-error">{errors.email}</p> : null}
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <label className="field-label" htmlFor="name">
                Name
                <span className="field-label-required">*</span>
              </label>
            </div>
            <input
              id="name"
              name="name"
              type="text"
              className="field-input"
              placeholder="Please enter your name here"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            {errors.name ? <p className="field-error">{errors.name}</p> : null}
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <span className="field-label">
                Product
                <span className="field-label-required">*</span>
              </span>
            </div>

            <div className="product-field-display">
              <button
                type="button"
                className="button-secondary button"
                onClick={() => setIsProductModalOpen(true)}
              >
                Select product
              </button>
              <div className="product-summary">
                {selectedProduct ? (
                  <>
                    {(() => {
                      const rawImage = selectedProduct.images?.[0] ?? ''
                      const usePlaceholder = rawImage.includes('placehold.co')
                      const imageSrc = usePlaceholder
                        ? 'https://placehold.co/120x120?text=Image%0ANot%0AAvailable&size=22'
                        : rawImage
                      return imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={selectedProduct.title}
                          className="product-card-image"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src =
                              'https://placehold.co/120x120?text=Image%0ANot%0AAvailable&size=22'
                          }}
                        />
                      ) : (
                        <div className="product-card-image" aria-hidden="true" />
                      )
                    })()}
                    <div className="product-card-content">
                      <div className="product-summary-title">{selectedProduct.title}</div>
                      <div className="product-summary-muted">
                        #{selectedProduct.id} · ${selectedProduct.price.toFixed(2)}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="product-summary-muted">
                    No product selected yet. Pick one from the catalog.
                  </div>
                )}
              </div>
            </div>
            {errors.product ? <p className="field-error">{errors.product}</p> : null}
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <label className="field-label" htmlFor="subject">
                Subject
                <span className="field-label-required">*</span>
              </label>
            </div>
            <input
              id="subject"
              name="subject"
              type="text"
              className="field-input"
              placeholder="Short summary of your request"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              aria-invalid={errors.subject ? 'true' : 'false'}
            />
            {errors.subject ? <p className="field-error">{errors.subject}</p> : null}
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <label className="field-label" htmlFor="message">
                Message
                <span className="field-label-required">*</span>
              </label>
              <span className="field-hint">Share as much context as you can.</span>
            </div>
            <textarea
              id="message"
              name="message"
              className="field-textarea"
              placeholder="Describe what you need help with..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              aria-invalid={errors.message ? 'true' : 'false'}
            />
            {errors.message ? <p className="field-error">{errors.message}</p> : null}
          </div>
          <div className="form-footer-note">All fields are required.</div>

          <div className="form-footer">
            <div>
              <button type="submit" className="button" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Submit ticket'}
              </button>
            </div>
          </div>

          {(submitSuccess || submitError) && (
            <div className="form-status">
              {submitSuccess ? (
                <span className="form-status-success">{submitSuccess}</span>
              ) : null}
              {submitError ? <span className="form-status-error">{submitError}</span> : null}
            </div>
          )}
        </form>
      </div>
      <ProductSelectorModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelect={(product) => setSelectedProduct(product)}
      />
    </section>
  )
}

export default CreateTicketPage

