"use client";

import React, { useState, useEffect } from "react";
import { Package, Search, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";

export default function DealerInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadInventory() {
    setLoading(true);
    try {
      const res = await fetch("/api/dealer/products?limit=100");
      const json = await res.json();
      if (res.ok && json.data?.products) {
        setProducts(json.data.products);
      }
    } catch (err) {
      console.error("Failed to load dealer inventory:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const filtered = products.filter((p) =>
    search
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Live Inventory</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            Check real-time stock availability for all products before placing an order.
          </p>
        </div>
        <button
          onClick={() => loadInventory()}
          className="p-2 rounded-xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-700 dark:text-gray-300"
          title="Refresh inventory"
          aria-label="Refresh inventory"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name or SKU…"
          className="w-full bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors shadow-sm"
        />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-gray-400">
          <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
          <span className="text-xs font-mono">Loading stock levels...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-500 dark:text-gray-400 text-xs font-mono font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Availability</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-400 dark:text-gray-500">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No products found
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const qty = p.inventory?.quantity ?? 0;
                    const inStock = qty > 0;
                    const primaryImage = p.images?.[0]?.url;

                    return (
                      <tr key={p.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 relative overflow-hidden shrink-0 flex items-center justify-center border border-slate-200 dark:border-white/5">
                              {primaryImage ? (
                                <Image src={primaryImage} alt={p.name} fill className="object-contain p-1" />
                              ) : (
                                <Package className="w-4 h-4 text-slate-400 dark:text-gray-600" />
                              )}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-gray-400 text-xs">
                          {p.category?.name}
                        </td>
                        <td className="p-4 font-mono text-xs text-slate-500 dark:text-gray-400">
                          {p.sku}
                        </td>
                        <td className="p-4">
                          {inStock ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20">
                              {qty} Units In Stock
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                              Out of Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
