"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils/api";
import {
  ShoppingCart, Users,
  AlertTriangle, Clock, CheckCircle, DollarSign, Loader2
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingQuotations: number;
  lowStockCount: number;
  totalCustomers: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    user: { name: string | null; email: string };
  }>;
  pendingDealers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingQuotations: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    recentOrders: [],
    pendingDealers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/dashboard");
        const json = await res.json();
        if (res.ok && json.data) {
          setStats(json.data);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const widgets = [
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      href: "/admin/orders",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "text-amber-600 dark:text-primary",
      bg: "bg-amber-500/10 dark:bg-primary/10",
      href: "/admin/payments",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      href: "/admin/customers",
    },
    {
      label: "Pending Quotations",
      value: stats.pendingQuotations.toLocaleString(),
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10",
      href: "/admin/quotations",
    },
    {
      label: "Low Stock Alerts",
      value: stats.lowStockCount.toLocaleString(),
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10",
      href: "/admin/inventory",
    },
    {
      label: "Pending Dealers",
      value: stats.pendingDealers.toLocaleString(),
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-500/10",
      href: "/admin/dealers",
    },
  ];

  return (
    <div className="space-y-8 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Welcome back, Administrator</p>
        </div>
        {loading && <Loader2 className="w-5 h-5 text-amber-600 dark:text-primary animate-spin" />}
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {widgets.map((w) => (
          <Link
            key={w.label}
            href={w.href}
            className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-amber-500 dark:hover:border-primary/50 transition-all cursor-pointer group shadow-sm"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${w.bg} group-hover:scale-105 transition-transform shrink-0`}>
              <w.icon className={`w-6 h-6 ${w.color}`} />
            </div>
            <div>
              <div className="text-2xl font-heading font-bold text-slate-900 dark:text-white font-mono">{w.value}</div>
              <div className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-widest font-mono font-bold">{w.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="font-heading font-bold text-slate-900 dark:text-white">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-mono font-bold text-amber-600 dark:text-primary hover:underline uppercase tracking-wider">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 dark:text-gray-400 text-xs uppercase tracking-widest border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
                <th className="text-left p-4">Order #</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Payment</th>
                <th className="text-right p-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 dark:text-gray-500">
                    {loading ? "Loading orders..." : "No orders yet"}
                  </td>
                </tr>
              )}
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono font-bold text-amber-600 dark:text-primary">{order.orderNumber}</td>
                  <td className="p-4 text-slate-900 dark:text-white font-medium">{order.user?.name ?? order.user?.email ?? "Customer"}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-yellow-400 border border-amber-500/20">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      order.paymentStatus === "PAID"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/20"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right text-slate-900 dark:text-white font-bold font-mono">
                    {formatCurrency(Number(order.totalAmount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
