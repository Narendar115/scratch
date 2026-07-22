import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for Mini ERP + CRM Portal...');

  // 1. Create Demo Users for each Role
  const hashedPassword = await bcrypt.hash('password123', 10);

  const usersData = [
    { name: 'Alice Admin', email: 'admin@company.com', role: 'ADMIN' },
    { name: 'Sam Sales', email: 'sales@company.com', role: 'SALES' },
    { name: 'Wendy Warehouse', email: 'warehouse@company.com', role: 'WAREHOUSE' },
    { name: 'Alex Accounts', email: 'accounts@company.com', role: 'ACCOUNTS' }
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, name: u.name, password: hashedPassword },
      create: { ...u, password: hashedPassword }
    });
  }
  console.log('✅ Demo Users created (password: password123)');

  // 2. Create Sample Customers
  const customers = [
    {
      name: 'Rajesh Kumar',
      mobile: '+91 98765 43210',
      email: 'rajesh@apexdistributors.com',
      businessName: 'Apex Wholesale Distributors',
      gstNumber: '36AAACA123411Z5',
      customerType: 'DISTRIBUTOR',
      address: 'Plot 42, Industrial Area Phase II, Hyderabad, TS',
      status: 'ACTIVE',
      followUpDate: '2026-07-28',
      notes: 'Key distributor for Southern region. Prefers bulk monthly shipments.'
    },
    {
      name: 'Priya Sharma',
      mobile: '+91 98123 55678',
      email: 'priya@metroretail.in',
      businessName: 'Metro Retail Mart',
      gstNumber: '27ABBCB987612Z1',
      customerType: 'RETAILER',
      address: 'Shop 14, Commercial Complex, Mumbai, MH',
      status: 'ACTIVE',
      followUpDate: '2026-07-25',
      notes: 'Requested product catalog update and custom volume pricing.'
    },
    {
      name: 'Vikram Singh',
      mobile: '+91 97777 88899',
      email: 'vikram@globaltraders.org',
      businessName: 'Global Wholesale Agency',
      gstNumber: '07CCCCP432111Z9',
      customerType: 'WHOLESALER',
      address: 'Building 8, Connaught Place, New Delhi, DL',
      status: 'LEAD',
      followUpDate: '2026-07-30',
      notes: 'Initial contact established. Scheduling product demonstration.'
    }
  ];

  const createdCustomers = [];
  for (const c of customers) {
    const existing = await prisma.customer.findFirst({ where: { email: c.email } });
    if (!existing) {
      const created = await prisma.customer.create({
        data: {
          ...c,
          customerNotes: {
            create: {
              note: `System Initialized: Customer registered as ${c.customerType}`,
              createdBy: 'Alice Admin'
            }
          }
        }
      });
      createdCustomers.push(created);
    } else {
      createdCustomers.push(existing);
    }
  }
  console.log(`✅ ${createdCustomers.length} Customers ready`);

  // 3. Create Sample Products & Warehouse Inventory
  const products = [
    {
      sku: 'PRD-ELE-001',
      name: 'Industrial Smart Multimeter X200',
      category: 'Electronics',
      unitPrice: 3499.00,
      currentStock: 45,
      minStockLevel: 10,
      warehouseLocation: 'Aisle 3 - Shelf B4',
      description: 'High precision digital multimeter with Bluetooth logging.'
    },
    {
      sku: 'PRD-ELE-002',
      name: 'Heavy Duty Power Inverter 1500W',
      category: 'Electronics',
      unitPrice: 8999.00,
      currentStock: 4, // LOW STOCK TRIGGER!
      minStockLevel: 8,
      warehouseLocation: 'Aisle 1 - Shelf A2',
      description: 'Pure sine wave inverter with surge protection.'
    },
    {
      sku: 'PRD-HAR-010',
      name: 'Precision Steel Bolt Set M8 (Pack of 500)',
      category: 'Hardware',
      unitPrice: 1250.00,
      currentStock: 120,
      minStockLevel: 25,
      warehouseLocation: 'Aisle 5 - Bin 12',
      description: 'Grade 8.8 galvanized steel hex head bolts.'
    },
    {
      sku: 'PRD-SAF-005',
      name: 'Ergonomic Warehouse Safety Boots (Size 9)',
      category: 'Safety Gear',
      unitPrice: 2490.00,
      currentStock: 3, // LOW STOCK TRIGGER!
      minStockLevel: 10,
      warehouseLocation: 'Aisle 2 - Rack D1',
      description: 'Steel toe anti-skid chemical resistant safety shoes.'
    }
  ];

  const createdProducts = [];
  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          ...p,
          stockLogs: {
            create: {
              quantityChanged: p.currentStock,
              movementType: 'IN',
              reason: 'Initial Batch Warehouse Stocking',
              createdBy: 'Wendy Warehouse'
            }
          }
        }
      });
      createdProducts.push(created);
    } else {
      createdProducts.push(existing);
    }
  }
  console.log(`✅ ${createdProducts.length} Products & Inventory created`);

  // 4. Create Initial Sample Sales Challan & Invoice
  if (createdCustomers.length > 0 && createdProducts.length > 0) {
    const cust = createdCustomers[0];
    const prod1 = createdProducts[0];
    const prod3 = createdProducts[2];

    let existingChallan = await prisma.challan.findFirst({ where: { challanNumber: 'CH-2026-0001' } });
    if (!existingChallan) {
      existingChallan = await prisma.challan.create({
        data: {
          challanNumber: 'CH-2026-0001',
          customerId: cust.id,
          totalQuantity: 7,
          totalAmount: (prod1.unitPrice * 2) + (prod3.unitPrice * 5),
          status: 'CONFIRMED',
          createdBy: 'Sam Sales',
          confirmedAt: new Date(),
          items: {
            create: [
              {
                productId: prod1.id,
                productName: prod1.name,
                productSku: prod1.sku,
                unitPrice: prod1.unitPrice,
                quantity: 2,
                subtotal: prod1.unitPrice * 2
              },
              {
                productId: prod3.id,
                productName: prod3.name,
                productSku: prod3.sku,
                unitPrice: prod3.unitPrice,
                quantity: 5,
                subtotal: prod3.unitPrice * 5
              }
            ]
          }
        }
      });
      console.log('✅ Sample Confirmed Sales Challan CH-2026-0001 created');
    }

    if (existingChallan) {
      const existingInvoice = await prisma.invoice.findFirst({ where: { challanId: existingChallan.id } });
      if (!existingInvoice) {
        const subtotal = existingChallan.totalAmount;
        const tax = Math.round(subtotal * 0.18 * 100) / 100;
        await prisma.invoice.create({
          data: {
            invoiceNumber: 'INV-2026-0001',
            challanId: existingChallan.id,
            customerId: cust.id,
            totalAmount: subtotal,
            taxAmount: tax,
            grandTotal: subtotal + tax,
            status: 'UNPAID',
            dueDate: '2026-08-15',
            createdBy: 'Alex Accounts'
          }
        });
        console.log('✅ Sample Invoice INV-2026-0001 created');
      }
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
