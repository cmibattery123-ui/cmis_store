import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/api";
import {
  Package, Shield, Zap, ChevronRight, CheckCircle,
  FileText, ShoppingCart, AlertTriangle
} from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: { select: { id: true, name: true, slug: true } },
      inventory: true,
      specs: { orderBy: { sortOrder: "asc" } },
    },
  });
}

async function getRelated(categoryId: string, excludeId: string) {
  return db.product.findMany({
    where: { categoryId, isActive: true, id: { not: excludeId } },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    take: 4,
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    select: { name: true, metaTitle: true, metaDesc: true, images: { take: 1 } },
  });

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.metaTitle ?? `${product.name} | Perfect Batteries`,
    description: product.metaDesc ?? `Buy ${product.name} from ${COMPANY_INFO.brand}. High-quality battery with warranty.`,
    openGraph: {
      title: product.metaTitle ?? product.name,
      description: product.metaDesc ?? "",
      images: product.images[0] ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelated(product.categoryId, product.id);
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const inStock = (product.inventory?.quantity ?? 0) > 0;
  const isLowStock =
    inStock &&
    product.inventory!.quantity <= product.inventory!.lowStockThreshold;

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-32">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/products?category=${product.categoryId}`} className="hover:text-primary transition-colors">
            {product.category.name}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white line-clamp-1">{product.name}</span>
        </nav>

        {/* Main product section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.altText ?? product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  className="object-contain p-8"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="w-20 h-20 text-gray-700" />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square bg-white/5 border border-white/10 rounded-xl overflow-hidden relative cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Image src={img.url} alt={img.altText ?? product.name} fill sizes="120px" className="object-contain p-2" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-primary font-mono uppercase tracking-widest px-2 py-1 bg-primary/10 rounded-lg">
                  {product.category.name}
                </span>
                <span className="text-xs text-gray-500 font-mono">SKU: {product.sku}</span>
              </div>
              <h1 className="text-3xl font-heading font-bold text-white">{product.name}</h1>
              {product.shortDesc && (
                <p className="text-gray-400 mt-2 text-lg">{product.shortDesc}</p>
              )}
            </div>

            {/* Price */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-3xl font-heading font-bold text-primary">
                {formatCurrency(Number(product.price))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Inclusive of {Number(product.taxRate)}% GST</p>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2">
              {!inStock ? (
                <><AlertTriangle className="w-4 h-4 text-red-400" /><span className="text-red-400 font-medium">Out of Stock</span></>
              ) : isLowStock ? (
                <><AlertTriangle className="w-4 h-4 text-orange-400" /><span className="text-orange-400 font-medium">Low Stock — Order Soon</span></>
              ) : (
                <><CheckCircle className="w-4 h-4 text-green-400" /><span className="text-green-400 font-medium">In Stock</span></>
              )}
            </div>

            {/* Key specs quick view */}
            {product.specs.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {product.specs.slice(0, 4).map((spec) => (
                  <div key={spec.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="text-xs text-gray-500 uppercase tracking-widest">{spec.label}</div>
                    <div className="text-white font-medium mt-0.5">
                      {spec.value}{spec.unit ? ` ${spec.unit}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-black font-heading font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors text-center"
              >
                Inquire Now
              </Link>
              {product.datasheetUrl && (
                <a
                  href={product.datasheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-white/20 text-white font-medium py-4 px-5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Datasheet
                </a>
              )}
            </div>

            {/* Warranty & features */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-white text-sm font-medium">{product.warrantyMonths}M Warranty</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-white text-sm font-medium">High Performance</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <CheckCircle className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-white text-sm font-medium">Made in India</div>
              </div>
            </div>
          </div>
        </div>

        {/* Full specs table */}
        {product.specs.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-heading font-bold text-white mb-6">Technical Specifications</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {product.specs.map((spec, i) => (
                    <tr
                      key={spec.id}
                      className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}
                    >
                      <td className="py-3 px-6 text-gray-400 font-medium w-1/3">{spec.label}</td>
                      <td className="py-3 px-6 text-white">
                        {spec.value}{spec.unit ? ` ${spec.unit}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Description */}
        <section className="mt-12">
          <h2 className="text-2xl font-heading font-bold text-white mb-4">Description</h2>
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
            {product.description}
          </div>
        </section>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-heading font-bold text-white mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((rel) => (
                <Link key={rel.id} href={`/products/${rel.slug}`}>
                  <div className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 transition-all">
                    <div className="aspect-square bg-white/5 relative">
                      {rel.images[0] ? (
                        <Image src={rel.images[0].url} alt={rel.name} fill sizes="(max-width: 768px) 50vw, 250px" className="object-contain p-4 group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-8 h-8 text-gray-700" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-white text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">{rel.name}</p>
                      <p className="text-primary text-sm font-bold mt-1">{formatCurrency(Number(rel.price))}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </main>
  );
}
