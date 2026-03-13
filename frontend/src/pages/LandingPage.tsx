import { useNavigate } from 'react-router-dom'
import { useUserMode } from '../context/UserModeContext'

export function LandingPage() {
  const navigate = useNavigate()
  const { selectCustomerMode, selectAdminMode } = useUserMode()

  function handleCustomer() {
    selectCustomerMode()
    navigate('/tickets/new')
  }

  function handleAdmin() {
    selectAdminMode()
    navigate('/tickets')
  }

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1 className="landing-title">Welcome to Agilite Ticket Service</h1>
        <p className="landing-subtitle">
          A demo environment for testing our ticketing system.
        </p>
        <div className="landing-cards">
          <button
            type="button"
            className="landing-card"
            onClick={handleCustomer}
          >
            <span className="landing-card-title">Continue as Customer</span>
            <span className="landing-card-desc">
              Submit support tickets and browse products.
            </span>
          </button>
          <button
            type="button"
            className="landing-card"
            onClick={handleAdmin}
          >
            <span className="landing-card-title">Continue as Admin</span>
            <span className="landing-card-desc">
              View and manage tickets and browse products.
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
