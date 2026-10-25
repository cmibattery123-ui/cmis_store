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
  Phone,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/api";
import { DEFAULT_PRODUCTS, DefaultProduct } from "@/lib/default-data";
import AddToCartButton from "@/components/products/AddToCartButton";
import { buildWhatsAppOrderUrl, buildTelUrl, formatPhoneDisplay } from "@/lib/whatsapp";

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.12-.22-.19-.47-.32" />
    </svg>
  );
}

export interface PaymentGatewayConfig {
  razorpayEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappPhone: string;
  whatsappPhoneDisplay: string;
  whatsappMessage: string;
}

interface ProductDetailClientProps {
  slug: string;
  initialProduct?: DefaultProduct | null;
  initialPaymentConfig?: PaymentGatewayConfig;
}

export default function ProductDetailClient({
  slug,
  initialProduct,
  initialPaymentConfig,
}: ProductDetailClientProps) {
  const fallbackProduct =
    initialProduct ||
    DEFAULT_PRODUCTS.find((p) => p.slug === slug) ||
    DEFAULT_PRODUCTS[0];

  const [product, setProduct] = useState<DefaultProduct>(fallbackProduct);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig>(
    initialPaymentConfig || {
      razorpayEnabled: true,
      whatsappEnabled: true,
      whatsappPhone: "914224227227",
      whatsappPhoneDisplay: "+91 422 422 7227",
      whatsappMessage:
        "Hello Chinna Mayil Industries, I would like to inquire about purchasing {product_name} (SKU: {sku}) priced at {price}. Please provide ordering, payment, and delivery details.",
    }
  );

  useEffect(() => {
    // Sync payment and WhatsApp configuration dynamically
    let isMounted = true;
    async function fetchPaymentStatus() {
      try {
        const res = await fetch("/api/payments/status");
        if (res.ok && isMounted) {
          const json = await res.json();
          if (json?.data) {
            setPaymentConfig(json.data);
          }
        }
      } catch {}
    }
    fetchPaymentStatus();
    const handleUpdate = () => {
      fetchPaymentStatus();
    };
    window.addEventListener("whatsapp-settings-updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("whatsapp-settings-updated", handleUpdate);
    };
  }, []);

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

  const whatsAppUrl = buildWhatsAppOrderUrl({
    phone: paymentConfig.whatsappPhone || "914224227227",
    template: paymentConfig.whatsappMessage,
    productName: product.name,
    sku: product.sku,
    price: product.price,
  });

  const callPhone = paymentConfig.whatsappPhone || "914224227227";
  const telUrl = buildTelUrl(callPhone);
  const callDisplay = paymentConfig.whatsappPhoneDisplay || formatPhoneDisplay(callPhone);

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
            ) : null}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 relative bg-white dark:bg-[#161617] p-2 ${
                    i === selectedImageIndex
                      ? "border-amber-500 dark:border-primary shadow-sm"
                      : "border-black/[0.06] dark:border-white/[0.08] opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </button>
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              {product.name}
            </h1>
            {product.shortDesc && (
              <p className="text-[#6E6E73] dark:text-[#86868B] mt-3 text-base sm:text-lg font-normal leading-relaxed">
                {product.shortDesc}
              </p>
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
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                  In Stock — Ready to Dispatch
                </span>
              </>
            )}
          </div>

          {/* Key specs quick view */}
          {product.specs && product.specs.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {product.specs.slice(0, 4).map((spec, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] rounded-[18px] p-4 shadow-sm"
                >
                  <div className="text-[11px] text-[#86868B] font-medium">{spec.label}</div>
                  <div className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold text-sm mt-0.5">
                    {spec.value}
                    {spec.unit ? ` ${spec.unit}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ACTION BUTTONS & ORDERING CHANNELS */}
          {!paymentConfig.razorpayEnabled ? (
            /* PROFESSIONAL WHATSAPP ORDER DESK CARD WHEN PAYMENT GATEWAY IS OFF */
            <div className="bg-white dark:bg-[#161617] border border-emerald-500/30 dark:border-emerald-500/20 rounded-[28px] p-6 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Official WhatsApp Sales & Ordering Desk
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Order Directly via WhatsApp
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
                Online gateway transactions are currently paused for routine infrastructure maintenance. Our Coimbatore factory sales desk is actively processing direct orders with factory pricing, B2B GST tax invoicing, and priority dispatch scheduling.
              </p>

              <div className="space-y-2 pt-1">
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-sm py-4 px-6 rounded-full transition-all shadow-[0_4px_16px_rgba(37,211,102,0.3)] active:scale-[0.98] cursor-pointer"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>Contact via WhatsApp — Inquire & Order</span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </a>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px] text-[#86868B] px-1 font-mono">
                  <span>Direct Sales Desk: {callDisplay}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">● Instant response during business hours</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                {product.datasheetUrl && (
                  <a
                    href={product.datasheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 border border-black/[0.08] dark:border-white/[0.12] bg-[#F5F5F7] dark:bg-[#1E1E20] text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold py-2.5 px-4 rounded-full hover:bg-black/[0.03] transition-all text-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Technical Datasheet PDF
                  </a>
                )}
                <a
                  href={telUrl}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-black/[0.08] dark:border-white/[0.12] bg-[#F5F5F7] dark:bg-[#1E1E20] text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold py-2.5 px-4 rounded-full hover:bg-black/[0.03] transition-all text-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-primary" />
                  Call Office ({callDisplay})
                </a>
              </div>
            </div>
          ) : (
            /* ONLINE CHECKOUT ACTIVE */
            <div className="space-y-3">
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

              {paymentConfig.whatsappEnabled && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs text-[#6E6E73] dark:text-[#86868B]">
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[#25D366] transition-colors"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Inquire via WhatsApp</span>
                  </a>
                  <span>•</span>
                  <a
                    href={telUrl}
                    className="inline-flex items-center gap-1.5 hover:text-amber-600 dark:hover:text-primary transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-primary" />
                    <span>Call Sales ({callDisplay})</span>
                  </a>
                </div>
              )}
            </div>
          )}

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
              <Package className="w-5 h-5 text-amber-600 dark:text-primary mx-auto mb-1.5" />
              <div className="text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold">ISO 9001 Plant</div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Specs */}
      <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-black/[0.06] dark:border-white/[0.08] pt-16">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Product Overview</h2>
          <div className="prose dark:prose-invert max-w-none text-[#6E6E73] dark:text-[#86868B] text-sm sm:text-base leading-relaxed space-y-4">
            <p>{product.description}</p>
          </div>
        </div>

        {/* Detailed Specs Table */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Technical Specifications</h2>
          <div className="bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] rounded-[24px] overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.08]">
            <div className="p-4 flex justify-between text-xs">
              <span className="text-[#86868B]">SKU / Model</span>
              <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">{product.sku}</span>
            </div>
            {product.category?.name && (
              <div className="p-4 flex justify-between text-xs">
                <span className="text-[#86868B]">Category</span>
                <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{product.category.name}</span>
              </div>
            )}
            {product.warrantyMonths && (
              <div className="p-4 flex justify-between text-xs">
                <span className="text-[#86868B]">Warranty</span>
                <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{product.warrantyMonths} Months</span>
              </div>
            )}
            {product.specs?.map((spec, i) => (
              <div key={i} className="p-4 flex justify-between text-xs">
                <span className="text-[#86868B]">{spec.label}</span>
                <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {spec.value}
                  {spec.unit ? ` ${spec.unit}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
