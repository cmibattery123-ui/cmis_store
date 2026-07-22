"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
}

export default function DealerActions({ dealer }: DealerActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [creditLimit, setCreditLimit] = useState(dealer.creditLimit);
  const [discountPercent, setDiscountPercent] = useState(dealer.discountPercent);
  const [notes, setNotes] = useState(dealer.notes);

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
      router.refresh();
    } catch {
      toast.error("Failed to update dealer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Credit Limit (₹)</label>
        <input
          type="number"
          value={creditLimit}
          onChange={(e) => setCreditLimit(Number(e.target.value))}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Discount (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={discountPercent}
          onChange={(e) => setDiscountPercent(Number(e.target.value))}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Admin Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {dealer.status !== "APPROVED" && (
          <button
            onClick={() => updateDealer("APPROVED")}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-green-500 text-white font-medium py-2.5 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Approve Dealer
          </button>
        )}
        {dealer.status === "APPROVED" && (
          <button
            onClick={() => updateDealer("SUSPENDED")}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white font-medium py-2.5 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            Suspend Dealer
          </button>
        )}
        {dealer.status === "PENDING" && (
          <button
            onClick={() => updateDealer("REJECTED")}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 font-medium py-2.5 rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject Application
          </button>
        )}
        <button
          onClick={() => updateDealer(dealer.status)}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 text-primary font-medium py-2.5 rounded-xl hover:bg-primary/20 transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save Settings
        </button>
      </div>
    </div>
  );
}
