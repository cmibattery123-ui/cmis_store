"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import Link from "next/link";
import { ShoppingCart, Loader2, RefreshCw } from "lucide-react";

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

export default function DealerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch(`/api/dealer/orders?page=${page}&limit=10`);
      const json = await res.json();
      if (res.ok && json.data) {
        setOrders(json.data.orders || []);
        setTotal(json.data.pagination?.total || 0);
        setTotalPages(json.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load dealer orders:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [page]);

  return (
    <div className="space-y-6 max-w-5xl text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">My Orders</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-0.5">{total} total orders</p>
        </div>
        <button
          onClick={() => loadOrders()}
          className="p-2 rounded-xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-700 dark:text-gray-300"
          title="Refresh orders"
          aria-label="Refresh orders"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-gray-400">
          <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
          <span className="text-xs font-mono">Loading orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl py-16 text-center shadow-sm">
          <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="text-slate-900 dark:text-white font-bold">No orders yet</h3>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Browse the catalog to place your first order</p>
          <Link href="/dealer/products" className="inline-block mt-4 bg-primary text-black font-mono font-bold uppercase text-xs px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors shadow-sm">
            Browse Catalog
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 dark:text-gray-400 text-xs uppercase tracking-widest border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-transparent font-mono font-bold">
                    <th className="text-left p-4">Order #</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Items</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Payment</th>
                    <th className="text-right p-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono font-bold text-amber-600 dark:text-primary text-xs">{order.orderNumber}</td>
                      <td className="p-4 text-slate-600 dark:text-gray-400 text-xs font-mono">{formatDate(order.createdAt)}</td>
                      <td className="p-4">
                        <div className="text-slate-900 dark:text-gray-300 text-xs space-y-0.5 font-medium">
                          {(order.items || []).slice(0, 2).map((item: any, i: number) => (
                            <div key={i}>{item.productName} × {item.quantity}</div>
                          ))}
                          {(order.items || []).length > 2 && (
                            <div className="text-slate-400 dark:text-gray-500 text-[10px]">+{order.items.length - 2} more</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${statusColors[order.status] ?? ""}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {order.payment && (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            order.payment.status === "PAID" ? "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-yellow-400 border border-amber-500/20"
                          }`}>
                            {order.payment.status}
                          </span>
                        )}
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-mono font-bold transition-colors cursor-pointer ${
                    p === page ? "bg-primary text-black" : "bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
