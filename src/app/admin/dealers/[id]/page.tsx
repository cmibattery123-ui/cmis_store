import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import { Building2, User, MapPin, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import DealerActions from "./DealerActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminDealerDetailPage({ params }: PageProps) {
  const { id } = await params;

  const dealer = await db.dealer.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true, createdAt: true } },
      quotations: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { quotationNo: true, status: true, totalAmount: true, createdAt: true },
      },
    },
  });

  if (!dealer) notFound();

  const statusColor = {
    PENDING: "bg-yellow-400/10 text-yellow-400",
    APPROVED: "bg-green-400/10 text-green-400",
    REJECTED: "bg-red-400/10 text-red-400",
    SUSPENDED: "bg-gray-400/10 text-gray-400",
  }[dealer.status];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">{dealer.businessName}</h1>
          <span className={`text-xs px-2 py-1 rounded-full font-medium mt-1 inline-block ${statusColor}`}>
            {dealer.status}
          </span>
        </div>
        <Link href="/admin/dealers" className="text-gray-500 hover:text-white text-sm transition-colors">
          ← Back to Dealers
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — dealer info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Business info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-heading font-bold text-white flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-primary" /> Business Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Business Name", value: dealer.businessName },
                { label: "GST Number", value: dealer.gstNumber ?? "Not provided" },
                { label: "PAN Number", value: dealer.panNumber ?? "Not provided" },
                { label: "Phone", value: dealer.phone },
                { label: "City", value: dealer.city },
                { label: "State", value: dealer.state },
                { label: "Pincode", value: dealer.pincode },
                { label: "Applied On", value: formatDate(dealer.createdAt) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">{label}</p>
                  <p className="text-white mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Business Address</p>
              <p className="text-white text-sm">{dealer.businessAddress}</p>
            </div>
          </div>

          {/* User info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-heading font-bold text-white flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-primary" /> Account Holder
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest">Name</p>
                <p className="text-white mt-0.5">{dealer.user.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest">Email</p>
                <p className="text-white mt-0.5">{dealer.user.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest">Phone</p>
                <p className="text-white mt-0.5">{dealer.user.phone}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest">Registered</p>
                <p className="text-white mt-0.5">{formatDate(dealer.user.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Recent quotations */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-heading font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Recent Quotations
              </h2>
            </div>
            {dealer.quotations.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No quotations yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/5">
                    <th className="text-left p-3">Quotation #</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-right p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dealer.quotations.map((q) => (
                    <tr key={q.quotationNo} className="border-b border-white/5">
                      <td className="p-3 font-mono text-primary text-xs">{q.quotationNo}</td>
                      <td className="p-3">
                        <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full">{q.status}</span>
                      </td>
                      <td className="p-3 text-gray-400 text-xs">{formatDate(q.createdAt)}</td>
                      <td className="p-3 text-right text-white">{formatCurrency(Number(q.totalAmount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right — actions */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="font-heading font-bold text-white mb-4">Account Settings</h2>
            <div className="space-y-3 text-sm mb-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest">Credit Limit</p>
                <p className="text-white font-medium">{formatCurrency(Number(dealer.creditLimit))}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest">Discount</p>
                <p className="text-white font-medium">{Number(dealer.discountPercent)}% off dealer price</p>
              </div>
              {dealer.notes && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">Admin Notes</p>
                  <p className="text-white text-sm mt-1">{dealer.notes}</p>
                </div>
              )}
            </div>
            <DealerActions dealer={{ id: dealer.id, status: dealer.status, creditLimit: Number(dealer.creditLimit), discountPercent: Number(dealer.discountPercent), notes: dealer.notes ?? "" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
