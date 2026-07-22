import React, { useEffect, useState } from 'react';
import { invoiceService } from '../services/invoiceService';
import { challanService } from '../services/challanService';
import { Invoice, Challan, Pagination as PaginationType } from '../types';
import { TableSkeleton } from '../components/Skeleton';
import { Pagination } from '../components/Pagination';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  CreditCard,
  Search,
  Plus,
  Printer,
  Download,
  FileCheck,
  CheckCircle2,
  Calendar,
  Building,
  Mail,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Confirmed challans available to create invoice
  const [confirmedChallans, setConfirmedChallans] = useState<Challan[]>([]);

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedChallanId, setSelectedChallanId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInvoices(1);
    loadConfirmedChallans();
  }, [search, statusFilter]);

  const loadConfirmedChallans = async () => {
    try {
      const res = await challanService.getChallans({ status: 'CONFIRMED', limit: 100 });
      // Only keep challans that don't already have an invoice
      const available = res.data.filter((c) => !c.invoice);
      setConfirmedChallans(available);
      if (available.length > 0) setSelectedChallanId(available[0].id);
    } catch (err) {
      console.error('Failed to load confirmed challans');
    }
  };

  const fetchInvoices = async (page: number) => {
    try {
      setLoading(true);
      const res = await invoiceService.getInvoices({
        page,
        limit: 10,
        search,
        status: statusFilter
      });
      setInvoices(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallanId) {
      toast.error('Please select a confirmed sales challan');
      return;
    }
    setSubmitting(true);
    try {
      await invoiceService.createInvoice({
        challanId: selectedChallanId,
        dueDate: dueDate || null
      });
      toast.success('Invoice generated successfully!');
      setIsGenerateOpen(false);
      fetchInvoices(pagination.page);
      loadConfirmedChallans();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await invoiceService.updateInvoiceStatus(id, 'PAID');
      toast.success('Invoice status updated to PAID!');
      fetchInvoices(pagination.page);
    } catch (err: any) {
      toast.error('Failed to update invoice status');
    }
  };

  const handleOpenPreview = async (id: string) => {
    try {
      const inv = await invoiceService.getInvoiceById(id);
      setDetailInvoice(inv);
      setIsDetailOpen(true);
    } catch (err) {
      toast.error('Failed to load invoice preview');
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Accounts & Billing Invoices
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            GST Tax invoice generation, payment status tracking & PDF export
          </p>
        </div>
        <button
          onClick={() => {
            loadConfirmedChallans();
            setIsGenerateOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Invoice</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number or customer business name..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
        >
          <option value="">All Invoice Statuses</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No accounts invoices generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Challan Ref</th>
                  <th className="px-6 py-4">GST Tax (18%)</th>
                  <th className="px-6 py-4">Grand Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenPreview(inv.id)}
                        className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline block"
                      >
                        {inv.invoiceNumber}
                      </button>
                      <span className="text-xs text-gray-400">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 dark:text-white block">
                        {inv.customer?.businessName}
                      </span>
                      <span className="text-xs text-gray-500">{inv.customer?.name}</span>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {inv.challan?.challanNumber || 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      ₹{inv.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4 font-extrabold text-gray-900 dark:text-white">
                      ₹{inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          inv.status === 'PAID'
                            ? 'success'
                            : inv.status === 'UNPAID'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {inv.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status === 'UNPAID' && (
                          <button
                            onClick={() => handleMarkAsPaid(inv.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Paid</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenPreview(inv.id)}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
                          title="Preview & Export PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={fetchInvoices} />
      </div>

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Invoice from Confirmed Sales Challan"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          {confirmedChallans.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              No confirmed sales challans available awaiting invoice generation.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                  Select Confirmed Sales Challan *
                </label>
                <select
                  required
                  value={selectedChallanId}
                  onChange={(e) => setSelectedChallanId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium dark:text-white"
                >
                  {confirmedChallans.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.challanNumber} — {c.customer?.businessName} — Total: ₹{c.totalAmount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                />
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200">
                💡 Standard 18% GST Tax will be automatically computed and added to the grand total invoice invoice.
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsGenerateOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Generating...' : 'Generate Invoice'}
                </button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* Invoice Detail / Printable PDF Export Preview Modal */}
      {detailInvoice && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`TAX INVOICE - ${detailInvoice.invoiceNumber}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="text-xl font-extrabold text-indigo-600">Enterprise Wholesale Corp</h3>
                <p className="text-xs text-gray-500">Official Commercial Tax Invoice</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Billed To (Customer):
                </span>
                <p className="font-extrabold text-sm text-gray-900 dark:text-white">
                  {detailInvoice.customer?.businessName}
                </p>
                <p className="text-gray-600 dark:text-gray-300">Attn: {detailInvoice.customer?.name}</p>
                <p className="text-gray-600 dark:text-gray-300">{detailInvoice.customer?.address}</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
                  GSTIN: {detailInvoice.customer?.gstNumber || 'URP'}
                </p>
              </div>

              <div className="text-right space-y-1">
                <p>
                  <span className="text-gray-400 font-semibold">Invoice Date:</span>{' '}
                  {new Date(detailInvoice.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <span className="text-gray-400 font-semibold">Challan Ref:</span>{' '}
                  {detailInvoice.challan?.challanNumber}
                </p>
                <p>
                  <span className="text-gray-400 font-semibold">Due Date:</span>{' '}
                  {detailInvoice.dueDate || 'Immediate'}
                </p>
                <div className="mt-2 inline-block">
                  <Badge variant={detailInvoice.status === 'PAID' ? 'success' : 'warning'}>
                    Status: {detailInvoice.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {detailInvoice.challan?.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3 font-semibold text-gray-900 dark:text-white">
                        {item.productName} ({item.productSku})
                      </td>
                      <td className="p-3">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="p-3 font-bold">{item.quantity}</td>
                      <td className="p-3 text-right font-extrabold">
                        ₹{item.subtotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal Amount:</span>
                  <span>₹{detailInvoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>GST Tax (18%):</span>
                  <span>₹{detailInvoice.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-800 font-extrabold text-sm text-gray-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span>₹{detailInvoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
