"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import { ShoppingCart, Package, MapPin, Clock, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  SHIPPED: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  FAILED: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  REFUNDED: "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/20",
};

interface OrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  items: Array<{ productName: string; quantity: number }>;
}

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/customer/orders?page=1&limit=5");
        const json = await res.json();
        if (res.ok && json.data) {
          const list: OrderSummary[] = json.data.orders || [];
          setOrders(list);
          setTotalOrders(json.data.pagination?.total || list.length);
          const spent = list.reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
          setTotalSpent(spent);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "Customer";

  return (
    <div className="space-y-8 max-w-4xl text-slate-900 dark:text-white">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
          Welcome back, {firstName}!
        </h1>
        <p className="text-slate-600 dark:text-gray-400 text-sm mt-1 font-normal">Here&apos;s a summary of your account activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        {[
          { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total Spent", value: formatCurrency(totalSpent), icon: Package, color: "text-amber-600 dark:text-primary", bg: "bg-amber-500/10 dark:bg-primary/10" },
          { label: "Account Status", value: "Active", icon: MapPin, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 flex items-center gap-5 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.bg} shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{s.value}</div>
              <div className="text-[10px] text-slate-500 dark:text-gray-300 uppercase tracking-widest font-mono font-bold mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600 dark:text-primary" />
            <h2 className="font-black uppercase tracking-tight text-slate-900 dark:text-white text-base">Recent Orders</h2>
          </div>
          <Link href="/customer/orders" className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-primary hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-slate-500 dark:text-gray-300 text-sm font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-primary" />
            <span>Loading orders…</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-gray-300 text-sm font-mono">No orders placed yet</p>
            <Link href="/products" className="text-amber-600 dark:text-primary text-xs font-mono font-bold uppercase tracking-wider hover:underline mt-2 inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {orders.map((order) => (
              <Link key={order.id} href={`/customer/orders/${order.id}`} className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <div>
                  <p className="text-slate-900 dark:text-white font-bold font-mono text-sm">{order.orderNumber}</p>
                  <p className="text-slate-500 dark:text-gray-300 text-xs mt-0.5 font-mono">{formatDate(order.createdAt)}</p>
                  <p className="text-slate-600 dark:text-gray-300 text-xs mt-0.5 font-normal">
                    {order.items?.map((i) => i.productName).join(", ").slice(0, 50)}…
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${statusColors[order.status] ?? "bg-slate-500/10 text-slate-600 dark:text-gray-300"}`}>
                    {order.status}
                  </span>
                  <p className="text-slate-900 dark:text-white font-bold mt-1.5 font-mono text-sm">{formatCurrency(Number(order.totalAmount))}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/products" className="group bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 hover:border-amber-500/40 dark:hover:border-primary/40 transition-all shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-primary transition-colors uppercase tracking-tight text-base">Browse Products</h3>
          <p className="text-slate-600 dark:text-gray-300 text-sm mt-1 font-normal">Explore our full catalog of batteries</p>
        </Link>
        <Link href="/warranty" className="group bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 hover:border-amber-500/40 dark:hover:border-primary/40 transition-all shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-primary transition-colors uppercase tracking-tight text-base">Warranty Support</h3>
          <p className="text-slate-600 dark:text-gray-300 text-sm mt-1 font-normal">Learn about warranty terms and claims</p>
        </Link>
      </div>
    </div>
  );
}
