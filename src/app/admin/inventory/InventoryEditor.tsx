"use client";

import React, { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface InventoryEditorProps {
  productId: string;
  currentQty: number;
  currentThreshold: number;
  onUpdated?: () => void;
}

export default function InventoryEditor({ productId, currentQty, currentThreshold, onUpdated }: InventoryEditorProps) {
  const [qty, setQty] = useState(currentQty);
  const [threshold, setThreshold] = useState(currentThreshold);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty, lowStockThreshold: threshold }),
      });
      if (!res.ok) throw new Error();
      toast.success("Inventory updated");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onUpdated?.();
    } catch {
      toast.error("Failed to update inventory");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <span className="text-slate-500 dark:text-gray-500 text-[10px] uppercase font-mono font-bold">Qty:</span>
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="w-16 bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs font-mono font-bold text-center focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors"
        />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-slate-500 dark:text-gray-500 text-[10px] uppercase font-mono font-bold">Alert:</span>
        <input
          type="number"
          min={0}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-16 bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs font-mono font-bold text-center focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>
      <button
        onClick={save}
        disabled={loading || (qty === currentQty && threshold === currentThreshold)}
        className="p-1.5 rounded-lg bg-primary text-black hover:bg-yellow-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        title="Save changes"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : saved ? (
          <Check className="w-3.5 h-3.5 text-emerald-950" />
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
