"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Loader2, RefreshCw } from "lucide-react";
import ProductListClient from "./ProductListClient";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProducts(query = search) {
    setLoading(true);
    try {
      const url = `/api/admin/products?page=${page}&limit=50${query ? `&search=${encodeURIComponent(query)}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.data) {
        setProducts(json.data.products || []);
        setTotal(json.data.pagination?.total || 0);
        setTotalPages(json.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [page]);

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Products</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-0.5">{total} total products</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadProducts()}
            className="p-2.5 rounded-xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-700 dark:text-gray-300"
            title="Refresh products"
            aria-label="Refresh products"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-primary text-black font-mono font-bold uppercase text-xs px-4 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
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
          placeholder="Search products or SKU..."
          className="w-full bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors shadow-sm"
        />
      </div>

      {/* Product List with Drag-and-Drop */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
          <span className="text-xs font-mono text-slate-500 dark:text-gray-400">Loading products...</span>
        </div>
      ) : (
        <ProductListClient initialProducts={products} search={search} />
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
