import React, { useEffect, useState } from 'react';
import { challanService } from '../services/challanService';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { Challan, Customer, Product, Pagination as PaginationType } from '../types';
import { TableSkeleton } from '../components/Skeleton';
import { Pagination } from '../components/Pagination';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  FileText,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  Trash,
  User,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';

export const ChallansPage: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Dropdown reference data
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailChallan, setDetailChallan] = useState<Challan | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: '', quantity: 1 }
  ]);

  useEffect(() => {
    fetchChallans(1);
    loadDropdownData();
  }, [search, statusFilter]);

  const loadDropdownData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        customerService.getCustomers({ limit: 100 }),
        productService.getProducts({ limit: 100 })
      ]);
      setCustomersList(custRes.data);
      setProductsList(prodRes.data);
    } catch (err) {
      console.error('Failed to load reference dropdowns');
    }
  };

  const fetchChallans = async (page: number) => {
    try {
      setLoading(true);
      const res = await challanService.getChallans({
        page,
        limit: 10,
        search,
        status: statusFilter
      });
      setChallans(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      toast.error('Failed to load sales challans');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedCustomerId(customersList[0]?.id || '');
    setItems([{ productId: productsList[0]?.id || '', quantity: 1 }]);
    setIsCreateOpen(true);
  };

  const handleAddItemRow = () => {
    setItems([...items, { productId: productsList[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Calculate live total for modal creation
  const calculatedGrandTotal = items.reduce((acc, item) => {
    const prod = productsList.find((p) => p.id === item.productId);
    return acc + (prod ? prod.unitPrice * item.quantity : 0);
  }, 0);

  const handleSubmitChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error('Please select a customer');
      return;
    }
    setSubmitting(true);
    try {
      await challanService.createChallan({
        customerId: selectedCustomerId,
        items
      });
      toast.success('Sales Challan Draft created');
      setIsCreateOpen(false);
      fetchChallans(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create sales challan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmTargetId) return;
    setSubmitting(true);
    try {
      await challanService.updateChallanStatus(confirmTargetId, 'CONFIRMED');
      toast.success('Challan CONFIRMED! Warehouse inventory stock reduced.');
      setIsConfirmOpen(false);
      fetchChallans(pagination.page);
    } catch (err: any) {
      // Handles negative stock prevention or insufficient stock validation error from server!
      toast.error(err.response?.data?.error || 'Failed to confirm challan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetail = async (id: string) => {
    try {
      const c = await challanService.getChallanById(id);
      setDetailChallan(c);
      setIsDetailOpen(true);
    } catch (err) {
      toast.error('Failed to load challan details');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Sales Delivery Challans
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Dispatch voucher workflow, product price snapshots & stock reduction rules
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Sales Challan</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by challan number or customer name..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
        >
          <option value="">All Challan Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed (Dispatched)</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : challans.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No sales delivery challans found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4">Challan #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items Qty</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                {challans.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenDetail(c.id)}
                        className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline block"
                      >
                        {c.challanNumber}
                      </button>
                      <span className="text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 dark:text-white block">
                        {c.customer?.businessName}
                      </span>
                      <span className="text-xs text-gray-500">{c.customer?.name}</span>
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">
                      {c.totalQuantity} units ({c.items?.length || 0} items)
                    </td>

                    <td className="px-6 py-4 font-extrabold text-gray-900 dark:text-white">
                      ₹{c.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          c.status === 'CONFIRMED'
                            ? 'success'
                            : c.status === 'DRAFT'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {c.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetail(c.id)}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {c.status === 'DRAFT' && (
                          <button
                            onClick={() => {
                              setConfirmTargetId(c.id);
                              setIsConfirmOpen(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Confirm & Deduct Stock</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={fetchChallans} />
      </div>

      {/* Create Sales Challan Wizard Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Sales Delivery Challan"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitChallan} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Select Customer Account *
            </label>
            <select
              required
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium dark:text-white"
            >
              {customersList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.name}) - GST: {c.gstNumber || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase text-gray-500">
                Products Line Items *
              </label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + Add Another Product
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const selectedProd = productsList.find((p) => p.id === item.productId);
                const subtotal = selectedProd ? selectedProd.unitPrice * item.quantity : 0;

                return (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-3"
                  >
                    <div className="flex-1 w-full">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs dark:text-white"
                      >
                        {productsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (SKU: {p.sku}) — Stock: {p.currentStock} — ₹{p.unitPrice}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-28">
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', Math.max(1, Number(e.target.value)))
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs dark:text-white"
                        placeholder="Qty"
                      />
                    </div>

                    <div className="w-full sm:w-32 text-right font-extrabold text-sm text-gray-900 dark:text-white">
                      ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(index)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 flex justify-between items-center">
            <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
              Estimated Total Amount:
            </span>
            <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              ₹{calculatedGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Save as DRAFT Challan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Challan Detail View Modal */}
      {detailChallan && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Sales Delivery Challan #${detailChallan.challanNumber}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">
                  {detailChallan.customer?.businessName}
                </h4>
                <p className="text-xs text-gray-500">
                  {detailChallan.customer?.address}
                </p>
              </div>
              <Badge variant={detailChallan.status === 'CONFIRMED' ? 'success' : 'warning'}>
                {detailChallan.status}
              </Badge>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">
                Item Product Snapshots
              </h4>
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold">
                    <tr>
                      <th className="p-3">Product Name (SKU)</th>
                      <th className="p-3">Price Snapshot</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {detailChallan.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3 font-semibold text-gray-900 dark:text-white">
                          {item.productName} ({item.productSku})
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-300">
                          ₹{item.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 font-bold">{item.quantity}</td>
                        <td className="p-3 text-right font-extrabold">
                          ₹{item.subtotal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-500">
                Created by {detailChallan.createdBy} on {new Date(detailChallan.createdAt).toLocaleDateString()}
              </span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                Total: ₹{detailChallan.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title="Confirm Sales Challan Dispatch"
        message="Confirming this sales challan will automatically reduce the corresponding product stocks from the warehouse inventory and record an audit log. If inventory is insufficient, confirmation will be rejected."
        confirmText="Confirm & Reduce Stock"
        variant="info"
        isLoading={submitting}
      />
    </div>
  );
};
