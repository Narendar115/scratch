import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats } from '../types';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { CardSkeleton } from '../components/Skeleton';
import {
  Users,
  UserCheck,
  Package,
  AlertTriangle,
  Calendar,
  FileCheck,
  IndianRupee,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const revenueData = [
    { name: 'Paid Revenue', value: stats.revenue.paidRevenue },
    { name: 'Pending Revenue', value: stats.revenue.pendingRevenue }
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Operations & ERP Command Center
          </h1>
          <p className="text-indigo-200 text-sm mt-1">
            Real-time Enterprise Performance, Inventory Alerts & CRM Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/challans"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 text-xs sm:text-sm transition-all"
          >
            + Create Sales Challan
          </Link>
        </div>
      </div>

      {/* Primary Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Customers"
          value={stats.overview.totalCustomers}
          subtitle={`${stats.overview.activeLeads} Active Prospect Leads`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Product Catalog"
          value={stats.overview.products}
          subtitle={`${stats.overview.totalInventoryItems} Units Total Stock`}
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.overview.lowStock}
          subtitle={`${stats.overview.outOfStock} Out of Stock`}
          icon={AlertTriangle}
          color={stats.overview.lowStock > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Confirmed Challans"
          value={stats.overview.confirmedChallans}
          subtitle="Stock Dispatched"
          icon={FileCheck}
          color="emerald"
        />
      </div>

      {/* Revenue & Followup Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.revenue.totalRevenue.toLocaleString()}`}
          subtitle="Grand Invoiced Revenue"
          icon={IndianRupee}
          color="emerald"
        />
        <StatCard
          title="Collected Revenue"
          value={`₹${stats.revenue.paidRevenue.toLocaleString()}`}
          subtitle="Paid Invoices"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Followups Due Today"
          value={stats.overview.todayFollowupsCount}
          subtitle="Pending CRM Activities"
          icon={Calendar}
          color="amber"
        />
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Stock Distribution Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
            Stock Distribution by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="category" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    borderColor: '#374151',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="stock" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Status Breakdown Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
            Revenue Realization Ratio
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    borderColor: '#374151',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span>Paid (₹{stats.revenue.paidRevenue.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Pending (₹{stats.revenue.pendingRevenue.toLocaleString()})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Stock Alerts & Follow-up Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Critical Low Stock Alerts
              </h3>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
            >
              Manage Stock <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.criticalStockAlerts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
              All product stock levels are healthy!
            </p>
          ) : (
            <div className="space-y-3">
              {stats.criticalStockAlerts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      SKU: {prod.sku} • Location: {prod.warehouseLocation}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="danger">
                      {prod.currentStock} Units Left
                    </Badge>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Min: {prod.minStockLevel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Follow-up Agenda */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Scheduled Follow-up Reminders
              </h3>
            </div>
            <Link
              to="/customers"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
            >
              View Customers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.todayFollowups.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
              No follow-ups due today!
            </p>
          ) : (
            <div className="space-y-3">
              {stats.todayFollowups.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                      {c.businessName}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Contact: {c.name} ({c.mobile})
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="warning">{c.followUpDate}</Badge>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Status: {c.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
