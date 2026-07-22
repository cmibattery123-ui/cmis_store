import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import { FileText, Building2, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";
import QuotationActions from "./QuotationActions";

export default async function AdminQuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const quotation = await db.quotation.findUnique({
    where: { id },
    include: {
      dealer: {
        select: {
          businessName: true,
          phone: true,
          city: true,
          state: true,
          user: { select: { name: true, email: true } },
        },
      },
      items: {
        include: {
          product: { select: { name: true, sku: true, dealerPrice: true } },
        },
      },
    },
  });

  if (!quotation) notFound();

  const statusColor = {
    PENDING: "bg-yellow-400/10 text-yellow-400",
    APPROVED: "bg-green-400/10 text-green-400",
    REJECTED: "bg-red-400/10 text-red-400",
    EXPIRED: "bg-gray-400/10 text-gray-400",
  }[quotation.status];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-heading font-bold text-white">Quotation {quotation.quotationNo}</h1>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
              {quotation.status}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">Requested on {formatDate(quotation.createdAt)}</p>
        </div>
        <Link href="/admin/quotations" className="text-gray-500 hover:text-white text-sm transition-colors">
          ← Back to Quotations
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Dealer Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-heading font-bold text-white flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-primary" /> Dealer Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest">Business</p>
                <p className="text-white mt-0.5">{quotation.dealer.businessName}</p>
                <p className="text-gray-400 text-xs">{quotation.dealer.city}, {quotation.dealer.state}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest">Contact Person</p>
                <p className="text-white mt-0.5">{quotation.dealer.user.name}</p>
                <p className="text-gray-400 text-xs">{quotation.dealer.user.email} • {quotation.dealer.phone}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-heading font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Requested Items
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/5 bg-white/[0.02]">
                  <th className="text-left p-4">Product</th>
                  <th className="text-center p-4">Qty</th>
                  <th className="text-right p-4">Unit Price</th>
                  <th className="text-right p-4">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <p className="text-white font-medium">{item.product.name}</p>
                      <p className="text-gray-500 text-xs font-mono">{item.product.sku}</p>
                    </td>
                    <td className="p-4 text-center text-white">{item.quantity}</td>
                    <td className="p-4 text-right text-gray-300">{formatCurrency(Number(item.unitPrice))}</td>
                    <td className="p-4 text-right text-white font-medium">{formatCurrency(Number(item.totalPrice))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-white/[0.02]">
                <tr>
                  <td colSpan={3} className="p-4 text-right text-gray-400 font-medium">Subtotal</td>
                  <td className="p-4 text-right text-white font-bold">{formatCurrency(Number(quotation.totalAmount) - Number(quotation.taxAmount))}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right text-gray-400 text-xs uppercase tracking-widest">Tax</td>
                  <td className="px-4 py-2 text-right text-gray-400 text-xs">{formatCurrency(Number(quotation.taxAmount))}</td>
                </tr>
                <tr className="border-t border-white/10">
                  <td colSpan={3} className="p-4 text-right text-white font-heading font-bold text-lg">Total Amount</td>
                  <td className="p-4 text-right text-primary font-heading font-bold text-xl">{formatCurrency(Number(quotation.totalAmount))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-heading font-bold text-white mb-4">Quotation Status</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">Valid Until</p>
                  <p>{quotation.validUntil ? formatDate(quotation.validUntil) : "Not set"}</p>
                </div>
              </div>
              
              {quotation.notes && (
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Dealer Notes
                  </p>
                  <p className="text-gray-300 text-sm italic">"{quotation.notes}"</p>
                </div>
              )}
            </div>

            <QuotationActions quotation={{ id: quotation.id, status: quotation.status, adminNotes: quotation.adminNotes ?? "" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
