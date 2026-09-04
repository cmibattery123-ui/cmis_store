"use client";

import { useCart } from "@/store/cart";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/shared/Footer";

export default function CartPage() {
  const { items, isHydrated, removeItem, updateQty, subtotal, taxTotal, shippingAmount, grandTotal, totalItems } = useCart();

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center transition-colors duration-200">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 dark:text-primary" />
          <p className="text-sm font-mono uppercase tracking-wider">Loading your cart…</p>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center transition-colors duration-200">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl flex items-center justify-center mx-auto shadow-md">
            <ShoppingCart className="w-10 h-10 text-slate-400 dark:text-gray-600" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Your Cart is Empty</h1>
          <p className="text-slate-600 dark:text-gray-400 font-normal">Add some batteries to get started with high performance power.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-black font-black px-8 py-3.5 rounded-2xl hover:bg-yellow-300 transition-all uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(250,255,0,0.3)] mt-2"
          >
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white pt-36 md:pt-44 pb-20 px-4 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Shopping Cart
        </h1>
        <p className="text-slate-500 dark:text-gray-400 mb-8 text-xs font-semibold">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-5 flex gap-4 shadow-md dark:shadow-xl"
                >
                  {/* Image */}
                  <div className="w-20 h-20 bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shrink-0 relative">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain p-2" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="w-8 h-8 text-slate-400 dark:text-gray-700" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-900 dark:text-white font-bold truncate tracking-tight">{item.name}</h3>
                    <p className="text-slate-400 dark:text-gray-300 text-xs font-mono mt-0.5">{item.sku}</p>
                    <p className="text-amber-600 dark:text-primary font-mono font-black mt-1">
                      {formatCurrency(item.price)}
                      <span className="text-slate-400 dark:text-gray-300 font-normal text-xs ml-1 font-sans">each</span>
                    </p>
                  </div>

                  {/* Qty + remove */}
                  <div className="flex flex-col items-end justify-between gap-2">
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#161722] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden p-0.5">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1E202B] rounded-lg transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-slate-900 dark:text-white font-mono font-bold w-7 text-center text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1E202B] rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-slate-900 dark:text-white font-black text-sm font-mono">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 sticky top-28 shadow-xl">
              <h2 className="font-black text-slate-900 dark:text-white mb-5 uppercase tracking-tight text-xl">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-gray-300">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-gray-300">
                  <span>GST</span>
                  <span className="font-mono">{formatCurrency(taxTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-gray-300">
                  <span>Shipping</span>
                  <span className={shippingAmount === 0 ? "text-emerald-600 dark:text-green-400 font-bold font-mono" : "font-mono"}>
                    {shippingAmount === 0 ? "FREE" : formatCurrency(shippingAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-black text-base pt-3 border-t border-slate-200 dark:border-white/10 font-mono">
                  <span>Total</span>
                  <span className="text-amber-600 dark:text-primary">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full bg-primary text-black font-black py-4 rounded-2xl hover:bg-yellow-300 transition-all uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(250,255,0,0.3)] mt-6"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/products"
                className="block text-center text-slate-500 dark:text-gray-400 text-xs font-mono uppercase tracking-wider hover:text-slate-900 dark:hover:text-white transition-colors mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
