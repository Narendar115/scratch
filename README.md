# Mini ERP + CRM Operations Portal

A production-ready **Full Stack ERP + CRM Operations Portal** developed as part of a Full Stack Developer Case Study. This application is designed for wholesale and distribution businesses to efficiently manage customers, inventory, sales challans, and internal operations through a secure, role-based web application.

---

## 📌 Features

### 🔐 Authentication & Authorization
- JWT-based Authentication
- Role-Based Access Control (RBAC)
- Secure Password Hashing using bcrypt
- Protected Routes
- Supported Roles:
  - Admin
  - Sales
  - Warehouse
  - Accounts

---

### 👥 Customer CRM Module

- Add Customer
- Edit Customer
- Delete Customer
- View Customer Details
- Customer Search
- Pagination & Filters
- Customer Status
  - Lead
  - Active
  - Inactive
- Follow-up Scheduling
- Follow-up Notes

---

### 📦 Product & Inventory Module

- Product Management
- SKU-based Inventory
- Warehouse Location
- Current Stock Management
- Minimum Stock Alert
- Product Categories
- Inventory Search
- Stock Movement History
- IN / OUT Stock Tracking

---

### 📄 Sales Challan Module

- Auto Generated Challan Number
- Multiple Products in Single Challan
- Draft / Confirmed / Cancelled Status
- Automatic Stock Deduction
- Product Snapshot Storage
- Prevent Negative Inventory
- Challan History

---

### 📊 Dashboard

- Total Customers
- Active Leads
- Total Products
- Low Stock Products
- Sales Summary
- Revenue Overview
- Recent Activities

---

## 🛠 Tech Stack

### Frontend

- React.js
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Zustand
- React Hook Form
- Zod

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT Authentication
- bcrypt
- Zod Validation

### Database

- PostgreSQL

### Tools

- Git
- GitHub
- Postman
- Docker (Optional)

---

# 📂 Project Structure

```
mini-erp-crm-portal
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── prisma
│   ├── routes
│   ├── services
│   ├── validators
│   ├── config
│   ├── utils
│   ├── package.json
│   └── tsconfig.json
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── layouts
│   │   ├── hooks
│   │   ├── services
│   │   ├── store
│   │   ├── utils
│   │   └── assets
│   ├── package.json
│   └── vite.config.ts
│
├── README.md
└── docker-compose.yml (Optional)
```

---

# 🗄 Database Schema

The application uses PostgreSQL with Prisma ORM.

### Main Tables

- Users
- Customers
- Products
- StockMovements
- Challans
- ChallanItems
- FollowUps
- Invoices

---

# ⚙️ Prerequisites

Make sure the following software is installed.

- Node.js (v18 or above)
- npm
- PostgreSQL
- Git

---

# 🔑 Environment Variables

## Backend (.env)

```env
PORT=5000

DATABASE_URL=postgresql://username:password@localhost:5432/erpcrm

JWT_SECRET=your_secret_key

JWT_EXPIRES_IN=7d
```

---

## Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 🚀 Installation & Local Setup

## 1. Clone Repository

```bash
git clone https://github.com/your-username/mini-erp-crm-portal.git
```

```bash
cd mini-erp-crm-portal
```

---

## 2. Backend Setup

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create the `.env` file.

Run Prisma migration

```bash
npx prisma migrate dev
```

(Optional)

Seed database

```bash
npx prisma db seed
```

Run backend

```bash
npm run dev
```

Backend runs at

```
http://localhost:5000
```

---

## 3. Frontend Setup

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Create the `.env` file.

Run application

```bash
npm run dev
```

Frontend runs at

```
http://localhost:5173
```

---

# 🔗 REST API Endpoints

## Authentication

```
POST /api/auth/login
POST /api/auth/logout
```

---

## Customers

```
GET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id
```

---

## Products

```
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

---

## Sales Challans

```
GET    /api/challans
POST   /api/challans
PUT    /api/challans/:id
DELETE /api/challans/:id
```

---

## Dashboard

```
GET /api/dashboard
```

---

# 👤 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Sales | sales@example.com | sales123 |
| Warehouse | warehouse@example.com | warehouse123 |
| Accounts | accounts@example.com | accounts123 |

> Replace the above credentials with your own seeded users if different.

---

# 🌐 Deployment

## Frontend

Recommended Platforms

- Vercel
- Netlify
- Render Static Site

Build Command

```bash
npm run build
```

---

## Backend

Recommended Platforms

- Render
- Railway
- Fly.io

Build Command

```bash
npm install
```

Start Command

```bash
npm start
```

---

## Database

Recommended Providers

- Neon PostgreSQL
- Supabase PostgreSQL
- Render PostgreSQL

Update the production `DATABASE_URL` in your deployment platform before deploying.

---

# 📮 API Testing

Use the included Postman Collection to test all API endpoints.

Modules Covered

- Authentication
- Customers
- Products
- Inventory
- Sales Challans
- Dashboard

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing (bcrypt)
- Role-Based Access Control
- Input Validation using Zod
- Centralized Error Handling
- Environment Variable Management
- Secure REST APIs

---

# 🚀 Future Enhancements

- PDF Invoice Generation
- Email Notifications
- Product Image Upload
- Docker Deployment
- GitHub Actions CI/CD
- Audit Logs
- Advanced Analytics Dashboard

---

# 📄 Assumptions

- Single organization deployment.
- Single warehouse support.
- PostgreSQL is used as the primary database.
- JWT is used for authentication.
- Only authenticated users can access protected resources.

---

# 👨‍💻 Author

**Narendar Kethavath**

Developed as part of the **Full Stack Developer Case Study** to demonstrate expertise in:

- Full Stack Web Development
- REST API Design
- Database Modeling
- Authentication & Authorization
- Responsive UI Development
- Backend Architecture
- Deployment & Documentation

---

## ⭐ If you found this project useful, consider giving it a star on GitHub!
