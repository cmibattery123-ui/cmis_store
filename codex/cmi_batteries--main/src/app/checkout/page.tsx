"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  MapPin, CreditCard, ShoppingCart, CheckCircle,
  AlertCircle, Loader2, ChevronRight, Lock
} from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir",
];

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm";
const labelCls = "block text-sm font-medium text-gray-300 mb-1.5";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, taxTotal, shippingAmount, grandTotal, clearCart } = useCart();

  const [address, setAddress] = useState({
    name: session?.user?.name ?? "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "Tamil Nadu",
    pincode: "",
  });

  const [gstNumber, setGstNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session?.user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto" />
            <h2 className="text-2xl font-heading font-bold text-white">Sign In Required</h2>
            <p className="text-gray-400">Please sign in to complete your purchase</p>
            <Link
              href="/auth/login?callbackUrl=/checkout"
              className="inline-block bg-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  async function placeOrder() {
    if (!address.name || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
      setError("Please fill in all required address fields");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // 1. Create the order
      const orderRes = await fetch("/api/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          newShippingAddress: address,
          gstNumber: gstNumber || null,
          notes: notes || null,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData.error ?? "Failed to create order");
        setLoading(false);
        return;
      }

      const orderId: string = orderData.data.id;

      // 2. Create payment (mock)
      const paymentRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) {
        setError(paymentData.error ?? "Payment initiation failed");
        setLoading(false);
        return;
      }

      // 3. Mock verify (auto-success in development)
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          providerOrderId: paymentData.data.providerOrderId,
          providerPaymentId: `mock_pay_${Date.now()}`,
        }),
      });

      if (verifyRes.ok) {
        clearCart();
        router.push(`/checkout/success?orderId=${orderId}`);
      } else {
        setError("Payment verification failed. Please contact support.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/cart" className="hover:text-white transition-colors">Cart</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Checkout</span>
          </div>

          <h1 className="text-3xl font-heading font-bold text-white mb-8">Checkout</h1>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left — shipping info */}
            <div className="lg:col-span-3 space-y-6">
              {/* Shipping address */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="font-heading font-bold text-white flex items-center gap-2 mb-5">
                  <MapPin className="w-4 h-4 text-primary" /> Shipping Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      placeholder="John Doe"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number *</label>
                    <input
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="9999999999"
                      type="tel"
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Address Line 1 *</label>
                    <input
                      value={address.line1}
                      onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                      placeholder="House/Shop no., Street, Area"
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Address Line 2</label>
                    <input
                      value={address.line2}
                      onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                      placeholder="Landmark (optional)"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>City *</label>
                    <input
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="Coimbatore"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>State *</label>
                    <select
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className={inputCls}
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s} className="bg-[#111]">{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Pincode *</label>
                    <input
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      placeholder="641001"
                      maxLength={6}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>GST Number (B2B)</label>
                    <input
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="22AAAAA0000A1Z5"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>Order Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Special instructions, delivery notes…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Payment info */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="font-heading font-bold text-white flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-primary" /> Payment
                </h2>
                <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Secure Payment Processing</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Payment will be processed securely via Razorpay
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — order summary */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
                <h2 className="font-heading font-bold text-white flex items-center gap-2 mb-5">
                  <ShoppingCart className="w-4 h-4 text-primary" /> Order Summary
                </h2>

                <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-gray-300 line-clamp-1 flex-1 mr-2">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-white shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm border-t border-white/10 pt-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>GST</span><span>{formatCurrency(taxTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className={shippingAmount === 0 ? "text-green-400" : ""}>
                      {shippingAmount === 0 ? "FREE" : formatCurrency(shippingAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-white font-heading font-bold text-lg pt-2 border-t border-white/10">
                    <span>Total</span><span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-black font-heading font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Place Order — {formatCurrency(grandTotal)}</>
                  )}
                </button>

                <p className="text-center text-gray-600 text-xs mt-3">
                  By placing your order, you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
