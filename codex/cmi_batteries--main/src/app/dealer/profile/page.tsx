import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { User, Building2, MapPin, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils/api";

export default async function DealerProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const dealer = await db.dealer.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });

  if (!dealer) {
    redirect("/auth/dealer-register");
  }

  const statusColor = {
    PENDING: "bg-yellow-400/10 text-yellow-400",
    APPROVED: "bg-green-400/10 text-green-400",
    REJECTED: "bg-red-400/10 text-red-400",
    SUSPENDED: "bg-gray-400/10 text-gray-400",
  }[dealer.status];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">My Profile</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your dealer account and business information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Status */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-heading font-bold text-white flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-primary" /> Account Status
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Status</p>
              <span className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${statusColor}`}>
                {dealer.status}
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Credit Limit</p>
              <p className="text-white font-medium">₹{Number(dealer.creditLimit).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Discount Rate</p>
              <p className="text-white font-medium">{Number(dealer.discountPercent)}% Off</p>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-heading font-bold text-white flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-primary" /> Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Full Name</p>
              <p className="text-white">{dealer.user.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Email Address</p>
              <p className="text-white">{dealer.user.email}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Member Since</p>
              <p className="text-white">{formatDate(dealer.user.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-heading font-bold text-white flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-primary" /> Business Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Business Name</p>
              <p className="text-white">{dealer.businessName}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">GST Number</p>
              <p className="text-white font-mono">{dealer.gstNumber || "Not Provided"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">PAN Number</p>
              <p className="text-white font-mono">{dealer.panNumber || "Not Provided"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Phone Number</p>
              <p className="text-white">{dealer.phone}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Business Address</p>
              <p className="text-white">{dealer.businessAddress}</p>
              <p className="text-gray-400 text-sm mt-0.5">{dealer.city}, {dealer.state} - {dealer.pincode}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <p className="text-sm text-gray-500">
          To update your profile information, please contact an administrator.
        </p>
      </div>
    </div>
  );
}
