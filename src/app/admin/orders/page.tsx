"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import {
  ShoppingBag,
  Loader2,
  RefreshCw,
  PackageOpen,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  User,
  Package,
} from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  PENDING:    "bg-amber-500/10 text-amber-600 dark:text-yellow-400 border border-amber-500/30",
  CONFIRMED:  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30",
  PROCESSING: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30",
  SHIPPED:    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30",
  DELIVERED:  "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/30",
  CANCELLED:  "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30",
  FAILED:     "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30",
  REFUNDED:   "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/30",
};

const paymentColors: Record<string, string> = {
  PENDING:  "bg-amber-500/10 text-amber-600 dark:text-yellow-400 border border-amber-500/30",
  PAID:     "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/30",
  FAILED:   "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30",
  REFUNDED: "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/30",
};

const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
  "REFUNDED",
];

const paymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [page, status]);

  async function updateOrderStatus(orderId: string, orderNumber: string, newStatus: string) {
    const updateKey = `${orderId}-status`;
    setUpdatingField(updateKey);

    const prevOrders = [...orders];
    setOrders((current) =>
      current.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update order status");
      }
      toast.success(`Order #${orderNumber} status set to ${newStatus}`);
    } catch (err: any) {
      console.error("Error updating order status:", err);
      toast.error(err.message || "Failed to update status");
      setOrders(prevOrders);
    } finally {
      setUpdatingField(null);
    }
  }

  async function updatePaymentStatus(orderId: string, orderNumber: string, newPaymentStatus: string) {
    const updateKey = `${orderId}-payment`;
    setUpdatingField(updateKey);

    const prevOrders = [...orders];
    setOrders((current) =>
      current.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: newPaymentStatus,
              payment: o.payment ? { ...o.payment, status: newPaymentStatus } : { status: newPaymentStatus },
            }
          : o
      )
    );

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update payment status");
      }
      toast.success(`Payment for Order #${orderNumber} set to ${newPaymentStatus}`);
    } catch (err: any) {
      console.error("Error updating payment status:", err);
      toast.error(err.message || "Failed to update payment status");
      setOrders(prevOrders);
    } finally {
      setUpdatingField(null);
    }
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Orders</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-0.5 font-normal">
            {total} total order{total === 1 ? "" : "s"} recorded — edit status or payment live
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
        {orderStatuses.map((s) => (
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
                <th className="text-left p-5">Order Status</th>
                <th className="text-left p-5">Payment Status</th>
                <th className="text-right p-5">Total</th>
                <th className="text-center p-5">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-7 h-7 text-amber-600 dark:text-primary animate-spin" />
                      <p className="text-sm font-mono font-bold">Loading orders from database…</p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-500 dark:text-gray-400">
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
                orders.map((o) => {
                  const isUpdatingStatus = updatingField === `${o.id}-status`;
                  const isUpdatingPayment = updatingField === `${o.id}-payment`;
                  const isExpanded = expandedOrderId === o.id;
                  const currentPaymentStatus = o.paymentStatus || o.payment?.status || "PENDING";

                  return (
                    <React.Fragment key={o.id}>
                      <tr className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-5 font-mono font-bold text-amber-600 dark:text-primary text-xs">{o.orderNumber}</td>
                        <td className="p-5">
                          <p className="text-slate-900 dark:text-white font-bold">{o.user?.name || "Customer"}</p>
                          <p className="text-slate-500 dark:text-gray-400 text-xs font-mono">{o.user?.email || o.shippingAddress?.phone}</p>
                        </td>
                        <td className="p-5 text-slate-600 dark:text-gray-400 text-xs font-mono">{formatDate(o.createdAt)}</td>
                        <td className="p-5 text-slate-600 dark:text-gray-400">{o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? "s" : ""}</td>
                        
                        {/* Interactive Order Status Dropdown */}
                        <td className="p-5">
                          <div className="relative inline-block">
                            <select
                              value={o.status}
                              disabled={isUpdatingStatus}
                              onChange={(e) => updateOrderStatus(o.id, o.orderNumber, e.target.value)}
                              className={`text-xs pl-3 pr-8 py-1.5 rounded-xl font-bold border appearance-none cursor-pointer transition-all outline-none focus:ring-2 focus:ring-amber-500/50 ${
                                statusColors[o.status] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                              } ${isUpdatingStatus ? "opacity-60 cursor-wait" : ""}`}
                            >
                              {orderStatuses.map((s) => (
                                <option
                                  key={s}
                                  value={s}
                                  className="bg-white dark:bg-[#1A1A1E] text-slate-900 dark:text-white font-medium"
                                >
                                  {s}
                                </option>
                              ))}
                            </select>
                            {isUpdatingStatus ? (
                              <Loader2 className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin pointer-events-none text-current" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70" />
                            )}
                          </div>
                        </td>

                        {/* Interactive Payment Status Dropdown */}
                        <td className="p-5">
                          <div className="relative inline-block">
                            <select
                              value={currentPaymentStatus}
                              disabled={isUpdatingPayment}
                              onChange={(e) => updatePaymentStatus(o.id, o.orderNumber, e.target.value)}
                              className={`text-xs pl-3 pr-8 py-1.5 rounded-xl font-bold border appearance-none cursor-pointer transition-all outline-none focus:ring-2 focus:ring-amber-500/50 ${
                                paymentColors[currentPaymentStatus] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                              } ${isUpdatingPayment ? "opacity-60 cursor-wait" : ""}`}
                            >
                              {paymentStatuses.map((s) => (
                                <option
                                  key={s}
                                  value={s}
                                  className="bg-white dark:bg-[#1A1A1E] text-slate-900 dark:text-white font-medium"
                                >
                                  {s}
                                </option>
                              ))}
                            </select>
                            {isUpdatingPayment ? (
                              <Loader2 className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin pointer-events-none text-current" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70" />
                            )}
                          </div>
                        </td>

                        <td className="p-5 text-right text-slate-900 dark:text-white font-black font-mono text-sm">
                          {formatCurrency(Number(o.totalAmount || 0))}
                        </td>

                        {/* Expand Details Button */}
                        <td className="p-5 text-center">
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            title={isExpanded ? "Hide details" : "View details"}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Order Inspection Card */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                          <td colSpan={8} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                              {/* Customer & Shipping */}
                              <div className="bg-white dark:bg-[#14151F] p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
                                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                                  <MapPin className="w-4 h-4 text-amber-600 dark:text-primary" />
                                  <span>Customer & Shipping</span>
                                </div>
                                <div className="space-y-1.5 text-slate-600 dark:text-gray-300">
                                  <p className="font-semibold text-slate-900 dark:text-white">
                                    {o.shippingAddress?.name || o.user?.name || "Customer"}
                                  </p>
                                  {o.shippingAddress?.phone && <p>📞 Phone: {o.shippingAddress.phone}</p>}
                                  {o.user?.email && <p>✉️ Email: {o.user.email}</p>}
                                  {o.shippingAddress?.line1 && (
                                    <p className="pt-1 text-slate-500 dark:text-gray-400">
                                      {o.shippingAddress.line1}
                                      {o.shippingAddress.line2 ? `, ${o.shippingAddress.line2}` : ""}
                                      <br />
                                      {o.shippingAddress.city}, {o.shippingAddress.state} - {o.shippingAddress.pincode}
                                    </p>
                                  )}
                                  {o.notes && <p className="pt-2 italic text-slate-500">Note: {o.notes}</p>}
                                </div>
                              </div>

                              {/* Payment Meta */}
                              <div className="bg-white dark:bg-[#14151F] p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
                                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  <span>Payment Information</span>
                                </div>
                                <div className="space-y-1.5 text-slate-600 dark:text-gray-300 font-mono">
                                  <p>Provider: <span className="font-bold">{o.payment?.provider || "RAZORPAY"}</span></p>
                                  {o.payment?.providerPaymentId && (
                                    <p className="text-amber-600 dark:text-primary">
                                      Pay ID: {o.payment.providerPaymentId}
                                    </p>
                                  )}
                                  <p>Status: <span className="font-bold">{currentPaymentStatus}</span></p>
                                  {o.payment?.paidAt && <p>Paid At: {formatDate(o.payment.paidAt)}</p>}
                                </div>
                              </div>

                              {/* Order Items */}
                              <div className="bg-white dark:bg-[#14151F] p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
                                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                                  <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                  <span>Purchased Items</span>
                                </div>
                                <div className="space-y-2">
                                  {o.items?.map((item: any, idx: number) => (
                                    <div key={item.id || idx} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5 last:border-0">
                                      <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{item.productName}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">SKU: {item.sku || "N/A"} × {item.quantity}</p>
                                      </div>
                                      <p className="font-mono font-bold text-slate-900 dark:text-white">
                                        {formatCurrency(Number(item.totalPrice || 0))}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
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
