"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface DealerActionsProps {
  dealer: {
    id: string;
    status: string;
    creditLimit: number;
    discountPercent: number;
    notes: string;
  };
  onUpdated?: () => void;
}

export default function DealerActions({ dealer, onUpdated }: DealerActionsProps) {
  const [loading, setLoading] = useState(false);
  const [creditLimit, setCreditLimit] = useState(dealer.creditLimit || 0);
  const [discountPercent, setDiscountPercent] = useState(dealer.discountPercent || 0);
  const [notes, setNotes] = useState(dealer.notes || "");

  async function updateDealer(status: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dealers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dealer.id, status, creditLimit, discountPercent, notes }),
      });

      if (!res.ok) throw new Error("Update failed");
      toast.success(`Dealer ${status.toLowerCase()} successfully`);
      onUpdated?.();
    } catch {
      toast.error("Failed to update dealer");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors";

  return (
    <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
      <h2 className="font-heading font-bold text-slate-900 dark:text-white text-base mb-2">Manage Dealer</h2>
      <div>
        <label className="block text-xs text-slate-500 dark:text-gray-400 font-mono font-bold uppercase tracking-widest mb-1.5">Credit Limit (₹)</label>
        <input
          type="number"
          value={creditLimit}
          onChange={(e) => setCreditLimit(Number(e.target.value))}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 dark:text-gray-400 font-mono font-bold uppercase tracking-widest mb-1.5">Discount (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={discountPercent}
          onChange={(e) => setDiscountPercent(Number(e.target.value))}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 dark:text-gray-400 font-mono font-bold uppercase tracking-widest mb-1.5">Admin Notes</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes about this dealer…"
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
        <button
          onClick={() => updateDealer(dealer.status)}
          disabled={loading}
          className="w-full bg-slate-900 dark:bg-white/10 text-white font-mono font-bold uppercase text-xs py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-white/20 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>

        {dealer.status !== "APPROVED" && (
          <button
            onClick={() => updateDealer("APPROVED")}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold uppercase text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" /> Approve Dealer
          </button>
        )}

        {dealer.status !== "REJECTED" && dealer.status !== "SUSPENDED" && (
          <button
            onClick={() => updateDealer("REJECTED")}
            disabled={loading}
            className="w-full bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white font-mono font-bold uppercase text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <XCircle className="w-4 h-4" /> Reject / Suspend
          </button>
        )}
      </div>
    </div>
  );
}
