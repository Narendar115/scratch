import React, { useEffect, useState } from 'react';
import { customerService } from '../services/customerService';
import { Customer, Pagination as PaginationType } from '../types';
import { TableSkeleton } from '../components/Skeleton';
import { Pagination } from '../components/Pagination';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Phone,
  Mail,
  Building,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    mobile: '',
    email: '',
    gstNumber: '',
    customerType: 'RETAILER' as 'RETAILER' | 'WHOLESALER' | 'DISTRIBUTOR',
    address: '',
    status: 'ACTIVE' as 'LEAD' | 'ACTIVE' | 'INACTIVE',
    followUpDate: '',
    notes: ''
  });

  // Note form state
  const [newNote, setNewNote] = useState('');
  const [newFollowUpDate, setNewFollowUpDate] = useState('');

  useEffect(() => {
    fetchCustomers(1);
  }, [search, statusFilter, typeFilter]);

  const fetchCustomers = async (page: number) => {
    try {
      setLoading(true);
      const res = await customerService.getCustomers({
        page,
        limit: 10,
        search,
        status: statusFilter,
        customerType: typeFilter
      });
      setCustomers(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setFormData({
      name: '',
      businessName: '',
      mobile: '',
      email: '',
      gstNumber: '',
      customerType: 'RETAILER',
      address: '',
      status: 'ACTIVE',
      followUpDate: '',
      notes: ''
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setSelectedCustomer(c);
    setFormData({
      name: c.name,
      businessName: c.businessName,
      mobile: c.mobile,
      email: c.email,
      gstNumber: c.gstNumber || '',
      customerType: c.customerType,
      address: c.address,
      status: c.status,
      followUpDate: c.followUpDate || '',
      notes: c.notes || ''
    });
    setIsCreateOpen(true);
  };

  const handleSubmitCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedCustomer) {
        await customerService.updateCustomer(selectedCustomer.id, formData);
        toast.success('Customer updated successfully');
      } else {
        await customerService.createCustomer(formData);
        toast.success('Customer created successfully');
      }
      setIsCreateOpen(false);
      fetchCustomers(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setSubmitting(true);
    try {
      await customerService.deleteCustomer(deleteTargetId);
      toast.success('Customer deleted');
      setIsDeleteOpen(false);
      fetchCustomers(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Cannot delete customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetail = async (c: Customer) => {
    try {
      const detailed = await customerService.getCustomerById(c.id);
      setDetailCustomer(detailed);
      setIsDetailOpen(true);
    } catch (err: any) {
      toast.error('Failed to load customer timeline');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailCustomer || !newNote.trim()) return;

    try {
      await customerService.addCustomerNote(detailCustomer.id, {
        note: newNote,
        followUpDate: newFollowUpDate || null
      });
      toast.success('Follow-up note added to timeline');
      setNewNote('');
      setNewFollowUpDate('');
      // Refresh detail timeline
      const updated = await customerService.getCustomerById(detailCustomer.id);
      setDetailCustomer(updated);
      fetchCustomers(pagination.page);
    } catch (err: any) {
      toast.error('Failed to add note');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Customer CRM Directory
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage corporate clients, distributor relationships & follow-up timelines
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, mobile or business name..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="">All Customer Types</option>
            <option value="RETAILER">Retailer</option>
            <option value="WHOLESALER">Wholesaler</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="LEAD">Prospect Lead</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No customer accounts found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4">Customer / Business</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Follow-up Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenDetail(c)}
                        className="font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left block"
                      >
                        {c.businessName}
                      </button>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {c.name} {c.gstNumber ? `• GST: ${c.gstNumber}` : ''}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{c.mobile}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{c.email}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={c.customerType === 'DISTRIBUTOR' ? 'purple' : c.customerType === 'WHOLESALER' ? 'info' : 'neutral'}>
                        {c.customerType}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={c.status === 'ACTIVE' ? 'success' : c.status === 'LEAD' ? 'warning' : 'danger'}>
                        {c.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {c.followUpDate ? (
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {c.followUpDate}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetail(c)}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
                          title="Timeline & Notes"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTargetId(c.id);
                            setIsDeleteOpen(true);
                          }}
                          className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={fetchCustomers} />
      </div>

      {/* Create / Edit Customer Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={selectedCustomer ? 'Edit Customer Account' : 'Create New Customer Account'}
      >
        <form onSubmit={handleSubmitCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                placeholder="e.g. Rajesh Kumar"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Business / Enterprise Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                placeholder="e.g. Apex Wholesale Distributors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                placeholder="sales@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                GST Number
              </label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                placeholder="36AAACA123411Z5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Customer Type
              </label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
              >
                <option value="RETAILER">Retailer</option>
                <option value="WHOLESALER">Wholesaler</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="LEAD">Prospect Lead</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Billing Address *
            </label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
              placeholder="Plot 42, Industrial Area Phase II..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Next Follow-up Date
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                placeholder="Special credit terms or bulk preferences"
              />
            </div>
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
              {submitting ? 'Saving...' : selectedCustomer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Detail & Follow-up Timeline Drawer/Modal */}
      {detailCustomer && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Timeline & CRM Notes - ${detailCustomer.businessName}`}
        >
          <div className="space-y-6">
            {/* Account Metadata Summary */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block font-semibold">Contact</span>
                <span className="font-bold text-gray-900 dark:text-white">{detailCustomer.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Type</span>
                <Badge variant="purple">{detailCustomer.customerType}</Badge>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Status</span>
                <Badge variant={detailCustomer.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {detailCustomer.status}
                </Badge>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Follow-up</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {detailCustomer.followUpDate || 'None'}
                </span>
              </div>
            </div>

            {/* Add New Followup Note Form */}
            <form onSubmit={handleAddNote} className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-3">
              <h4 className="text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300">
                + Add Follow-up Note
              </h4>
              <textarea
                required
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log discussion notes, order commitments, or call summaries..."
                className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs dark:text-white"
              />
              <div className="flex items-center justify-between gap-3">
                <input
                  type="date"
                  value={newFollowUpDate}
                  onChange={(e) => setNewFollowUpDate(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow hover:bg-indigo-700"
                >
                  Post Note & Update Timeline
                </button>
              </div>
            </form>

            {/* Timeline Logs */}
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
                Activity & Communication History
              </h4>
              {!detailCustomer.customerNotes || detailCustomer.customerNotes.length === 0 ? (
                <p className="text-xs text-gray-400">No notes recorded yet.</p>
              ) : (
                <div className="relative border-l-2 border-indigo-200 dark:border-indigo-900 ml-3 space-y-4 pl-4">
                  {detailCustomer.customerNotes.map((n) => (
                    <div key={n.id} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white dark:border-gray-900" />
                      <div className="bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60">
                        <p className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                          {n.note}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2">
                          <span>By: {n.createdBy}</span>
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer Account"
        message="Are you sure you want to delete this customer account? Customers with existing sales challans cannot be deleted."
        confirmText="Delete Account"
        isLoading={submitting}
      />
    </div>
  );
};
