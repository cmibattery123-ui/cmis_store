"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import DevelopmentModal from "@/components/shared/DevelopmentModal";

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, taxTotal, shippingAmount, grandTotal, totalItems } = useCart();
  const [showModal, setShowModal] = useState(false);

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
              <ShoppingCart className="w-10 h-10 text-gray-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">Your Cart is Empty</h1>
            <p className="text-gray-400">Add some batteries to get started</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-primary text-black font-heading font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors mt-2"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] pt-40 md:pt-48 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-400 mb-8">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>

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
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 bg-white/5 rounded-xl overflow-hidden shrink-0 relative">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain p-2" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-8 h-8 text-gray-700" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{item.name}</h3>
                      <p className="text-gray-500 text-xs font-mono mt-0.5">{item.sku}</p>
                      <p className="text-primary font-heading font-bold mt-1">
                        {formatCurrency(item.price)}
                        <span className="text-gray-500 font-normal text-xs ml-1">each</span>
                      </p>
                    </div>

                    {/* Qty + remove */}
                    <div className="flex flex-col items-end justify-between gap-2">
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white font-medium w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-white font-medium text-sm">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
                <h2 className="font-heading font-bold text-white mb-5">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>GST</span>
                    <span>{formatCurrency(taxTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className={shippingAmount === 0 ? "text-green-400" : ""}>
                      {shippingAmount === 0 ? "FREE" : formatCurrency(shippingAmount)}
                    </span>
                  </div>
                  {shippingAmount > 0 && (
                    <p className="text-xs text-gray-600">
                      Add {formatCurrency(5000 - subtotal - taxTotal)} more for free shipping
                    </p>
                  )}
                  <div className="flex justify-between text-white font-heading font-bold text-base pt-3 border-t border-white/10">
                    <span>Total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center gap-2 w-full bg-primary text-black font-heading font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors mt-6"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>

                <DevelopmentModal isOpen={showModal} onClose={() => setShowModal(false)} />

                <Link
                  href="/products"
                  className="block text-center text-gray-500 text-sm hover:text-white transition-colors mt-4"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
