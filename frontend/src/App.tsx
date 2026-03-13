import { NavLink, Route, Routes } from 'react-router-dom'
import CreateTicketPage from './pages/CreateTicketPage'
import TicketsDashboardPage from './pages/TicketsDashboardPage'
import TicketDetailsPage from './pages/TicketDetailsPage'
import ProductsPage from './pages/ProductsPage'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="app-logo-link">
          <h1>Agilite Support</h1>
        </NavLink>
        <nav className="app-nav">
          <NavLink to="/tickets/new" className="nav-link">
            Create Ticket
          </NavLink>
          <NavLink to="/tickets" className="nav-link" end>
            Tickets
          </NavLink>
          <NavLink to="/products" className="nav-link">
            Products
          </NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/tickets/new" element={<CreateTicketPage />} />
          <Route path="/tickets" element={<TicketsDashboardPage />} />
          <Route path="/tickets/:id" element={<TicketDetailsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="*" element={<CreateTicketPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
