import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import Link from "next/link";
import { AlertTriangle, Package } from "lucide-react";
import InventoryEditor from "./InventoryEditor";

export default async function AdminInventoryPage() {
  const inventory = await db.inventory.findMany({
    include: {
      product: {
        select: { id: true, name: true, sku: true, isActive: true, category: { select: { name: true } } },
      },
    },
    orderBy: { quantity: "asc" },
  });

  const lowStockCount = inventory.filter((i) => i.quantity <= i.lowStockThreshold).length;
  const outOfStockCount = inventory.filter((i) => i.quantity === 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Inventory Management</h1>
        <p className="text-gray-400 text-sm mt-0.5">{inventory.length} products tracked</p>
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">Out of Stock</span>
          </div>
          <p className="text-2xl font-heading font-bold text-white">{outOfStockCount}</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">Low Stock</span>
          </div>
          <p className="text-2xl font-heading font-bold text-white">{lowStockCount}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">In Stock</span>
          </div>
          <p className="text-2xl font-heading font-bold text-white">{inventory.length - outOfStockCount}</p>
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/10">
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
                const isLow = inv.quantity <= inv.lowStockThreshold && !isOut;
                return (
                  <tr key={inv.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <p className="text-white font-medium line-clamp-1">{inv.product.name}</p>
                    </td>
                    <td className="p-4 font-mono text-gray-400 text-xs">{inv.product.sku}</td>
                    <td className="p-4 text-gray-400">{inv.product.category.name}</td>
                    <td className="p-4">
                      <span className={`font-heading font-bold text-lg ${isOut ? "text-red-400" : isLow ? "text-orange-400" : "text-green-400"}`}>
                        {inv.quantity}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{inv.reservedQuantity}</td>
                    <td className="p-4 text-gray-400">{inv.lowStockThreshold}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        isOut ? "bg-red-400/10 text-red-400"
                          : isLow ? "bg-orange-400/10 text-orange-400"
                          : "bg-green-400/10 text-green-400"
                      }`}>
                        {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="p-4">
                      <InventoryEditor
                        productId={inv.productId}
                        currentQty={inv.quantity}
                        currentThreshold={inv.lowStockThreshold}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
