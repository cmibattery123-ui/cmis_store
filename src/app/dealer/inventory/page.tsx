import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Package, Search, AlertTriangle } from "lucide-react";
import Image from "next/image";

export default async function DealerInventoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const dealer = await db.dealer.findUnique({ where: { userId: session.user.id } });
  if (!dealer) redirect("/dealer");

  const products = await db.product.findMany({
    where: { isActive: true },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true } },
      inventory: { select: { quantity: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Live Inventory</h1>
        <p className="text-gray-400 text-sm mt-1">
          Check real-time stock availability for all products before placing an order.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/10 bg-white/[0.02]">
                <th className="p-4 font-medium">Product Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">SKU</th>
                <th className="p-4 font-medium">Availability</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const qty = p.inventory?.quantity ?? 0;
                  const inStock = qty > 0;
                  
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                            {p.images[0]?.url ? (
                              <Image src={p.images[0].url} alt={p.name} fill sizes="40px" className="object-contain p-1" />
                            ) : (
                              <Package className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <span className="text-white font-medium line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-400">{p.category.name}</td>
                      <td className="p-4 text-gray-500 font-mono text-xs">{p.sku}</td>
                      <td className="p-4">
                        {inStock ? (
                          <div className="flex flex-col">
                            <span className="text-green-400 font-medium text-xs px-2 py-1 bg-green-400/10 rounded-full w-fit mb-1">
                              In Stock
                            </span>
                            <span className="text-gray-500 text-xs">{qty} units available</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-400 font-medium text-xs px-2 py-1 bg-red-400/10 rounded-full w-fit">
                            <AlertTriangle className="w-3 h-3" /> Out of Stock
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
