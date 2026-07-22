import { Router } from 'express';
import { login, logout, getMe } from '../controllers/authController';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addCustomerNote
} from '../controllers/customerController';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getStockLogs
} from '../controllers/productController';
import {
  getChallans,
  getChallanById,
  createChallan,
  updateChallanStatus
} from '../controllers/challanController';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus
} from '../controllers/invoiceController';
import { getDashboardStats } from '../controllers/statsController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  loginSchema,
  customerSchema,
  customerNoteSchema,
  productSchema,
  stockAdjustmentSchema,
  challanSchema,
  challanStatusSchema,
  createInvoiceSchema,
  invoiceStatusSchema
} from '../validators/schemas';

const router = Router();

// ==================== AUTHENTICATION ====================
router.post('/auth/login', validateRequest(loginSchema), login);
router.post('/auth/logout', logout);
router.get('/auth/me', authenticateToken, getMe);

// ==================== DASHBOARD ====================
router.get('/dashboard', authenticateToken, getDashboardStats);
router.get('/stats', authenticateToken, getDashboardStats);

// ==================== CUSTOMER CRM ====================
router.get('/customers', authenticateToken, getCustomers);
router.get('/customers/:id', authenticateToken, getCustomerById);
router.post('/customers', authenticateToken, requireRole(['ADMIN', 'SALES']), validateRequest(customerSchema), createCustomer);
router.put('/customers/:id', authenticateToken, requireRole(['ADMIN', 'SALES']), validateRequest(customerSchema.partial()), updateCustomer);
router.delete('/customers/:id', authenticateToken, requireRole(['ADMIN']), deleteCustomer);
router.post('/customers/:id/notes', authenticateToken, requireRole(['ADMIN', 'SALES', 'ACCOUNTS']), validateRequest(customerNoteSchema), addCustomerNote);

// ==================== PRODUCT INVENTORY ====================
router.get('/products', authenticateToken, getProducts);
router.get('/products/:id', authenticateToken, getProductById);
router.post('/products', authenticateToken, requireRole(['ADMIN', 'WAREHOUSE']), validateRequest(productSchema), createProduct);
router.put('/products/:id', authenticateToken, requireRole(['ADMIN', 'WAREHOUSE']), validateRequest(productSchema.partial()), updateProduct);
router.delete('/products/:id', authenticateToken, requireRole(['ADMIN']), deleteProduct);
router.post('/products/:id/adjust-stock', authenticateToken, requireRole(['ADMIN', 'WAREHOUSE']), validateRequest(stockAdjustmentSchema), adjustStock);
router.get('/inventory/movement', authenticateToken, getStockLogs);

// ==================== SALES CHALLAN ====================
router.get('/challans', authenticateToken, getChallans);
router.get('/challans/:id', authenticateToken, getChallanById);
router.post('/challans', authenticateToken, requireRole(['ADMIN', 'SALES']), validateRequest(challanSchema), createChallan);
router.put('/challans/:id/status', authenticateToken, requireRole(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), validateRequest(challanStatusSchema), updateChallanStatus);

// ==================== ACCOUNTS / INVOICES ====================
router.get('/invoices', authenticateToken, getInvoices);
router.get('/invoices/:id', authenticateToken, getInvoiceById);
router.post('/invoices', authenticateToken, requireRole(['ADMIN', 'ACCOUNTS']), validateRequest(createInvoiceSchema), createInvoice);
router.put('/invoices/:id/status', authenticateToken, requireRole(['ADMIN', 'ACCOUNTS']), validateRequest(invoiceStatusSchema), updateInvoiceStatus);

export default router;
