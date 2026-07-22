import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import { CheckCircle, Package, ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

interface PageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { orderId } = await searchParams;
  if (!orderId) redirect("/");

  const order = await db.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: {
      items: { select: { productName: true, quantity: true, unitPrice: true, totalPrice: true } },
      payment: { select: { status: true, provider: true, paidAt: true } },
      shippingAddress: true,
    },
  });

  if (!order) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Success icon */}
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-green-400/10 border-2 border-green-400/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <div className="absolute inset-0 bg-green-400/5 rounded-full animate-ping" />
          </div>

          <div>
            <h1 className="text-3xl font-heading font-bold text-white">Order Placed Successfully!</h1>
            <p className="text-gray-400 mt-2">
              Thank you for your order. We&apos;ll process it right away.
            </p>
            <p className="text-primary font-mono font-bold text-lg mt-2">{order.orderNumber}</p>
          </div>

          {/* Order summary card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h2 className="font-heading font-bold text-white">Order Details</h2>
              <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.productName} × {item.quantity}</span>
                  <span className="text-white">{formatCurrency(Number(item.totalPrice))}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span><span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>GST</span><span>{formatCurrency(Number(order.taxAmount))}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>{Number(order.shippingAmount) === 0 ? "Free" : formatCurrency(Number(order.shippingAmount))}</span>
              </div>
              <div className="flex justify-between text-white font-heading font-bold text-base pt-2 border-t border-white/10">
                <span>Total Paid</span>
                <span className="text-primary">{formatCurrency(Number(order.totalAmount))}</span>
              </div>
            </div>

            {/* Payment status */}
            {order.payment && (
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                <span className="text-xs text-gray-500">Payment:</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  order.payment.status === "PAID"
                    ? "bg-green-400/10 text-green-400"
                    : "bg-yellow-400/10 text-yellow-400"
                }`}>
                  {order.payment.status}
                </span>
                <span className="text-xs text-gray-500">via {order.payment.provider}</span>
              </div>
            )}
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
              <h3 className="font-medium text-white mb-2 text-sm">Shipping To</h3>
              <div className="text-gray-400 text-sm space-y-0.5">
                <p className="text-white font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/customer/orders"
              className="flex items-center justify-center gap-2 bg-primary text-black font-heading font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Package className="w-4 h-4" /> Track Order
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 border border-white/20 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-gray-600 text-sm">
            A confirmation will be sent to <span className="text-gray-400">{session.user.email}</span>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
