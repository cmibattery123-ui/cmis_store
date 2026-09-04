"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import Link from "next/link";
import { FileText, Plus, Loader2, RefreshCw } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING:  "bg-amber-500/10 text-amber-600 dark:text-yellow-400 border border-amber-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  EXPIRED:  "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/20",
};

const STATUS_TABS = ["All", "PENDING", "APPROVED", "REJECTED", "EXPIRED"];

export default function DealerQuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  async function loadQuotations() {
    setLoading(true);
    try {
      const statusQuery = statusFilter !== "All" ? `&status=${statusFilter}` : "";
      const res = await fetch(`/api/dealer/quotations?page=${page}&limit=10${statusQuery}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setQuotations(json.data.quotations || []);
        setTotal(json.data.pagination?.total || 0);
        setTotalPages(json.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load dealer quotations:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuotations();
  }, [page, statusFilter]);

  return (
    <div className="space-y-6 max-w-5xl text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">My Quotations</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-0.5">{total} total quotations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadQuotations()}
            className="p-2 rounded-xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-700 dark:text-gray-300"
            title="Refresh quotations"
            aria-label="Refresh quotations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/dealer/quotations/new"
            className="flex items-center gap-2 bg-primary text-black font-mono font-bold uppercase text-xs px-4 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Request Quotation
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              statusFilter === s
                ? "bg-primary text-black"
                : "bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-gray-400">
          <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
          <span className="text-xs font-mono">Loading quotations...</span>
        </div>
      ) : quotations.length === 0 ? (
        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl py-16 text-center shadow-sm">
          <FileText className="w-10 h-10 text-slate-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="text-slate-900 dark:text-white font-bold">No Quotations Yet</h3>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1 mb-4">Request a quotation to get custom bulk pricing</p>
          <Link href="/dealer/quotations/new" className="inline-block bg-primary text-black font-mono font-bold uppercase text-xs px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors shadow-sm">
            Request Your First Quotation
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {quotations.map((q) => (
            <div key={q.id} className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-amber-600 dark:text-primary font-bold text-sm">{q.quotationNo}</p>
                  <p className="text-slate-500 dark:text-gray-400 text-xs font-mono mt-0.5">{formatDate(q.createdAt)}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${statusColors[q.status] ?? ""}`}>
                  {q.status}
                </span>
              </div>

              <div className="space-y-1 mb-3">
                {(q.items || []).map((item: any) => (
                  <div key={item.id} className="flex justify-between text-xs text-slate-700 dark:text-gray-300">
                    <span>{item.productName || item.product?.name} × {item.quantity}</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white">{formatCurrency(Number(item.totalPrice))}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-gray-400 font-mono">
                  {q.validUntil && (
                    <span>Valid until: {formatDate(q.validUntil)}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-slate-900 dark:text-white font-heading font-bold font-mono text-base">{formatCurrency(Number(q.totalAmount))}</span>
                  <p className="text-slate-400 dark:text-gray-500 text-[10px] uppercase font-mono">incl. GST</p>
                </div>
              </div>

              {q.adminNotes && (
                <div className="mt-3 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono uppercase font-bold tracking-widest mb-1">Admin Notes</p>
                  <p className="text-slate-700 dark:text-gray-300 text-xs">{q.adminNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-mono font-bold transition-colors cursor-pointer ${
                p === page ? "bg-primary text-black" : "bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
