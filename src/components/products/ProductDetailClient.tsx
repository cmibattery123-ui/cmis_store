"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Shield,
  Zap,
  CheckCircle,
  FileText,
  Package,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/api";
import { DEFAULT_PRODUCTS, DefaultProduct } from "@/lib/default-data";
import AddToCartButton from "@/components/products/AddToCartButton";

export default function ProductDetailClient({
  slug,
  initialProduct,
}: {
  slug: string;
  initialProduct?: DefaultProduct | null;
}) {
  const fallbackProduct =
    initialProduct ||
    DEFAULT_PRODUCTS.find((p) => p.slug === slug) ||
    DEFAULT_PRODUCTS[0];

  const [product, setProduct] = useState<DefaultProduct>(fallbackProduct);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    // Skip if initial product was already provided for this slug
    if (initialProduct && initialProduct.slug === slug) return;
    if (!slug) return;

    let isMounted = true;
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok && isMounted) {
          const json = await res.json();
          if (json?.data?.product) {
            setProduct(json.data.product);
          }
        }
      } catch {
        // Fallback already in state
      }
    }
    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [slug, initialProduct]);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [{ url: "/assets/batt1-removebg-preview.png", isPrimary: true, sortOrder: 0 }];

  const activeImage =
    images[selectedImageIndex]?.url || images[0]?.url || "/assets/batt1-removebg-preview.png";
  const inStock = (product.inventory?.quantity ?? 1) > 0;
  const isLowStock =
    inStock && (product.inventory?.quantity ?? 1) <= (product.inventory?.lowStockThreshold ?? 10);

  const relatedProducts = DEFAULT_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-36 pb-24 text-[#1D1D1F] dark:text-[#F5F5F7]">
      {/* Breadcrumb - Apple Minimalist */}
      <nav className="flex items-center gap-2 text-xs text-[#86868B] mb-8">
        <Link href="/" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">
          Store
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] rounded-[32px] overflow-hidden relative shadow-sm flex items-center justify-center p-8">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="object-contain p-8 drop-shadow-sm"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="w-20 h-20 text-[#86868B]" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`aspect-square bg-white dark:bg-[#161617] border rounded-[18px] overflow-hidden relative cursor-pointer transition-all ${
                    selectedImageIndex === i ? "border-amber-500 dark:border-primary ring-2 ring-amber-500/20 dark:ring-primary/20 shadow-sm" : "border-black/[0.06] dark:border-white/[0.08] hover:border-black/20"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={product.name}
                    fill
                    sizes="120px"
                    className="object-contain p-2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold text-amber-600 dark:text-primary">
                {product.category?.name || "LiFePO4 Battery"}
              </span>
              <span className="text-xs text-[#86868B]">SKU: {product.sku}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{product.name}</h1>
            {product.shortDesc && (
              <p className="text-[#6E6E73] dark:text-[#86868B] mt-3 text-base sm:text-lg font-normal leading-relaxed">{product.shortDesc}</p>
            )}
          </div>

          {/* Price Card */}
          <div className="bg-[#F5F5F7] dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] rounded-[24px] p-6 shadow-sm">
            <div className="text-3xl sm:text-4xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {formatCurrency(Number(product.price))}
            </div>
            <p className="text-xs text-[#86868B] mt-1 font-normal">
              Inclusive of all applicable taxes ({Number(product.taxRate || 18)}% GST)
            </p>
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            {!inStock ? (
              <>
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-red-500 font-semibold text-xs">Out of Stock</span>
              </>
            ) : isLowStock ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-amber-500 font-semibold text-xs">Low Stock — Order Soon</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">In Stock — Ready to Dispatch</span>
              </>
            )}
          </div>

          {/* Key specs quick view */}
          {product.specs && product.specs.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {product.specs.slice(0, 4).map((spec, i) => (
                <div key={i} className="bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] rounded-[18px] p-4 shadow-sm">
                  <div className="text-[11px] text-[#86868B] font-medium">{spec.label}</div>
                  <div className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold text-sm mt-0.5">
                    {spec.value}
                    {spec.unit ? ` ${spec.unit}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <AddToCartButton
              inStock={inStock}
              product={{
                ...product,
                price: Number(product.price),
                dealerPrice: Number(product.dealerPrice || product.price),
                taxRate: Number(product.taxRate || 18),
                weight: null,
              }}
            />
            {product.datasheetUrl && (
              <a
                href={product.datasheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#161617] text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold py-3.5 px-6 rounded-full hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all text-xs shadow-sm"
              >
                <FileText className="w-4 h-4" />
                Datasheet PDF
              </a>
            )}
          </div>

          {/* Warranty & trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] rounded-[20px] p-4 text-center shadow-sm">
              <Shield className="w-5 h-5 text-amber-600 dark:text-primary mx-auto mb-1.5" />
              <div className="text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold">
                {product.warrantyMonths || 24}M Warranty
              </div>
            </div>
            <div className="bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] rounded-[20px] p-4 text-center shadow-sm">
              <Zap className="w-5 h-5 text-amber-600 dark:text-primary mx-auto mb-1.5" />
              <div className="text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold">Fast Charging</div>
            </div>
            <div className="bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] rounded-[20px] p-4 text-center shadow-sm">
              <CheckCircle className="w-5 h-5 text-amber-600 dark:text-primary mx-auto mb-1.5" />
              <div className="text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold">Made in India</div>
            </div>
          </div>
        </div>
      </div>

      {/* Full specs table */}
      {product.specs && product.specs.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-6">
            Technical Specifications
          </h2>
          <div className="bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] rounded-[28px] overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {product.specs.map((spec, i) => (
                  <tr
                    key={i}
                    className="hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-6 text-[#6E6E73] dark:text-[#86868B] text-xs font-medium w-1/3">{spec.label}</td>
                    <td className="py-4 px-6 text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">
                      {spec.value}
                      {spec.unit ? ` ${spec.unit}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Description */}
      <section className="mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-4">Description</h2>
        <div className="prose dark:prose-invert max-w-none text-[#6E6E73] dark:text-[#86868B] leading-relaxed font-normal bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] rounded-[28px] p-6 md:p-8 shadow-sm">
          {product.description}
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <Link key={rel.id} href={`/products/${rel.slug}`}>
                <div className="group bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] rounded-[24px] overflow-hidden hover:shadow-lg dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all shadow-sm p-4">
                  <div className="aspect-square bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[18px] relative mb-3 overflow-hidden flex items-center justify-center">
                    <Image
                      src={rel.images[0]?.url || "/assets/batt1-removebg-preview.png"}
                      alt={rel.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 250px"
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div>
                    <p className="text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold group-hover:text-amber-600 dark:group-hover:text-primary transition-colors line-clamp-2">
                      {rel.name}
                    </p>
                    <p className="text-amber-600 dark:text-primary text-xs font-bold mt-1">
                      {formatCurrency(Number(rel.price))}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
