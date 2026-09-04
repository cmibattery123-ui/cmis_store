"use client";

import React, { useState, useEffect, use } from "react";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import { Building2, User, MapPin, FileText, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import DealerActions from "./DealerActions";

const statusColor: Record<string, string> = {
  PENDING:   "bg-amber-500/10 text-amber-600 dark:text-yellow-400 border border-amber-500/20",
  APPROVED:  "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20",
  REJECTED:  "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  SUSPENDED: "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/20",
};

export default function AdminDealerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [dealer, setDealer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadDealer() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dealers/${id}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setDealer(json.data);
      }
    } catch (err) {
      console.error("Failed to load dealer:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDealer();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-gray-400">
        <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
        <span className="text-xs font-mono">Loading dealer details...</span>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-gray-400">
        <p>Dealer not found.</p>
        <Link href="/admin/dealers" className="text-amber-600 dark:text-primary underline text-sm mt-2 inline-block">
          Return to Dealers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">{dealer.businessName}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold mt-1 inline-block ${statusColor[dealer.status] ?? ""}`}>
            {dealer.status}
          </span>
        </div>
        <Link href="/admin/dealers" className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">
          ← Back to Dealers
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — dealer info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Business info */}
          <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-amber-600 dark:text-primary" /> Business Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 dark:text-gray-400 uppercase font-mono font-bold">GST Number</span>
                <p className="font-mono text-slate-900 dark:text-white mt-0.5">{dealer.gstNumber || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-gray-400 uppercase font-mono font-bold">PAN Number</span>
                <p className="font-mono text-slate-900 dark:text-white mt-0.5">{dealer.panNumber || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-gray-400 uppercase font-mono font-bold">Discount %</span>
                <p className="text-slate-900 dark:text-white mt-0.5 font-bold">{dealer.discountPercent}%</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-gray-400 uppercase font-mono font-bold">Credit Limit</span>
                <p className="text-slate-900 dark:text-white mt-0.5 font-bold font-mono">{formatCurrency(Number(dealer.creditLimit || 0))}</p>
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-amber-600 dark:text-primary" /> Address & Location
            </h2>
            <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
              {dealer.address ? `${dealer.address}, ` : ""}
              {dealer.city ? `${dealer.city}, ` : ""}
              {dealer.state || ""} {dealer.pincode || ""}
            </p>
          </div>

          {/* Quotation History */}
          <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-amber-600 dark:text-primary" /> Recent Quotations
            </h2>
            <div className="space-y-3">
              {(dealer.quotations || []).length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-gray-500">No quotation requests yet.</p>
              ) : (
                dealer.quotations.map((q: any) => (
                  <div key={q.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-600 dark:text-primary">{q.quotationNo || q.quoteNumber}</span>
                      <p className="text-slate-500 dark:text-gray-400 text-xs mt-0.5">{formatDate(q.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(Number(q.totalAmount))}</span>
                      <span className="block text-[10px] uppercase font-bold text-amber-600 dark:text-yellow-400">{q.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right — actions */}
        <div className="space-y-4">
          <DealerActions dealer={dealer} onUpdated={loadDealer} />
        </div>
      </div>
    </div>
  );
}
