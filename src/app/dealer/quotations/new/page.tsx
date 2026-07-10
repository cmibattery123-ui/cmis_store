import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import NewQuotationForm from "./NewQuotationForm";

export default async function NewQuotationPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const dealer = await db.dealer.findUnique({ where: { userId: session.user.id } });
  if (!dealer) redirect("/dealer");

  if (dealer.status !== "APPROVED") {
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-2xl font-heading font-bold text-white">Request Quotation</h1>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
          <p className="text-orange-300 font-medium">Account Pending Approval</p>
          <p className="text-gray-400 text-sm mt-2">
            Your dealer account must be approved by an administrator before you can request quotations.
            Please check back later or contact support.
          </p>
        </div>
      </div>
    );
  }

  const products = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, sku: true, dealerPrice: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Request Quotation</h1>
        <p className="text-gray-400 text-sm mt-1">
          Submit a quotation request for bulk pricing. An admin will review and respond within 24 hours.
        </p>
      </div>
      <NewQuotationForm products={products.map((p) => ({ ...p, dealerPrice: Number(p.dealerPrice) }))} />
    </div>
  );
}
