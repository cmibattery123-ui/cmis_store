"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils/api";
import { 
  TrendingUp, Users, ShoppingCart, 
  PackageSearch, AlertTriangle, ArrowUpRight, Loader2, RefreshCw
} from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalDealers: number;
  lowStockProducts: number;
  recentOrders: any[];
  topProducts: any[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalDealers: 0,
    lowStockProducts: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (res.ok && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-green-400",
      bg: "bg-emerald-500/10",
      link: "/admin/payments"
    },
    {
      title: "Total Orders",
      value: data.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      link: "/admin/orders"
    },
    {
      title: "Active Dealers",
      value: data.totalDealers.toLocaleString(),
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      link: "/admin/dealers"
    },
    {
      title: "Low Stock Items",
      value: data.lowStockProducts.toLocaleString(),
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10",
      link: "/admin/inventory"
    }
  ];

  return (
    <div className="space-y-8 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Analytics Overview</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">High-level store metrics and sales trends.</p>
        </div>
        <button
          onClick={() => loadAnalytics()}
          className="p-2 rounded-xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-700 dark:text-gray-300"
          title="Refresh analytics"
          aria-label="Refresh analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Link 
            key={i} 
            href={stat.link}
            className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-amber-500 dark:hover:border-primary/50 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-gray-400 text-xs font-mono font-bold uppercase tracking-wider">{stat.title}</span>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-105 transition-transform`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{stat.value}</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-gray-500 group-hover:text-amber-600 dark:group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Visual Analytics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PackageSearch className="w-5 h-5 text-amber-600 dark:text-primary" />
            <h2 className="font-heading font-bold text-slate-900 dark:text-white text-base">Top Selling Products</h2>
          </div>
          
          <div className="space-y-4">
            {data.topProducts.length === 0 ? (
              <p className="text-slate-400 dark:text-gray-500 text-sm py-8 text-center">{loading ? "Loading metrics..." : "No sales data recorded yet"}</p>
            ) : (
              data.topProducts.map((p: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-400 text-xs font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-slate-900 dark:text-white text-sm font-medium">{p.productName}</p>
                      <p className="text-slate-500 dark:text-gray-400 text-xs">{p._sum?.quantity || 0} units sold</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(Number(p._sum?.totalPrice || 0))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Active Orders */}
        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-primary" />
              <h2 className="font-heading font-bold text-slate-900 dark:text-white text-base">Active Orders</h2>
            </div>
            <Link href="/admin/orders" className="text-xs font-mono font-bold text-amber-600 dark:text-primary hover:underline uppercase tracking-wider">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentOrders.length === 0 ? (
              <p className="text-slate-400 dark:text-gray-500 text-sm py-8 text-center">{loading ? "Loading active orders..." : "No pending orders to process"}</p>
            ) : (
              data.recentOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-primary">{o.orderNumber}</span>
                    <p className="text-slate-700 dark:text-gray-300 text-xs mt-0.5">{o.user?.name || "Customer"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(Number(o.totalAmount))}</span>
                    <span className="block text-[10px] uppercase font-bold text-amber-600 dark:text-yellow-400">{o.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
