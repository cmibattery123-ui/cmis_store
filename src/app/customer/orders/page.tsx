"use client";

import React, { useState, useEffect, Suspense } from "react";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import { ShoppingCart, Package, ChevronRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  PROCESSING: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
  SHIPPED: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  FAILED: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  REFUNDED: "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/20",
};

interface OrderItem {
  productName: string;
  quantity: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  payment?: { status: string } | null;
}

function CustomerOrdersContent() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = Number(pageParam ?? 1);

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/customer/orders?page=${currentPage}&limit=10`);
        const json = await res.json();
        if (res.ok && json.data) {
          if (isMounted) {
            setOrders(json.data.orders || []);
            setTotal(json.data.pagination?.total || 0);
            setTotalPages(json.data.pagination?.totalPages || 1);
          }
        } else {
          if (isMounted) {
            setError(json.error || "Failed to load orders");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Network connection issue. Please refresh.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-gray-400 font-mono">
        <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
        <p className="text-sm">Loading your orders…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">My Orders</h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs font-mono mt-1">{total} total orders</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          aria-label="Refresh orders"
          className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#161722] border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-2xl px-4 py-3 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl py-20 text-center shadow-sm">
          <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-slate-900 dark:text-white font-bold uppercase tracking-tight">No orders yet</h3>
          <p className="text-slate-500 dark:text-gray-300 text-sm mt-1 font-normal">Start shopping to see your orders here</p>
          <Link
            href="/products"
            className="inline-block mt-4 bg-primary text-black font-black px-6 py-3 rounded-2xl hover:bg-yellow-300 transition-all text-xs font-mono uppercase tracking-wider shadow-[0_0_15px_rgba(250,255,0,0.25)]"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/customer/orders/${order.id}`}>
              <div className="group bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 hover:border-amber-500/40 dark:hover:border-primary/40 transition-all cursor-pointer shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-amber-600 dark:text-primary font-bold text-base">{order.orderNumber}</p>
                    <p className="text-slate-500 dark:text-gray-300 text-xs mt-0.5 font-mono">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider ${
                        statusColors[order.status] ?? "bg-slate-500/10 text-slate-600 dark:text-gray-300"
                      }`}
                    >
                      {order.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-primary transition-colors" />
                  </div>
                </div>

                <div className="space-y-1.5 my-3">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-0.5">
                      <span className="text-slate-700 dark:text-gray-200 font-normal">
                        {item.productName} <span className="font-mono text-xs font-bold text-amber-600 dark:text-primary">× {item.quantity}</span>
                      </span>
                      <span className="text-slate-900 dark:text-white font-mono font-bold">
                        {formatCurrency(Number(item.totalPrice))}
                      </span>
                    </div>
                  ))}
                  {order.items && order.items.length > 3 && (
                    <p className="text-slate-500 dark:text-gray-300 text-xs font-mono">+{order.items.length - 3} more items</p>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400 dark:text-gray-300" />
                    <span className="text-xs font-mono text-slate-500 dark:text-gray-300">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                    </span>
                    {order.payment && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          order.payment.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        Payment: {order.payment.status}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-900 dark:text-white font-black text-base font-mono">
                    {formatCurrency(Number(order.totalAmount))}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/customer/orders?page=${p}`}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-mono font-bold transition-all ${
                p === currentPage
                  ? "bg-primary text-black shadow-[0_0_15px_rgba(250,255,0,0.25)]"
                  : "bg-white dark:bg-[#161722] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#1E202B]"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomerOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 flex items-center justify-center gap-2 text-slate-500 dark:text-gray-500 text-sm font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-primary" />
          <span>Loading orders…</span>
        </div>
      }
    >
      <CustomerOrdersContent />
    </Suspense>
  );
}
