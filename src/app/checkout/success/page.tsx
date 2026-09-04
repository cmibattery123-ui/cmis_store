import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import { CheckCircle, Package, ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export const dynamic = "force-dynamic";

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
    <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white pt-36 pb-20 px-4 transition-colors duration-200">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Success icon */}
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Order Placed Successfully!</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-2 font-normal">
            Thank you for your order. We&apos;ll process it right away.
          </p>
          <p className="text-amber-600 dark:text-primary font-mono font-black text-xl mt-3">{order.orderNumber}</p>
        </div>

        {/* Order summary card */}
        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 text-left shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
            <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Order Details</h2>
            <span className="text-xs font-mono text-slate-500 dark:text-gray-300">{formatDate(order.createdAt)}</span>
          </div>

          <div className="space-y-2 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-slate-700 dark:text-gray-200">{item.productName} × {item.quantity}</span>
                <span className="text-slate-900 dark:text-white font-mono font-bold">{formatCurrency(Number(item.totalPrice))}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-1.5 text-sm font-mono">
            <div className="flex justify-between text-slate-600 dark:text-gray-300">
              <span>Subtotal</span><span>{formatCurrency(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-gray-300">
              <span>GST</span><span>{formatCurrency(Number(order.taxAmount))}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-gray-300">
              <span>Shipping</span>
              <span>{Number(order.shippingAmount) === 0 ? "Free" : formatCurrency(Number(order.shippingAmount))}</span>
            </div>
            <div className="flex justify-between text-slate-900 dark:text-white font-black text-base pt-2 border-t border-slate-200 dark:border-white/10">
              <span>Total Paid</span>
              <span className="text-amber-600 dark:text-primary">{formatCurrency(Number(order.totalAmount))}</span>
            </div>
          </div>

          {/* Payment status */}
          {order.payment && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 dark:text-gray-300">Payment:</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono ${
                order.payment.status === "PAID"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}>
                {order.payment.status}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-gray-300">via {order.payment.provider}</span>
            </div>
          )}
        </div>

        {/* Shipping address */}
        {order.shippingAddress && (
          <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 text-left shadow-lg">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-sm uppercase tracking-tight font-mono">Shipping Destination</h3>
            <div className="text-slate-600 dark:text-gray-200 text-sm space-y-0.5">
              <p className="text-slate-900 dark:text-white font-bold">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
              <p className="font-mono text-xs text-slate-500 dark:text-gray-300 mt-1">{order.shippingAddress.phone}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/customer/orders"
            className="flex items-center justify-center gap-2 bg-primary text-black font-black px-6 py-3.5 rounded-2xl hover:bg-yellow-300 transition-all uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(250,255,0,0.3)]"
          >
            <Package className="w-4 h-4" /> Track Order
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-[#161722] text-slate-900 dark:text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-slate-200 dark:hover:bg-[#1E202B] transition-all uppercase tracking-wider text-xs shadow-sm"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-slate-500 dark:text-gray-300 text-xs font-mono">
          A confirmation was sent to <span className="text-slate-800 dark:text-white font-bold">{session.user.email}</span>
        </p>
      </div>
      <Footer />
    </main>
  );
}
