"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils/api";
import {
  Package, MapPin, CreditCard, Clock,
  CheckCircle, Truck, AlertTriangle, ChevronLeft, Loader2
} from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle; label: string }> = {
  PENDING:    { color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20", icon: Clock, label: "Pending" },
  CONFIRMED:  { color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20", icon: CheckCircle, label: "Confirmed" },
  PROCESSING: { color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20", icon: Package, label: "Processing" },
  SHIPPED:    { color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20", icon: Truck, label: "Shipped" },
  DELIVERED:  { color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20", icon: CheckCircle, label: "Delivered" },
  CANCELLED:  { color: "text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20", icon: AlertTriangle, label: "Cancelled" },
  FAILED:     { color: "text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20", icon: AlertTriangle, label: "Payment Failed" },
  REFUNDED:   { color: "text-slate-600 dark:text-gray-400 bg-slate-500/10 border border-slate-500/20", icon: AlertTriangle, label: "Refunded" },
};

interface OrderDetail {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount?: number;
  totalAmount: number;
  notes?: string;
  items: Array<{
    id: string;
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    taxRate: number;
    product: {
      slug: string;
      images?: Array<{ url: string }>;
    };
  }>;
  payment?: {
    provider: string;
    status: string;
    paidAt?: string;
  } | null;
  shippingAddress?: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadOrder() {
      try {
        const res = await fetch(`/api/customer/orders/${id}`);
        const json = await res.json();
        if (res.ok && json.data) {
          if (isMounted) setOrder(json.data);
        } else {
          if (isMounted) setError(json.error || "Order not found");
        }
      } catch (err) {
        if (isMounted) setError("Network error loading order");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-gray-400 font-mono">
        <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
        <p className="text-sm">Loading order details…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-8 text-center max-w-xl mx-auto my-12 shadow-sm text-slate-900 dark:text-white">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">Order Not Found</h2>
        <p className="text-slate-600 dark:text-gray-300 text-sm mb-6 font-normal">{error || "The requested order could not be located."}</p>
        <Link
          href="/customer/orders"
          className="inline-flex items-center gap-2 bg-primary text-black font-black px-6 py-3 rounded-2xl hover:bg-yellow-300 transition-all text-xs font-mono uppercase tracking-wider shadow-[0_0_15px_rgba(250,255,0,0.25)]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status] ?? statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6 max-w-4xl text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/customer/orders" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">{order.orderNumber}</h1>
          <p className="text-slate-500 dark:text-gray-300 text-xs font-mono mt-0.5">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${status.color}`}>
          <StatusIcon className="w-4 h-4" />
          {status.label}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-white/10">
              <h2 className="font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <Package className="w-4 h-4 text-amber-600 dark:text-primary" /> Order Items
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {order.items?.map((item) => (
                <div key={item.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product?.slug || ""}`}
                      className="text-slate-900 dark:text-white font-bold hover:text-amber-600 dark:hover:text-primary transition-colors text-sm"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-slate-500 dark:text-gray-300 text-xs mt-0.5 font-mono">SKU: {item.sku}</p>
                    <p className="text-slate-600 dark:text-gray-300 text-xs mt-1 font-mono">
                      {formatCurrency(Number(item.unitPrice))} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-900 dark:text-white font-bold font-mono text-sm">{formatCurrency(Number(item.totalPrice))}</p>
                    <p className="text-slate-400 dark:text-gray-300 text-[10px] font-mono mt-0.5">incl. {Number(item.taxRate)}% GST</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment info */}
          {order.payment && (
            <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-sm">
              <h2 className="font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2 mb-4 text-base">
                <CreditCard className="w-4 h-4 text-amber-600 dark:text-primary" /> Payment
              </h2>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-gray-300">Provider</span>
                  <span className="text-slate-900 dark:text-white font-bold">{order.payment.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-gray-300">Status</span>
                  <span className={order.payment.status === "PAID" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>
                    {order.payment.status}
                  </span>
                </div>
                {order.payment.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-gray-300">Paid At</span>
                    <span className="text-slate-900 dark:text-white">{formatDateTime(order.payment.paidAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary + Address */}
        <div className="space-y-4">
          {/* Order summary */}
          <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-sm">
            <h2 className="font-black uppercase tracking-tight text-slate-900 dark:text-white mb-4 text-base">Order Summary</h2>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between text-slate-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-gray-300">
                <span>GST</span>
                <span>{formatCurrency(Number(order.taxAmount))}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-gray-300">
                <span>Shipping</span>
                <span>{Number(order.shippingAmount) === 0 ? "Free" : formatCurrency(Number(order.shippingAmount))}</span>
              </div>
              {Number(order.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-green-400">
                  <span>Discount</span>
                  <span>−{formatCurrency(Number(order.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 dark:text-white font-black text-base pt-3 border-t border-slate-100 dark:border-white/10 font-mono">
                <span>Total</span>
                <span className="text-amber-600 dark:text-primary">{formatCurrency(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-sm">
              <h2 className="font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2 mb-3 text-base">
                <MapPin className="w-4 h-4 text-amber-600 dark:text-primary" /> Shipping Destination
              </h2>
              <div className="text-sm text-slate-600 dark:text-gray-200 space-y-0.5 font-normal">
                <p className="font-bold text-slate-900 dark:text-white">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                <p className="text-slate-500 dark:text-gray-300 font-mono text-xs mt-1">{order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {order.notes && (
            <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-sm">
              <h2 className="font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2 text-base">Notes</h2>
              <p className="text-slate-600 dark:text-gray-300 text-sm font-normal">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
