# Agilite — Customer Support Ticketing System

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://agilite.vercel.app)

**Live Demo:** [https://agilite.vercel.app](https://agilite.vercel.app)

A web application simulating a customer support ticketing system. Each ticket is linked to a product from the [Fake Store API](https://api.escuelajs.co/api/v1/products). Built with React + Vite, Node.js + Express, and PostgreSQL (Neon).

---

## Table of Contents

- [Pages](#pages)
- [Responsiveness & Mobile](#responsiveness--mobile)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Setup](#manual-setup)
- [Deployment (Vercel)](#deployment-vercel)
- [AI Usage](#ai-usage)

---

## Pages

### Landing Page

Entry point where users choose their mode before accessing the app.

- **Continue as Customer** — Navigates to Create Ticket; submit tickets and browse products
- **Continue as Admin** — Navigates to Tickets Dashboard; view and manage tickets, browse products
- Routes `/tickets/new` and `/tickets` require the corresponding mode; Products is available to both

### 1. Create Ticket Form (nav link shown in Customer Mode)

Customer-facing form to submit support tickets with product selection.

| Field | Type | Required |
|-------|------|----------|
| Email | text input | ✓ |
| Name | text input | ✓ |
| Product | modal selector (from API) | ✓ |
| Subject | text input | ✓ |
| Message | textarea | ✓ |

- Validates all fields before submission  
- Generates unique ticket ID on submit  
- Saves ticket with timestamp and `status='open'`  
- Success message and form clear after submit  

### 2. Tickets Dashboard (nav link shown in Admin Mode)

Admin view of all submitted tickets.

- Displays tickets in table/card layout  
- Shows: ticket ID, customer name, subject, product name, status, date  
- Click ticket → navigate to ticket details  
- Filter by status (open/closed)  

### 3. Ticket Details Page (Admin mode)

View a single ticket with product info and conversation.

**Display:**
- Ticket ID, status, date created  
- Customer name and email  
- Product name and image (from API)  
- Subject and full message  

**Actions:**
- Text field to write replies  
- Submit reply (saves to ticket)  
- Close ticket (status → `closed`)  
- Conversation thread showing all replies  

### 4. Products Page (nav link shown in Customer Mode AND Admin Mode)

Browse products from the Fake Store API.

- Grid layout with product cards  
- Shows: image, title, price, category  
- Responsive and mobile-friendly  

---

## Responsiveness & Mobile

The app is responsive and works on mobile, tablet, and desktop. Layouts adapt to different screen sizes:

- **Mobile** — Stacked layouts, touch-friendly targets, collapsible navigation
- **Tablet** — Flexible grids and cards
- **Desktop** — Full layouts with comfortable spacing

Forms, product cards, and the tickets dashboard reflow for smaller viewports, so you can submit tickets, browse products, and manage support from a phone or tablet.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| **Frontend** | React 19 + Vite |
| **Routing** | React Router v7 |
| **Styling** | CSS (custom) |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL (Neon serverless) |
| **Deployment** | Vercel (frontend + API routes) |

---

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** — [Neon](https://neon.tech) (recommended) or local

---

## Quick Start

```bash
npm install
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:3001  

---

## Manual Setup

### Database (Neon)

1. Create a free account at [console.neon.tech](https://console.neon.tech)  
2. Create a project (Postgres 16 or 17)  
3. Copy the connection string from **Connection details**  
4. Create `backend/.env`:
   ```env
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
   ```
5. Tables (`tickets`, `replies`) are created on first API call  

### Backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Full PostgreSQL connection string |
| `PORT` | API port (default: 3001) |

```bash
npm run dev        # Development
npm run build && npm start   # Production
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at http://localhost:5173 and proxies `/api/*` to the backend.

---

## Deployment (Vercel)

1. Push the repo to GitHub and import in [vercel.com](https://vercel.com)  
2. Add environment variable: `DATABASE_URL` (Neon connection string)  
3. Deploy. Vercel will:
   - Build the frontend from `frontend/`
   - Deploy API routes from `api/` as serverless functions
   - Serve both on the same origin

---

## AI Usage

This project used AI assistants (Cursor) for parts of the development. The following describes how AI was used and what was done independently.

### What AI Helped With

- Initial scaffolding and project structure
- Boilerplate for API routes, React components, and database setup
- Debugging, refactoring suggestions, and code cleanup
- Documentation and README drafts

### Manual Work & Independent Decisions

Work done or refined by me without AI recommendation, or where I chose a different approach:

- **Feature choices:** Landing page with Customer/Admin mode selection; UX and navigation flow decisions
- **Design:** Custom CSS styling, layout, and responsive behavior
- **Architecture:** Choice of Neon + Vercel, API structure, and data model
- **Validation & polish:** Form validation logic, error handling, and edge cases
- **Testing & deployment:** Running and verifying flows locally and in production

*Update this section with your specific contributions.*
