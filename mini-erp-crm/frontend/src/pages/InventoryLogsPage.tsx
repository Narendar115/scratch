import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { StockLog, Pagination as PaginationType } from '../types';
import { TableSkeleton } from '../components/Skeleton';
import { Pagination } from '../components/Pagination';
import { Badge } from '../components/Badge';
import { History, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const InventoryLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const fetchLogs = async (page: number) => {
    try {
      setLoading(true);
      const res = await productService.getStockLogs({ page, limit: 15 });
      setLogs(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      toast.error('Failed to load inventory logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <History className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Stock Movement & Audit Log
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete immutable audit log of warehouse stock movements, dispatches & adjustments
          </p>
        </div>
        <button
          onClick={() => fetchLogs(pagination.page)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Log</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No stock movement audit records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4">Product / SKU</th>
                  <th className="px-6 py-4">Movement Type</th>
                  <th className="px-6 py-4">Quantity Change</th>
                  <th className="px-6 py-4">Reason / Audit Remark</th>
                  <th className="px-6 py-4">Operator</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                {logs.map((log) => {
                  const isPositive = log.quantityChanged > 0;
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 dark:text-white block">
                          {log.product?.name || 'Deleted Product'}
                        </span>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          {log.product?.sku || 'N/A'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            log.movementType === 'IN'
                              ? 'success'
                              : log.movementType === 'OUT'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {log.movementType}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 font-extrabold">
                        <div
                          className={`flex items-center gap-1 ${
                            isPositive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          <span>
                            {isPositive ? `+${log.quantityChanged}` : log.quantityChanged} units
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-700 dark:text-gray-300">
                        {log.reason}
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {log.createdBy}
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={fetchLogs} />
      </div>
    </div>
  );
};
