"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InventoryEditorProps {
  productId: string;
  currentQty: number;
  currentThreshold: number;
}

export default function InventoryEditor({ productId, currentQty, currentThreshold }: InventoryEditorProps) {
  const router = useRouter();
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
      router.refresh();
    } catch {
      toast.error("Failed to update inventory");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <span className="text-gray-500 text-[10px] uppercase">Qty:</span>
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs text-center focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-gray-500 text-[10px] uppercase">Alert at:</span>
        <input
          type="number"
          min={0}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs text-center focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>
      <button
        onClick={save}
        disabled={loading}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
          saved ? "bg-green-400/20 text-green-400" : "bg-primary/20 text-primary hover:bg-primary/30"
        }`}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
      </button>
    </div>
  );
}
