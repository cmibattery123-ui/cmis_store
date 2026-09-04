"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QuotationActionsProps {
  quotation: {
    id: string;
    status: string;
    adminNotes: string;
  };
  onUpdated?: () => void;
}

export default function QuotationActions({ quotation, onUpdated }: QuotationActionsProps) {
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState(quotation.adminNotes || "");

  async function updateStatus(status: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quotations/${quotation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Update failed");
      }

      toast.success(`Quotation marked as ${status}`);
      onUpdated?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to update quotation");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors resize-none";

  return (
    <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
      <h2 className="font-heading font-bold text-slate-900 dark:text-white text-base mb-2">Actions</h2>
      <div>
        <label className="block text-xs text-slate-500 dark:text-gray-400 font-mono font-bold uppercase tracking-widest mb-1.5">Admin Notes (visible to dealer)</label>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={3}
          placeholder="Add notes, payment terms, or conditions..."
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
        {quotation.status === "PENDING" && (
          <>
            <button
              onClick={() => updateStatus("APPROVED")}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold uppercase text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve Quotation
            </button>
            <button
              onClick={() => updateStatus("REJECTED")}
              disabled={loading}
              className="w-full bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white font-mono font-bold uppercase text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject Quotation
            </button>
          </>
        )}

        {quotation.status !== "PENDING" && (
          <button
            onClick={() => updateStatus(quotation.status)}
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-white/10 text-white font-mono font-bold uppercase text-xs py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-white/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Saving..." : "Update Notes"}
          </button>
        )}
      </div>
    </div>
  );
}
