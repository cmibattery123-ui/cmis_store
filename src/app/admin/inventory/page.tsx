"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Package, Loader2, RefreshCw } from "lucide-react";
import InventoryEditor from "./InventoryEditor";

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadInventory() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      const json = await res.json();
      if (res.ok && json.data) {
        setInventory(json.data);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const lowStockCount = inventory.filter((i) => i.quantity <= (i.lowStockThreshold ?? 10)).length;
  const outOfStockCount = inventory.filter((i) => i.quantity === 0).length;

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Inventory Management</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-0.5">{inventory.length} products tracked</p>
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

      {/* Alert cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-red-600 dark:text-red-400 text-sm font-bold">Out of Stock</span>
          </div>
          <p className="text-2xl font-heading font-bold text-slate-900 dark:text-white font-mono">{outOfStockCount}</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-orange-600 dark:text-orange-400 text-sm font-bold">Low Stock</span>
          </div>
          <p className="text-2xl font-heading font-bold text-slate-900 dark:text-white font-mono">{lowStockCount}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-emerald-600 dark:text-green-400" />
            <span className="text-emerald-600 dark:text-green-400 text-sm font-bold">In Stock</span>
          </div>
          <p className="text-2xl font-heading font-bold text-slate-900 dark:text-white font-mono">{inventory.length - outOfStockCount}</p>
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600 dark:text-primary" />
            Loading inventory...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 dark:text-gray-400 text-xs uppercase tracking-widest border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4">SKU</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Available</th>
                  <th className="text-left p-4">Reserved</th>
                  <th className="text-left p-4">Low Stock At</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Update</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((inv) => {
                  const isOut = inv.quantity === 0;
                  const isLow = inv.quantity <= (inv.lowStockThreshold ?? 10) && !isOut;
                  return (
                    <tr key={inv.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <p className="text-slate-900 dark:text-white font-medium line-clamp-1">{inv.product?.name}</p>
                      </td>
                      <td className="p-4 font-mono text-slate-500 dark:text-gray-400 text-xs">{inv.product?.sku}</td>
                      <td className="p-4 text-slate-600 dark:text-gray-400">{inv.product?.category?.name}</td>
                      <td className="p-4">
                        <span className={`font-heading font-bold text-lg ${isOut ? "text-red-600 dark:text-red-400" : isLow ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-green-400"}`}>
                          {inv.quantity}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-gray-400">{inv.reservedQuantity || 0}</td>
                      <td className="p-4 text-slate-600 dark:text-gray-400">{inv.lowStockThreshold}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          isOut ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                            : isLow ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20"
                        }`}>
                          {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="p-4">
                        <InventoryEditor
                          productId={inv.productId}
                          currentQty={inv.quantity}
                          currentThreshold={inv.lowStockThreshold}
                          onUpdated={loadInventory}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
