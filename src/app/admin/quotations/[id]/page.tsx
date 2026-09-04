"use client";

import React, { useState, useEffect, use } from "react";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import { FileText, Building2, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import QuotationActions from "./QuotationActions";

const statusColor: Record<string, string> = {
  PENDING:  "bg-amber-500/10 text-amber-600 dark:text-yellow-400 border border-amber-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  EXPIRED:  "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/20",
};

export default function AdminQuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quotation, setQuotation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadQuotation() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quotations/${id}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setQuotation(json.data);
      }
    } catch (err) {
      console.error("Failed to load quotation:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuotation();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-gray-400">
        <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
        <span className="text-xs font-mono">Loading quotation details...</span>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-gray-400">
        <p>Quotation not found.</p>
        <Link href="/admin/quotations" className="text-amber-600 dark:text-primary underline text-sm mt-2 inline-block">
          Return to Quotations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Quotation {quotation.quotationNo || quotation.quoteNumber}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${statusColor[quotation.status] ?? ""}`}>
              {quotation.status}
            </span>
          </div>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1 font-mono">Requested on {formatDate(quotation.createdAt)}</p>
        </div>
        <Link href="/admin/quotations" className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">
          ← Back to Quotations
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Dealer info */}
          <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-amber-600 dark:text-primary" /> Dealer Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 dark:text-gray-400 uppercase font-mono font-bold">Business Name</span>
                <p className="text-slate-900 dark:text-white font-medium mt-0.5">{quotation.dealer?.businessName}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-gray-400 uppercase font-mono font-bold">Contact Person</span>
                <p className="text-slate-900 dark:text-white mt-0.5">{quotation.dealer?.user?.name}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-gray-400 uppercase font-mono font-bold">Email</span>
                <p className="text-slate-900 dark:text-white mt-0.5">{quotation.dealer?.user?.email}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-gray-400 uppercase font-mono font-bold">Location</span>
                <p className="text-slate-900 dark:text-white mt-0.5">{quotation.dealer?.city || "—"}</p>
              </div>
            </div>
          </div>

          {/* Items requested */}
          <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-white/10">
              <h2 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600 dark:text-primary" /> Requested Items
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 dark:text-gray-400 text-xs uppercase tracking-widest border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
                    <th className="text-left p-4">Product</th>
                    <th className="text-left p-4">SKU</th>
                    <th className="text-right p-4">Qty</th>
                    <th className="text-right p-4">Unit Price</th>
                    <th className="text-right p-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(quotation.items || []).map((item: any) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-white/5">
                      <td className="p-4 font-medium text-slate-900 dark:text-white">{item.productName || item.product?.name}</td>
                      <td className="p-4 font-mono text-slate-500 dark:text-gray-400 text-xs">{item.product?.sku || "—"}</td>
                      <td className="p-4 text-right text-slate-900 dark:text-white font-mono">{item.quantity}</td>
                      <td className="p-4 text-right text-slate-900 dark:text-white font-mono">{formatCurrency(Number(item.unitPrice))}</td>
                      <td className="p-4 text-right font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(Number(item.totalPrice))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="p-4 text-right font-bold text-slate-900 dark:text-white">Total Amount:</td>
                    <td className="p-4 text-right font-bold font-mono text-amber-600 dark:text-primary text-base">
                      {formatCurrency(Number(quotation.totalAmount))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Actions panel */}
        <div>
          <QuotationActions quotation={quotation} onUpdated={loadQuotation} />
        </div>
      </div>
    </div>
  );
}
