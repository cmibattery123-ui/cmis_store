"use client";

import React, { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils/api";
import Link from "next/link";
import { Eye, CheckCircle, XCircle, Clock, Loader2, RefreshCw } from "lucide-react";

const statusConfig: Record<string, { color: string; icon: any }> = {
  PENDING:   { color: "bg-amber-500/10 text-amber-600 dark:text-yellow-400 border border-amber-500/20", icon: Clock },
  APPROVED:  { color: "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20", icon: CheckCircle },
  REJECTED:  { color: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20", icon: XCircle },
  SUSPENDED: { color: "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/20", icon: XCircle },
};

const statuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadDealers() {
    setLoading(true);
    try {
      const url = `/api/admin/dealers?page=${page}&limit=20${status ? `&status=${status}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.data) {
        setDealers(json.data.dealers || []);
        setTotal(json.data.pagination?.total || 0);
        setTotalPages(json.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load dealers:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDealers();
  }, [page, status]);

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Dealer Management</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-0.5">{total} dealers registered</p>
        </div>
        <button
          onClick={() => loadDealers()}
          className="p-2 rounded-xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-700 dark:text-gray-300"
          title="Refresh dealers"
          aria-label="Refresh dealers"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setStatus(null); setPage(1); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-colors cursor-pointer ${
            !status ? "bg-primary text-black shadow-sm" : "bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          All
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-colors cursor-pointer ${
              status === s ? "bg-primary text-black shadow-sm" : "bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Dealers table */}
      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600 dark:text-primary" />
            Loading dealers...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 dark:text-gray-400 text-xs uppercase tracking-widest border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
                  <th className="text-left p-4">Business Name</th>
                  <th className="text-left p-4">Contact</th>
                  <th className="text-left p-4">Location</th>
                  <th className="text-left p-4">Registered</th>
                  <th className="text-left p-4">Quotations</th>
                  <th className="text-left p-4">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {dealers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-gray-500">
                      No dealers found
                    </td>
                  </tr>
                )}
                {dealers.map((d) => {
                  const cfg = statusConfig[d.status] ?? statusConfig.PENDING;
                  const Icon = cfg.icon;
                  return (
                    <tr key={d.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-slate-900 dark:text-white">{d.businessName}</p>
                        {d.gstNumber && <p className="text-xs text-slate-400 dark:text-gray-500 font-mono">GST: {d.gstNumber}</p>}
                      </td>
                      <td className="p-4">
                        <p className="text-slate-900 dark:text-white">{d.user?.name || "Dealer"}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">{d.user?.email}</p>
                        {d.user?.phone && <p className="text-xs text-slate-400 dark:text-gray-500 font-mono">{d.user?.phone}</p>}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-gray-400">
                        {d.city ? `${d.city}, ${d.state || ""}` : "—"}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-gray-400 text-xs font-mono">{formatDate(d.createdAt)}</td>
                      <td className="p-4 text-slate-600 dark:text-gray-400 font-mono">{d._count?.quotations || 0}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold ${cfg.color}`}>
                          <Icon className="w-3 h-3" />
                          {d.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/dealers/${d.id}`} className="text-slate-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-primary transition-colors p-1">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
