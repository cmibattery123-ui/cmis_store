import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import Link from "next/link";
import { ShoppingCart, ChevronRight } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

const statusColors: Record<string, string> = {
  PENDING:    "bg-yellow-400/10 text-yellow-400",
  CONFIRMED:  "bg-blue-400/10 text-blue-400",
  PROCESSING: "bg-indigo-400/10 text-indigo-400",
  SHIPPED:    "bg-purple-400/10 text-purple-400",
  DELIVERED:  "bg-green-400/10 text-green-400",
  CANCELLED:  "bg-red-400/10 text-red-400",
  REFUNDED:   "bg-gray-400/10 text-gray-400",
};

export default async function DealerOrdersPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) return null;

  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? 1);
  const limit = 10;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: { select: { productName: true, quantity: true, totalPrice: true } },
        payment: { select: { status: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.order.count({ where: { userId: session.user.id } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">My Orders</h1>
        <p className="text-gray-400 text-sm mt-0.5">{total} total orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl py-16 text-center">
          <ShoppingCart className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <h3 className="text-white font-medium">No orders yet</h3>
          <p className="text-gray-500 text-sm mt-1">Browse the catalog to place your first order</p>
          <Link href="/dealer/products" className="inline-block mt-4 bg-primary text-black font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm">
            Browse Catalog
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/10">
                    <th className="text-left p-4">Order #</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Items</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Payment</th>
                    <th className="text-right p-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono text-primary text-xs">{order.orderNumber}</td>
                      <td className="p-4 text-gray-400 text-xs">{formatDate(order.createdAt)}</td>
                      <td className="p-4">
                        <div className="text-gray-300 text-xs space-y-0.5">
                          {order.items.slice(0, 2).map((item, i) => (
                            <div key={i}>{item.productName} × {item.quantity}</div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-gray-500">+{order.items.length - 2} more</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] ?? ""}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {order.payment && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            order.payment.status === "PAID" ? "bg-green-400/10 text-green-400" : "bg-yellow-400/10 text-yellow-400"
                          }`}>
                            {order.payment.status}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right text-white font-medium">
                        {formatCurrency(Number(order.totalAmount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/dealer/orders?page=${p}`}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-colors ${
                    p === page ? "bg-primary text-black font-bold" : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
