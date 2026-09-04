"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import { ShoppingBag, Loader2, RefreshCw, PackageOpen, CheckCircle, Clock } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING:    "bg-amber-500/10 text-amber-600 dark:text-yellow-400 border border-amber-500/20",
  CONFIRMED:  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  PROCESSING: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
  SHIPPED:    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  DELIVERED:  "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20",
  CANCELLED:  "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  FAILED:     "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  REFUNDED:   "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/20",
};

const paymentColors: Record<string, string> = {
  PENDING:  "bg-amber-500/10 text-amber-600 dark:text-yellow-400 border border-amber-500/20",
  PAID:     "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20",
  FAILED:   "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  REFUNDED: "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/20",
};

const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED", "REFUNDED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);
    try {
      const url = `/api/admin/orders?page=${page}&limit=20${status ? `&status=${status}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.data) {
        setOrders(json.data.orders || []);
        setTotal(json.data.pagination?.total || 0);
        setTotalPages(json.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [page, status]);

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Orders</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-0.5 font-normal">
            {total} total order{total === 1 ? "" : "s"} recorded
          </p>
        </div>
        <button
          onClick={() => loadOrders()}
          className="p-2.5 rounded-2xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-700 dark:text-gray-300 shadow-sm"
          title="Refresh orders"
          aria-label="Refresh orders"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600 dark:text-primary" : ""}`} />
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setStatus(null); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            !status
              ? "bg-primary text-black shadow-[0_0_15px_rgba(250,255,0,0.25)]"
              : "bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          All
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              status === s
                ? "bg-primary text-black shadow-[0_0_15px_rgba(250,255,0,0.25)]"
                : "bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 dark:text-gray-400 text-xs font-mono uppercase tracking-widest border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
                <th className="text-left p-5">Order #</th>
                <th className="text-left p-5">Customer</th>
                <th className="text-left p-5">Date</th>
                <th className="text-left p-5">Items</th>
                <th className="text-left p-5">Status</th>
                <th className="text-left p-5">Payment</th>
                <th className="text-right p-5">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-7 h-7 text-amber-600 dark:text-primary animate-spin" />
                      <p className="text-sm font-mono font-bold">Loading orders from database…</p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-primary/10 flex items-center justify-center text-amber-600 dark:text-primary">
                        <PackageOpen className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-base text-slate-900 dark:text-white">No Orders Found</p>
                      <p className="text-xs max-w-sm text-slate-500 dark:text-gray-400 font-normal">
                        {status ? `There are no orders matching status "${status}".` : "New customer and dealer orders will appear here automatically."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 font-mono font-bold text-amber-600 dark:text-primary text-xs">{o.orderNumber}</td>
                    <td className="p-5">
                      <p className="text-slate-900 dark:text-white font-bold">{o.user?.name || "Customer"}</p>
                      <p className="text-slate-500 dark:text-gray-400 text-xs font-mono">{o.user?.email}</p>
                    </td>
                    <td className="p-5 text-slate-600 dark:text-gray-400 text-xs font-mono">{formatDate(o.createdAt)}</td>
                    <td className="p-5 text-slate-600 dark:text-gray-400">{o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? "s" : ""}</td>
                    <td className="p-5">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${statusColors[o.status] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${paymentColors[o.paymentStatus || o.payment?.status] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                        {o.paymentStatus || o.payment?.status || "PENDING"}
                      </span>
                    </td>
                    <td className="p-5 text-right text-slate-900 dark:text-white font-black font-mono text-sm">{formatCurrency(Number(o.totalAmount || 0))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-mono font-bold transition-all cursor-pointer ${
                p === page
                  ? "bg-primary text-black shadow-md font-black"
                  : "bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
