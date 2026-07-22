import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils/api";
import {
  Package, MapPin, CreditCard, Clock,
  CheckCircle, Truck, AlertTriangle, ChevronLeft
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle; label: string }> = {
  PENDING:    { color: "text-yellow-400 bg-yellow-400/10", icon: Clock, label: "Pending" },
  CONFIRMED:  { color: "text-blue-400 bg-blue-400/10", icon: CheckCircle, label: "Confirmed" },
  PROCESSING: { color: "text-indigo-400 bg-indigo-400/10", icon: Package, label: "Processing" },
  SHIPPED:    { color: "text-purple-400 bg-purple-400/10", icon: Truck, label: "Shipped" },
  DELIVERED:  { color: "text-green-400 bg-green-400/10", icon: CheckCircle, label: "Delivered" },
  CANCELLED:  { color: "text-red-400 bg-red-400/10", icon: AlertTriangle, label: "Cancelled" },
  REFUNDED:   { color: "text-gray-400 bg-gray-400/10", icon: AlertTriangle, label: "Refunded" },
};

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;

  const order = await db.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      items: {
        include: { product: { select: { slug: true, images: { where: { isPrimary: true }, take: 1 } } } },
      },
      payment: true,
      shippingAddress: true,
      billingAddress: true,
    },
  });

  if (!order) notFound();

  const status = statusConfig[order.status] ?? statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/customer/orders" className="text-gray-500 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-white font-mono">{order.orderNumber}</h1>
          <p className="text-gray-400 text-sm">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
          <StatusIcon className="w-4 h-4" />
          {status.label}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-heading font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Order Items
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-white font-medium hover:text-primary transition-colors"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-gray-500 text-xs mt-0.5 font-mono">SKU: {item.sku}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {formatCurrency(Number(item.unitPrice))} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(Number(item.totalPrice))}</p>
                    <p className="text-gray-500 text-xs mt-0.5">incl. {Number(item.taxRate)}% GST</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment info */}
          {order.payment && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="font-heading font-bold text-white flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-primary" /> Payment
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Provider</span>
                  <span className="text-white">{order.payment.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={order.payment.status === "PAID" ? "text-green-400" : "text-yellow-400"}>
                    {order.payment.status}
                  </span>
                </div>
                {order.payment.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Paid At</span>
                    <span className="text-white">{formatDateTime(order.payment.paidAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary + Address */}
        <div className="space-y-4">
          {/* Order summary */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="font-heading font-bold text-white mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>GST</span>
                <span>{formatCurrency(Number(order.taxAmount))}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>{Number(order.shippingAmount) === 0 ? "Free" : formatCurrency(Number(order.shippingAmount))}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>−{formatCurrency(Number(order.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-heading font-bold text-base pt-2 border-t border-white/10">
                <span>Total</span>
                <span>{formatCurrency(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="font-heading font-bold text-white flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" /> Shipping Address
              </h2>
              <div className="text-sm text-gray-300 space-y-0.5">
                <p className="font-medium text-white">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                <p className="text-gray-500">{order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {order.notes && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="font-heading font-bold text-white mb-2">Notes</h2>
              <p className="text-gray-400 text-sm">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
