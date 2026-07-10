import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils/api";
import { ShoppingCart, Package, ChevronRight } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-400/10 text-yellow-400",
  CONFIRMED: "bg-blue-400/10 text-blue-400",
  PROCESSING: "bg-indigo-400/10 text-indigo-400",
  SHIPPED: "bg-purple-400/10 text-purple-400",
  DELIVERED: "bg-green-400/10 text-green-400",
  CANCELLED: "bg-red-400/10 text-red-400",
  REFUNDED: "bg-gray-400/10 text-gray-400",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function CustomerOrdersPage({ searchParams }: PageProps) {
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">My Orders</h1>
        <p className="text-gray-400 text-sm mt-1">{total} total orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl py-20 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white font-medium">No orders yet</h3>
          <p className="text-gray-500 text-sm mt-1">Start shopping to see your orders here</p>
          <Link href="/products" className="inline-block mt-4 bg-primary text-black font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/customer/orders/${order.id}`}>
              <div className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-primary font-medium">{order.orderNumber}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status] ?? "bg-gray-400/10 text-gray-400"}`}>
                      {order.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" />
                  </div>
                </div>

                <div className="space-y-1">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{item.productName} × {item.quantity}</span>
                      <span className="text-gray-400">{formatCurrency(Number(item.totalPrice))}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-gray-500 text-xs">+{order.items.length - 3} more items</p>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                    {order.payment && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.payment.status === "PAID"
                          ? "bg-green-400/10 text-green-400"
                          : "bg-yellow-400/10 text-yellow-400"
                      }`}>
                        {order.payment.status}
                      </span>
                    )}
                  </div>
                  <span className="text-white font-heading font-bold">{formatCurrency(Number(order.totalAmount))}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/customer/orders?page=${p}`}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                p === page ? "bg-primary text-black" : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
