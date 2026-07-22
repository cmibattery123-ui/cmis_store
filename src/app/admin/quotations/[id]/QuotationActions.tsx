"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QuotationActionsProps {
  quotation: {
    id: string;
    status: string;
    adminNotes: string;
  };
}

export default function QuotationActions({ quotation }: QuotationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState(quotation.adminNotes);

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
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update quotation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Admin Notes (visible to dealer)</label>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={3}
          placeholder="Add notes, payment terms, or conditions..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        {quotation.status === "PENDING" && (
          <>
            <button
              onClick={() => updateStatus("APPROVED")}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-green-500 text-white font-medium py-2.5 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve Quotation
            </button>
            <button
              onClick={() => updateStatus("REJECTED")}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 font-medium py-2.5 rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject
            </button>
          </>
        )}
        
        {quotation.status !== "PENDING" && (
          <button
            onClick={() => updateStatus(quotation.status)}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 text-primary font-medium py-2.5 rounded-xl hover:bg-primary/20 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Notes
          </button>
        )}
      </div>
    </div>
  );
}
