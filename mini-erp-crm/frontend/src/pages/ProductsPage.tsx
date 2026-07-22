import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { Product, Pagination as PaginationType } from '../types';
import { TableSkeleton } from '../components/Skeleton';
import { Pagination } from '../components/Pagination';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'low_stock' | 'normal' | ''>('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Product Form state
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minStockLevel: 5,
    warehouseLocation: '',
    description: ''
  });

  // Adjust Stock Form state
  const [adjustData, setAdjustData] = useState({
    quantityChanged: 1,
    movementType: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    reason: ''
  });

  useEffect(() => {
    fetchProducts(1);
  }, [search, categoryFilter, stockStatusFilter]);

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      const res = await productService.getProducts({
        page,
        limit: 10,
        search,
        category: categoryFilter,
        stockStatus: stockStatusFilter || undefined
      });
      setProducts(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setFormData({
      sku: `PRD-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Electronics',
      unitPrice: 1000,
      currentStock: 10,
      minStockLevel: 5,
      warehouseLocation: 'Aisle 1 - Shelf A1',
      description: ''
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setSelectedProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      category: p.category,
      unitPrice: p.unitPrice,
      currentStock: p.currentStock,
      minStockLevel: p.minStockLevel,
      warehouseLocation: p.warehouseLocation,
      description: p.description || ''
    });
    setIsCreateOpen(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, formData);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(formData);
        toast.success('Product added to inventory');
      }
      setIsCreateOpen(false);
      fetchProducts(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAdjust = (p: Product) => {
    setAdjustTarget(p);
    setAdjustData({
      quantityChanged: 5,
      movementType: 'IN',
      reason: 'Warehouse Batch Stock Adjustment'
    });
    setIsAdjustOpen(true);
  };

  const handleSubmitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;
    setSubmitting(true);
    try {
      await productService.adjustStock(adjustTarget.id, adjustData);
      toast.success(`Stock adjusted for '${adjustTarget.name}'`);
      setIsAdjustOpen(false);
      fetchProducts(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Stock adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setSubmitting(true);
    try {
      await productService.deleteProduct(deleteTargetId);
      toast.success('Product removed from inventory');
      setIsDeleteOpen(false);
      fetchProducts(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Cannot delete product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Package className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Inventory & Product Catalog
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Warehouse location mapping, stock levels, minimum stock alerts & auditing
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
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
            placeholder="Search by SKU, product name or warehouse bin location..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="">All Stock Levels</option>
            <option value="low_stock">⚠️ Low Stock Alerts</option>
            <option value="normal">Normal Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No product items found in catalog.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4">SKU / Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Unit Price</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4">Warehouse Location</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                {products.map((p) => {
                  const isLow = p.currentStock <= p.minStockLevel;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 dark:text-white block">
                          {p.name}
                        </span>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          {p.sku}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant="purple">{p.category}</Badge>
                      </td>

                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        ₹{p.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-extrabold ${
                              isLow ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {p.currentStock} units
                          </span>
                          {isLow && (
                            <Badge variant="danger" size="sm">
                              Low Stock (Min {p.minStockLevel})
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{p.warehouseLocation}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenAdjust(p)}
                            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
                            title="Adjust Inventory Stock"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            title="Edit Product Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTargetId(p.id);
                              setIsDeleteOpen(true);
                            }}
                            className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={fetchProducts} />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={selectedProduct ? 'Edit Product Item' : 'Add New Inventory Product'}
      >
        <form onSubmit={handleSubmitProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Stock Keeping Unit (SKU) *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono dark:text-white"
                placeholder="PRD-ELE-001"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                placeholder="Industrial Multimeter X200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                placeholder="Electronics"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Unit Selling Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Warehouse Location *
              </label>
              <input
                type="text"
                required
                value={formData.warehouseLocation}
                onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                placeholder="Aisle 3 - Bin 12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Initial Stock Quantity *
              </label>
              <input
                type="number"
                required
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Minimum Stock Alert Level *
              </label>
              <input
                type="number"
                required
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
              placeholder="Technical specifications, warranty details..."
            />
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
              {submitting ? 'Saving...' : selectedProduct ? 'Update Product' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      {adjustTarget && (
        <Modal
          isOpen={isAdjustOpen}
          onClose={() => setIsAdjustOpen(false)}
          title={`Adjust Inventory - ${adjustTarget.name}`}
        >
          <form onSubmit={handleSubmitAdjust} className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between text-xs font-semibold">
              <span>Current Stock: {adjustTarget.currentStock} units</span>
              <span>Location: {adjustTarget.warehouseLocation}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Movement Direction
              </label>
              <select
                value={adjustData.movementType}
                onChange={(e) => setAdjustData({ ...adjustData, movementType: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
              >
                <option value="IN">Stock IN (+ Receive New Batch)</option>
                <option value="OUT">Stock OUT (- Manual Dispatch / Damage)</option>
                <option value="ADJUSTMENT">Stock ADJUSTMENT (Audit Correction)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Quantity Units *
              </label>
              <input
                type="number"
                required
                min="1"
                value={adjustData.quantityChanged}
                onChange={(e) => setAdjustData({ ...adjustData, quantityChanged: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Reason / Audit Remarks *
              </label>
              <input
                type="text"
                required
                value={adjustData.reason}
                onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                placeholder="e.g. Monthly Physical Warehouse Count Audit"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsAdjustOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Applying...' : 'Apply Stock Adjustment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product Item"
        message="Are you sure you want to delete this product? Products attached to existing sales challans cannot be deleted."
        confirmText="Delete Product"
        isLoading={submitting}
      />
    </div>
  );
};
