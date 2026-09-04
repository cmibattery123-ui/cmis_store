"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils/api";
import Link from "next/link";
import Image from "next/image";
import { Package, ShoppingCart, Search, Loader2, RefreshCw } from "lucide-react";

export default function DealerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProducts(query = search) {
    setLoading(true);
    try {
      const url = `/api/dealer/products?page=${page}&limit=12${query ? `&search=${encodeURIComponent(query)}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.data) {
        setProducts(json.data.products || []);
        setDiscountPercent(json.data.discountPercent || 0);
        setTotal(json.data.pagination?.total || 0);
        setTotalPages(json.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load dealer products:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [page]);

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Product Catalog</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-0.5">
            {total} products available
            {discountPercent > 0 && (
              <span className="ml-2 text-amber-600 dark:text-primary font-bold">
                — Your additional discount: {discountPercent}% off
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => loadProducts()}
          className="p-2 rounded-xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-700 dark:text-gray-300"
          title="Refresh catalog"
          aria-label="Refresh catalog"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              loadProducts(e.currentTarget.value);
            }
          }}
          placeholder="Search products or SKU…"
          className="w-full bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors shadow-sm"
        />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-gray-400">
          <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
          <span className="text-xs font-mono">Loading product catalog...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl py-16 text-center text-slate-400 dark:text-gray-500 shadow-sm">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => {
            const primaryImage = product.images?.[0]?.url;
            const inStock = (product.inventory?.quantity ?? 0) > 0;
            const baseDealerPrice = Number(product.dealerPrice || product.price);
            const finalPrice = discountPercent > 0
              ? baseDealerPrice * (1 - discountPercent / 100)
              : baseDealerPrice;

            return (
              <div key={product.id} className="group bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-amber-500 dark:hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between">
                <div>
                  <div className="aspect-video bg-slate-50 dark:bg-white/[0.02] relative overflow-hidden flex items-center justify-center">
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Package className="w-10 h-10 text-slate-300 dark:text-gray-700" />
                    )}
                    {!inStock && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-lg shadow-sm">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] text-amber-600 dark:text-primary font-mono uppercase font-bold tracking-widest mb-1">{product.category?.name}</div>
                    <h3 className="font-heading font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                    <p className="text-slate-400 dark:text-gray-500 text-xs font-mono mt-0.5">{product.sku}</p>

                    {(product.specs || []).length > 0 && (
                      <div className="mt-3 space-y-1">
                        {product.specs.slice(0, 3).map((spec: any) => (
                          <div key={spec.id} className="flex justify-between text-xs">
                            <span className="text-slate-500 dark:text-gray-400">{spec.label}</span>
                            <span className="text-slate-700 dark:text-gray-300 font-mono">{spec.value}{spec.unit ? ` ${spec.unit}` : ""}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-gray-400">Dealer Price</p>
                      <p className="text-xl font-heading font-bold text-amber-600 dark:text-primary font-mono">
                        {formatCurrency(finalPrice)}
                      </p>
                      {discountPercent > 0 && (
                        <p className="text-xs text-slate-400 dark:text-gray-500 line-through font-mono">
                          {formatCurrency(baseDealerPrice)}
                        </p>
                      )}
                    </div>
                    <Link
                      href="/dealer/quotations/new"
                      className="flex items-center gap-1.5 bg-primary text-black text-xs font-mono font-bold uppercase px-3.5 py-2 rounded-xl hover:bg-yellow-300 transition-colors shadow-sm"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Quote
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-mono font-bold transition-colors cursor-pointer ${
                p === page ? "bg-primary text-black" : "bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10"
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
