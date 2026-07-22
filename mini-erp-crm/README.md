# Full Stack Mini ERP + CRM Operations Portal

A production-ready Enterprise Resource Planning (ERP) & Customer Relationship Management (CRM) Operations Portal built for wholesale and distribution enterprises. Designed with **Clean Architecture**, full **TypeScript** type safety, **Role-Based Access Control (RBAC)**, transaction-safe inventory dispatching, and executive business analytics.

---

## 🌟 Key Features & Business Rules

### 🔐 Authentication & Role-Based Access Control (RBAC)
- **JWT Authentication** with token storage and session state handling.
- **Roles Matrix**:
  - `ADMIN`: Full access across all modules, user configuration, customer CRUD, inventory adjustments, sales challans, and accounts.
  - `SALES`: Customer CRM, follow-up timeline logs, creation of Draft Sales Challans, and sales performance dashboard.
  - `WAREHOUSE`: Product inventory catalog management, stock movement audit logs, manual stock adjustments, and challan confirmation dispatching.
  - `ACCOUNTS`: Commercial GST tax invoice generation, payment status updates (Unpaid ➔ Paid), invoice history, and PDF export.

### 🏢 Customer CRM Module
- Complete client account management (Retailers, Wholesalers, Distributors).
- Live search by business name, contact person, mobile, or email.
- Real-time status filtering (`ACTIVE`, `LEAD`, `INACTIVE`).
- **Follow-up Timeline & Notes Engine**: Log call summaries, order commitments, and update follow-up agenda dates.

### 📦 Inventory & Stock Movement Audit
- Complete SKU, product name, category, unit price, and physical warehouse bin location mapping.
- **Stock Alerts**: Real-time visual highlight for products below configured minimum stock threshold levels.
- **Stock Movement Log**: Immutable audit trail logging every stock `IN`, `OUT`, and `ADJUSTMENT` with operator identity and audit justification.

### 📜 Sales Delivery Challans (Dispatch Rules Engine)
- Dynamic multi-item delivery challan generation with auto-numbered identifiers (`CH-YYYYMM-XXXX`).
- **Product Price & Name Snapshotting**: Stores immutable product price and name snapshots at the moment of challan creation.
- **Status Lifecycle**: `DRAFT` ➔ `CONFIRMED` ➔ `CANCELLED`.
- **Transaction-Safe Stock Reduction**:
  - When confirmed, backend runs an **atomic Prisma Database Transaction**.
  - Validates stock levels for all items.
  - **Prevents Negative Stock**: Rejects confirmation with validation error if required quantity exceeds current stock.
  - Automatically records stock movement logs (`OUT`) upon confirmation.

### 💳 Accounts & Commercial Invoices (PDF Export)
- Auto-generate Commercial GST Tax Invoices from Confirmed Sales Challans (`INV-YYYYMM-XXXX`).
- Automatic 18% GST tax calculation and grand total computation.
- **High-Fidelity Printable PDF Export**: Instant printable preview modal with print-to-PDF support.

### 📊 Executive Dashboard Analytics
- Real-time KPI summary cards: Total Customers, Prospect Leads, Product Catalog, Low Stock Alerts, Confirmed Challans, Total Invoiced Revenue, Paid Revenue, and Followups Due Today.
- **Interactive Recharts**:
  - Category Stock Distribution Bar Chart.
  - Revenue Realization Ratio Donut Chart.
- Critical Low Stock Alert list & Scheduled Follow-up Reminders agenda.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, TypeScript, Express.js, Prisma ORM, SQLite / PostgreSQL, JWT, Bcrypt, Zod, Morgan, Helmet, CORS, Express Rate Limit.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, Lucide React, Recharts, Sonner Toasts, Axios, React Router v6.

---

## 🚀 Quick Start Guide (Local Development)

### 1. Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### 2. Backend Setup
```bash
cd backend
npm install

# Run database migration & seed sample demo dataset
npm run prisma:generate
npx prisma db push --force-reset
npm run seed

# Start development server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

## 🔑 Demo Login Credentials

You can click any quick-login button on the login screen or enter these credentials:

| Role | Email | Password | Allowed Operations |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `password123` | Full System Access Across All Modules |
| **Sales** | `sales@company.com` | `password123` | Customer CRM, Followup Notes, Challan Creation |
| **Warehouse** | `warehouse@company.com` | `password123` | Inventory Catalog, Stock Adjustments, Challan Confirmation |
| **Accounts** | `accounts@company.com` | `password123` | Invoice Generation, Payment Collection, PDF Export |

---

## 🐳 Docker Container Deployment

To launch the complete production stack (PostgreSQL + Backend API + Nginx Frontend) with one command:

```bash
docker-compose up --build -d
```

Services exposed:
- **Frontend Web Portal**: http://localhost
- **Backend REST API**: http://localhost:5000/api
- **PostgreSQL Database**: localhost:5432

---

## 📡 REST API Reference Summary

| Method | Endpoint | Description | Guard |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | User Authentication & JWT Generation | Public |
| `GET` | `/api/auth/me` | Fetch Current User Profile | Auth |
| `GET` | `/api/dashboard` | Aggregated Dashboard KPIs & Chart Data | Auth |
| `GET` | `/api/customers` | Get Customers (Search, Filter, Paginated) | Auth |
| `POST` | `/api/customers` | Create Customer Account | Admin, Sales |
| `POST` | `/api/customers/:id/notes` | Add Customer Follow-up Note | Admin, Sales, Accounts |
| `GET` | `/api/products` | Get Product Catalog (Low stock filter) | Auth |
| `POST` | `/api/products/:id/adjust-stock`| Manual Inventory Adjustment | Admin, Warehouse |
| `GET` | `/api/inventory/movement` | Stock Movement Audit Log History | Auth |
| `GET` | `/api/challans` | Get Sales Delivery Challans | Auth |
| `POST` | `/api/challans` | Create Draft Sales Challan | Admin, Sales |
| `PUT` | `/api/challans/:id/status` | Update Status (CONFIRMED stock reduction) | Admin, Warehouse, Sales |
| `GET` | `/api/invoices` | Get Commercial Accounts Invoices | Auth |
| `POST` | `/api/invoices` | Generate Invoice from Confirmed Challan | Admin, Accounts |

---

## 📄 License & Author

Developed for Enterprise Operations Management. Production-Ready Clean Architecture.
