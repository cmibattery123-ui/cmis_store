"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import {
  ShoppingCart, FileText, PackageSearch,
  Clock, CheckCircle, Wallet, Warehouse, Loader2, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DealerDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);
    try {
      const res = await fetch("/api/dealer/dashboard");
      const json = await res.json();
      if (res.ok && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load dealer dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-gray-400">
        <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
        <span className="text-xs font-mono">Loading dealer dashboard...</span>
      </div>
    );
  }

  if (!data?.dealer) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20 text-slate-900 dark:text-white">
        <h2 className="text-xl font-heading font-bold">Account Setup Pending</h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm">Your dealer application is not yet complete.</p>
        <Link href="/auth/dealer-register">
          <Button className="bg-primary text-black font-mono font-bold uppercase text-xs">Complete Registration</Button>
        </Link>
      </div>
    );
  }

  const widgets = [
    {
      label: "Total Orders",
      value: (data.totalOrders || 0).toLocaleString(),
      icon: ShoppingCart,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total Spent",
      value: formatCurrency(Number(data.totalSpent || 0)),
      icon: Wallet,
      color: "text-amber-600 dark:text-primary",
      bg: "bg-amber-500/10 dark:bg-primary/10",
    },
    {
      label: "Pending Quotations",
      value: (data.pendingQuotations || 0).toLocaleString(),
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-8 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Dealer Overview</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            Welcome back, {data.dealer.businessName}
          </p>
        </div>
        <button
          onClick={() => loadDashboard()}
          className="p-2 rounded-xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-700 dark:text-gray-300"
          title="Refresh dashboard"
          aria-label="Refresh dashboard"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {widgets.map((w) => (
          <div key={w.label} className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${w.bg} shrink-0`}>
              <w.icon className={`w-6 h-6 ${w.color}`} />
            </div>
            <div>
              <div className="text-2xl font-heading font-bold text-slate-900 dark:text-white font-mono">{w.value}</div>
              <div className="text-xs text-slate-500 dark:text-gray-400 uppercase font-mono font-bold tracking-widest">{w.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <h2 className="font-heading font-bold text-slate-900 dark:text-white">Recent Orders</h2>
              <Link href="/dealer/orders" className="text-xs font-mono font-bold text-amber-600 dark:text-primary hover:underline uppercase tracking-wider">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 dark:text-gray-400 text-xs uppercase tracking-widest border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
                    <th className="text-left p-4">Order #</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-right p-4">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.recentOrders || []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 dark:text-gray-500">No recent orders</td>
                    </tr>
                  )}
                  {(data.recentOrders || []).map((order: any) => (
                    <tr key={order.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono font-bold text-amber-600 dark:text-primary text-xs">{order.orderNumber}</td>
                      <td className="p-4 text-slate-600 dark:text-gray-400 text-xs font-mono">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-yellow-400 border border-amber-500/20">
                          {order.status}
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

        <div className="space-y-4">
          <h3 className="font-heading font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          
          <Link href="/dealer/products" className="block">
            <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-amber-500 dark:hover:border-primary/50 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <PackageSearch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">Browse Catalog</div>
                <div className="text-xs text-slate-500 dark:text-gray-400">View products with dealer pricing</div>
              </div>
            </div>
          </Link>

          <Link href="/dealer/quotations/new" className="block">
            <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-amber-500 dark:hover:border-primary/50 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">Request Quotation</div>
                <div className="text-xs text-slate-500 dark:text-gray-400">Get custom bulk pricing</div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
