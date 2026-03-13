import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { UserModeProvider, useUserMode } from './context/UserModeContext'
import CreateTicketPage from './pages/CreateTicketPage'
import TicketsDashboardPage from './pages/TicketsDashboardPage'
import TicketDetailsPage from './pages/TicketDetailsPage'
import ProductsPage from './pages/ProductsPage'
import { LandingPage } from './pages/LandingPage'

function RequireMode({
  requireAdmin,
  children,
}: {
  requireAdmin?: boolean
  children: React.ReactNode
}) {
  const { userMode } = useUserMode()
  const loc = useLocation()

  if (userMode === null) return <Navigate to="/" state={{ from: loc }} replace />
  if (requireAdmin && userMode === 'customer') {
    return <Navigate to="/" state={{ from: loc }} replace />
  }
  return <>{children}</>
}

function AppContent() {
  const { userMode } = useUserMode()

  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="app-logo-link">
          <h1>Agilite Support</h1>
        </NavLink>
        <nav className="app-nav">
          {userMode === 'customer' && (
            <NavLink to="/tickets/new" className="nav-link">
              Create Ticket
            </NavLink>
          )}
          {userMode === 'admin' && (
            <NavLink to="/tickets" className="nav-link" end>
              Tickets
            </NavLink>
          )}
          {userMode !== null && (
            <NavLink to="/products" className="nav-link">
              Products
            </NavLink>
          )}
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/tickets/new"
            element={
              <RequireMode>
                <CreateTicketPage />
              </RequireMode>
            }
          />
          <Route
            path="/tickets"
            element={
              <RequireMode requireAdmin>
                <TicketsDashboardPage />
              </RequireMode>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <RequireMode requireAdmin>
                <TicketDetailsPage />
              </RequireMode>
            }
          />
          <Route
            path="/products"
            element={
              <RequireMode>
                <ProductsPage />
              </RequireMode>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <UserModeProvider>
      <AppContent />
    </UserModeProvider>
  )
}

export default App
