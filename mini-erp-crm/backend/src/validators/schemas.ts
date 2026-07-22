import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  mobile: z.string().min(5, 'Mobile number is required'),
  email: z.string().email('Invalid email address'),
  businessName: z.string().min(2, 'Business name is required'),
  gstNumber: z.string().optional().nullable(),
  customerType: z.enum(['RETAILER', 'WHOLESALER', 'DISTRIBUTOR']),
  address: z.string().min(5, 'Address is required'),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('ACTIVE'),
  followUpDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const customerNoteSchema = z.object({
  note: z.string().min(1, 'Note content is required'),
  followUpDate: z.string().optional().nullable()
});

export const productSchema = z.object({
  sku: z.string().min(2, 'SKU is required'),
  name: z.string().min(2, 'Product name is required'),
  category: z.string().min(2, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be positive'),
  currentStock: z.number().int().nonnegative('Stock cannot be negative'),
  minStockLevel: z.number().int().nonnegative('Min stock level cannot be negative'),
  warehouseLocation: z.string().min(2, 'Warehouse location is required'),
  description: z.string().optional().nullable()
});

export const stockAdjustmentSchema = z.object({
  quantityChanged: z.number().int().refine((val: number) => val !== 0, 'Quantity change cannot be zero'),
  movementType: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  reason: z.string().min(3, 'Reason for adjustment is required')
});

export const challanItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1')
});

export const challanSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  items: z.array(challanItemSchema).min(1, 'At least one product item is required')
});

export const challanStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED'])
});

export const createInvoiceSchema = z.object({
  challanId: z.string().min(1, 'Challan ID is required'),
  taxAmount: z.number().nonnegative().optional().default(0),
  dueDate: z.string().optional().nullable()
});

export const invoiceStatusSchema = z.object({
  status: z.enum(['PAID', 'UNPAID', 'OVERDUE', 'CANCELLED'])
});
