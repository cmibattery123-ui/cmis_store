"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  MapPin, CreditCard, ShoppingCart, CheckCircle,
  AlertCircle, Loader2, ChevronRight, Lock, Plus, Home, Building2, Check
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

interface SavedAddress {
  id: string;
  type?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

const inputCls = "w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm shadow-inner";
const labelCls = "block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, subtotal, taxTotal, shippingAmount, grandTotal, clearCart, isHydrated } = useCart();

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);

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
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    let isMounted = true;
    async function fetchAddresses() {
      try {
        setLoadingAddresses(true);
        const res = await fetch("/api/customer/addresses");
        if (res.ok) {
          const json = await res.json();
          const list: SavedAddress[] = json?.data?.addresses || json?.addresses || [];
          if (isMounted) {
            setSavedAddresses(list);
            if (list.length > 0) {
              const defaultAddr = list.find((a) => a.isDefault) || list[0];
              setSelectedAddressId(defaultAddr.id);
              setAddress({
                name: defaultAddr.name || "",
                phone: defaultAddr.phone || "",
                line1: defaultAddr.line1 || "",
                line2: defaultAddr.line2 || "",
                city: defaultAddr.city || "",
                state: defaultAddr.state || "Tamil Nadu",
                pincode: defaultAddr.pincode || "",
              });
            } else {
              setSelectedAddressId("new");
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch saved addresses", err);
      } finally {
        if (isMounted) setLoadingAddresses(false);
      }
    }
    fetchAddresses();
    return () => {
      isMounted = false;
    };
  }, [session?.user]);

  useEffect(() => {
    if (session?.user?.name && !address.name && selectedAddressId === "new") {
      setAddress((prev) => ({ ...prev, name: session.user.name ?? "" }));
    }
  }, [session?.user?.name, selectedAddressId]);

  useEffect(() => {
    if (isHydrated && items.length === 0 && !loading) {
      router.replace("/cart");
    }
  }, [isHydrated, items.length, router, loading]);

  useEffect(() => {
    // Preload Razorpay checkout script
    if (typeof window !== "undefined" && !(window as any).Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  function selectSavedAddress(savedAddr: SavedAddress) {
    setSelectedAddressId(savedAddr.id);
    setAddress({
      name: savedAddr.name || "",
      phone: savedAddr.phone || "",
      line1: savedAddr.line1 || "",
      line2: savedAddr.line2 || "",
      city: savedAddr.city || "",
      state: savedAddr.state || "Tamil Nadu",
      pincode: savedAddr.pincode || "",
    });
  }

  function selectNewAddress() {
    setSelectedAddressId("new");
    setAddress({
      name: session?.user?.name ?? "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "Tamil Nadu",
      pincode: "",
    });
  }

  if (status === "loading" || !isHydrated) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-200">
        <Loader2 className="w-8 h-8 text-amber-500 dark:text-primary animate-spin" />
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-200">
        <div className="text-center space-y-4 max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Sign In Required</h2>
          <p className="text-slate-600 dark:text-gray-400 font-normal">Please sign in to complete your purchase.</p>
          <Link
            href="/auth/login?callbackUrl=/checkout"
            className="inline-block bg-primary text-black font-black px-8 py-3.5 rounded-2xl hover:bg-yellow-300 transition-all uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(250,255,0,0.3)]"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-200">
        <Loader2 className="w-8 h-8 text-amber-500 dark:text-primary animate-spin" />
      </main>
    );
  }

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  async function placeOrder() {
    const isUsingExisting = Boolean(selectedAddressId && selectedAddressId !== "new");

    if (!isUsingExisting) {
      if (!address.name || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
        setError("Please fill in all required address fields");
        return;
      }
    }
    setError(null);
    setLoading(true);

    try {
      const orderPayload: any = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        gstNumber: gstNumber || null,
        notes: notes || null,
      };

      if (isUsingExisting) {
        orderPayload.shippingAddressId = selectedAddressId;
      } else {
        orderPayload.newShippingAddress = address;
      }

      // 1. Create the order
      const orderRes = await fetch("/api/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData?.data?.id) {
        setError(orderData?.error ?? "Failed to create order");
        setLoading(false);
        return;
      }

      const orderId: string = orderData.data.id;
      setCreatedOrderId(orderId);

      // Schedule a 15-minute fallback timer to mark payment as failed if left pending
      setTimeout(async () => {
        try {
          await fetch("/api/payments/fail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              reason: "Payment timed out after 15 minutes",
            }),
          });
        } catch {}
      }, 15 * 60 * 1000);

      // 2. Create payment record / Razorpay order
      const paymentRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentRes.ok || !paymentData?.data) {
        setError(paymentData?.error ?? "Payment initiation failed");
        setLoading(false);
        return;
      }

      const payData = paymentData.data;
      const razorpayKey =
        payData.keyId ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        "";

      const isMock =
        !razorpayKey ||
        !payData.providerOrderId ||
        payData.providerOrderId.startsWith("mock_") ||
        payData.providerOrderId.startsWith("rzp_order_mock_");

      if (!isMock) {
        // Live / Test Razorpay Modal Flow
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || typeof window === "undefined" || !(window as any).Razorpay) {
          setError("Unable to load Razorpay payment gateway. Please check your internet connection.");
          setLoading(false);
          return;
        }

        const options = {
          key: razorpayKey,
          amount: Math.round((payData.amount || grandTotal) * 100),
          currency: payData.currency || "INR",
          name: "Perfect Batteries",
          description: `Order #${payData.orderNumber || orderId.slice(0, 8)}`,
          image: "/assets/LOGO/logo2.png",
          order_id: payData.providerOrderId,
          prefill: {
            name: address.name || payData.customerName || "",
            email: session?.user?.email || payData.customerEmail || "",
            contact: address.phone || payData.customerPhone || "",
          },
          theme: {
            color: "#FAFF00",
            backdrop_color: "rgba(0, 0, 0, 0.8)",
          },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              setLoading(true);
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                // Clear cart ONLY when payment is successful
                await clearCart();
                // Redirect to Home page after successful payment
                if (typeof window !== "undefined") {
                  window.location.href = "/";
                }
              } else {
                setError(verifyData.error ?? "Payment verification failed. Please contact support.");
                setLoading(false);
              }
            } catch {
              setError("Payment verification encountered an error. Please contact support.");
              setLoading(false);
            }
          },
          modal: {
            ondismiss: async () => {
              setLoading(false);
              try {
                await fetch("/api/payments/fail", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId,
                    reason: "Payment modal dismissed by user",
                  }),
                });
              } catch {}
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", async (res: any) => {
          const failureReason = res.error?.description || "Transaction declined at payment gateway";
          setError(`Payment failed: ${failureReason}`);
          setLoading(false);
          try {
            await fetch("/api/payments/fail", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                reason: failureReason,
              }),
            });
          } catch {}
        });
        rzp.open();
      } else {
        // Mock payment flow for local testing
        setLoading(false);
        const shouldPay = typeof window !== "undefined" ? window.confirm("Mock Payment Gateway\n\nClick 'OK' to simulate successful payment.\nClick 'Cancel' to simulate exiting/cancelling payment.") : false;
        
        if (shouldPay) {
          setLoading(true);
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              providerOrderId: payData.providerOrderId,
              providerPaymentId: `mock_pay_${Date.now()}`,
            }),
          });

          if (verifyRes.ok) {
            await clearCart();
            if (typeof window !== "undefined") {
              window.location.href = "/";
            }
          } else {
            setError("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        } else {
          setError("Payment cancelled. Your cart items have been preserved.");
          try {
            await fetch("/api/payments/fail", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                reason: "Payment cancelled by user",
              }),
            });
          } catch {}
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white pt-36 md:pt-44 pb-20 px-4 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-gray-500 mb-6">
          <Link href="/cart" className="hover:text-amber-600 dark:hover:text-white transition-colors">Cart</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 dark:text-white font-bold">Checkout</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-8">
          Checkout Order
        </h1>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-2xl px-4 py-3 mb-6 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left — shipping info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Shipping address */}
            <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight text-lg">
                  <MapPin className="w-5 h-5 text-amber-600 dark:text-primary" /> Shipping Address
                </h2>
                {savedAddresses.length > 0 && selectedAddressId !== "new" && (
                  <button
                    type="button"
                    onClick={selectNewAddress}
                    className="text-xs font-mono font-bold uppercase text-amber-600 dark:text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Address
                  </button>
                )}
              </div>

              {loadingAddresses ? (
                <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 py-4 font-mono text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500 dark:text-primary" /> Loading addresses…
                </div>
              ) : (
                <>
                  {savedAddresses.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <label className={labelCls}>Saved Addresses</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {savedAddresses.map((savedAddr) => {
                          const isSelected = selectedAddressId === savedAddr.id;
                          return (
                            <div
                              key={savedAddr.id}
                              onClick={() => selectSavedAddress(savedAddr)}
                              className={`cursor-pointer rounded-2xl p-4 border transition-all relative ${
                                isSelected
                                  ? "bg-amber-500/10 dark:bg-primary/10 border-amber-500 dark:border-primary shadow-md"
                                  : "bg-slate-50 dark:bg-[#12131A] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    isSelected ? "border-amber-500 dark:border-primary bg-amber-500 dark:bg-primary" : "border-slate-400 dark:border-gray-500"
                                  }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                                  </div>
                                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                                    {savedAddr.name}
                                  </span>
                                </div>
                                {savedAddr.isDefault && (
                                  <span className="text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-700 dark:text-primary px-2 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 text-xs text-slate-600 dark:text-gray-300 space-y-0.5 font-normal pl-6">
                                <p className="font-mono">{savedAddr.phone}</p>
                                <p>{savedAddr.line1}{savedAddr.line2 ? `, ${savedAddr.line2}` : ""}</p>
                                <p>{savedAddr.city}, {savedAddr.state} - {savedAddr.pincode}</p>
                              </div>
                            </div>
                          );
                        })}

                        <div
                          onClick={selectNewAddress}
                          className={`cursor-pointer rounded-2xl p-4 border border-dashed transition-all flex flex-col items-center justify-center min-h-[90px] text-center ${
                            selectedAddressId === "new"
                              ? "bg-amber-500/10 dark:bg-primary/10 border-amber-500 dark:border-primary text-amber-600 dark:text-primary"
                              : "bg-slate-50 dark:bg-[#12131A] border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 text-slate-500 dark:text-gray-400"
                          }`}
                        >
                          <Plus className="w-5 h-5 mb-1" />
                          <span className="font-bold text-xs uppercase tracking-wider font-mono">Deliver to New Address</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 ${
                    selectedAddressId !== "new" && savedAddresses.length > 0 ? "opacity-80 pt-4 border-t border-slate-100 dark:border-white/10" : ""
                  }`}>
                    {selectedAddressId !== "new" && savedAddresses.length > 0 && (
                      <div className="sm:col-span-2 flex items-center justify-between bg-slate-100 dark:bg-white/5 p-3 rounded-xl text-xs font-mono text-slate-600 dark:text-gray-400">
                        <span>Using selected saved address for delivery</span>
                        <button
                          type="button"
                          onClick={selectNewAddress}
                          className="text-amber-600 dark:text-primary font-bold hover:underline cursor-pointer"
                        >
                          Change / Add New
                        </button>
                      </div>
                    )}
                    {(selectedAddressId === "new" || savedAddresses.length === 0) && (
                      <>
                        <div>
                          <label htmlFor="checkout-name" className={labelCls}>Full Name *</label>
                          <input
                            id="checkout-name"
                            value={address.name}
                            onChange={(e) => setAddress({ ...address, name: e.target.value })}
                            placeholder="John Doe"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label htmlFor="checkout-phone" className={labelCls}>Phone Number *</label>
                          <input
                            id="checkout-phone"
                            value={address.phone}
                            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                            placeholder="9999999999"
                            type="tel"
                            className={inputCls}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="checkout-line1" className={labelCls}>Address Line 1 *</label>
                          <input
                            id="checkout-line1"
                            value={address.line1}
                            onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                            placeholder="House/Shop no., Street, Area"
                            className={inputCls}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="checkout-line2" className={labelCls}>Address Line 2</label>
                          <input
                            id="checkout-line2"
                            value={address.line2}
                            onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                            placeholder="Landmark (optional)"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label htmlFor="checkout-city" className={labelCls}>City *</label>
                          <input
                            id="checkout-city"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            placeholder="Coimbatore"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label htmlFor="checkout-state" className={labelCls}>State *</label>
                          <select
                            id="checkout-state"
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            className={inputCls}
                          >
                            {INDIAN_STATES.map((s) => (
                              <option key={s} value={s} className="bg-white dark:bg-[#12131A]">{s}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="checkout-pincode" className={labelCls}>Pincode *</label>
                          <input
                            id="checkout-pincode"
                            value={address.pincode}
                            onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                            placeholder="641001"
                            maxLength={6}
                            className={inputCls}
                          />
                        </div>
                      </>
                    )}
                    <div className={selectedAddressId === "new" || savedAddresses.length === 0 ? "" : "sm:col-span-2"}>
                      <label htmlFor="checkout-gst" className={labelCls}>GST Number (B2B)</label>
                      <input
                        id="checkout-gst"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        placeholder="22AAAAA0000A1Z5"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="checkout-notes" className={labelCls}>Order Notes (Optional)</label>
              <textarea
                id="checkout-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Special instructions, delivery notes…"
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Payment info */}
            <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-tight text-lg">
                <CreditCard className="w-5 h-5 text-amber-600 dark:text-primary" /> Payment Method
              </h2>
              <div className="flex items-center gap-4 bg-amber-500/5 dark:bg-[#12131A] border border-amber-500/20 dark:border-white/10 rounded-2xl p-4">
                <div className="w-10 h-10 bg-amber-500/10 dark:bg-[#161722] rounded-xl flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-amber-600 dark:text-primary" />
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white text-sm font-bold">Secure Payment Gateway</p>
                  <p className="text-slate-500 dark:text-gray-300 text-xs font-normal mt-0.5">
                    UPI, Credit/Debit Cards, NetBanking via Razorpay
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 sticky top-28 shadow-xl">
              <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2 mb-6 uppercase tracking-tight text-lg">
                <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-primary" /> Summary
              </h2>

              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm py-1 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-700 dark:text-gray-300 line-clamp-1 flex-1 mr-2 font-normal">
                      {item.name} <span className="font-mono font-bold text-xs text-amber-600 dark:text-primary">× {item.quantity}</span>
                    </span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t border-slate-200 dark:border-white/10 pt-4 font-mono">
                <div className="flex justify-between text-slate-600 dark:text-gray-400">
                  <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-gray-400">
                  <span>GST</span><span>{formatCurrency(taxTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className={shippingAmount === 0 ? "text-emerald-600 dark:text-green-400 font-bold" : ""}>
                    {shippingAmount === 0 ? "FREE" : formatCurrency(shippingAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-black text-base pt-3 border-t border-slate-200 dark:border-white/10">
                  <span>Total</span><span className="text-amber-600 dark:text-primary">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-black font-black py-4 rounded-2xl hover:bg-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(250,255,0,0.3)]"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                ) : (
                  <><Lock className="w-4 h-4" /> Place Order — {formatCurrency(grandTotal)}</>
                )}
              </button>

              <p className="text-center text-slate-400 dark:text-gray-500 text-[11px] mt-4 font-mono">
                By placing your order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
