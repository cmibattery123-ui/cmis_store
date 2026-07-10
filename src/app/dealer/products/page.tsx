import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils/api";
import Link from "next/link";
import Image from "next/image";
import { Package, ShoppingCart, AlertTriangle } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function DealerProductsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) return null;

  const dealer = await db.dealer.findUnique({ where: { userId: session.user.id } });
  
  const { search = "", page: pageParam } = await searchParams;
  const page = Number(pageParam ?? 1);
  const limit = 12;

  const where = {
    isActive: true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { sku: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true } },
        inventory: { select: { quantity: true, lowStockThreshold: true } },
        specs: { orderBy: { sortOrder: "asc" }, take: 3 },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const discountPercent = dealer ? Number(dealer.discountPercent) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Product Catalog</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {total} products available
          {discountPercent > 0 && (
            <span className="ml-2 text-primary font-medium">
              — Your additional discount: {discountPercent}% off
            </span>
          )}
        </p>
      </div>

      {dealer?.status !== "APPROVED" && (
        <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
          <p className="text-orange-300 text-sm">
            Your dealer account is pending approval. Prices shown are dealer prices. You will be able to place orders once approved.
          </p>
        </div>
      )}

      {/* Search */}
      <form className="relative max-w-sm">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search products…"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
        />
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product) => {
          const primaryImage = product.images[0]?.url;
          const inStock = (product.inventory?.quantity ?? 0) > 0;
          const finalPrice = dealer
            ? Number(product.dealerPrice) * (1 - discountPercent / 100)
            : Number(product.dealerPrice);

          return (
            <div key={product.id} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all">
              <div className="aspect-video bg-white/5 relative overflow-hidden">
                {primaryImage ? (
                  <Image
                    src={primaryImage}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-10 h-10 text-gray-700" />
                  </div>
                )}
                {!inStock && (
                  <div className="absolute top-3 left-3 bg-red-500/80 text-white text-xs font-bold px-2 py-1 rounded-lg">
                    Out of Stock
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="text-xs text-primary font-mono uppercase tracking-widest mb-1">{product.category.name}</div>
                <h3 className="font-heading font-bold text-white group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                <p className="text-gray-500 text-xs font-mono mt-0.5">{product.sku}</p>

                {product.specs.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {product.specs.map((spec) => (
                      <div key={spec.id} className="flex justify-between text-xs">
                        <span className="text-gray-500">{spec.label}</span>
                        <span className="text-gray-300">{spec.value}{spec.unit ? ` ${spec.unit}` : ""}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Dealer Price</p>
                      <p className="text-xl font-heading font-bold text-primary">
                        {formatCurrency(finalPrice)}
                      </p>
                      {discountPercent > 0 && (
                        <p className="text-xs text-gray-500 line-through">
                          {formatCurrency(Number(product.dealerPrice))}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/dealer/quotations/new`}
                      className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-3 py-2 rounded-xl hover:bg-primary/20 transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" /> Quote
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/dealer/products?page=${p}&search=${search}`}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-colors ${
                p === page ? "bg-primary text-black font-bold" : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
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
