import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ProductDetailClient from "@/components/products/ProductDetailClient";
import { DEFAULT_PRODUCTS } from "@/lib/default-data";
import { db } from "@/lib/db";
import { normalizeWhatsAppPhone, formatPhoneDisplay } from "@/lib/whatsapp";

import { SITE_CONFIG } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

function findDefaultProduct(slug: string) {
  return (
    DEFAULT_PRODUCTS.find(
      (p) =>
        p.slug === slug ||
        p.slug === `${slug}-battery` ||
        p.slug === `${slug}-lithium-iron-battery` ||
        p.slug.replace(/-battery$/, "") === slug ||
        p.slug.replace(/-lithium-iron-battery$/, "") === slug ||
        p.id === slug ||
        p.sku.toLowerCase() === slug.toLowerCase()
    ) || null
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const dbProduct = await db.product.findFirst({
      where: {
        OR: [
          { slug },
          { slug: `${slug}-battery` },
          { slug: `${slug}-lithium-iron-battery` },
          { slug: slug.replace(/-battery$/, "") },
          { slug: slug.replace(/-lithium-iron-battery$/, "") },
          { id: slug },
          { sku: slug.toUpperCase() },
        ],
        isActive: true,
      },
      select: { name: true, shortDesc: true, description: true, metaTitle: true, metaDesc: true },
    });
    if (dbProduct) {
      return {
        title: dbProduct.metaTitle || `${dbProduct.name} | Chinna Mayil Industries — Perfect Batteries`,
        description: dbProduct.metaDesc || dbProduct.shortDesc || dbProduct.description,
      };
    }
  } catch {}

  const product = findDefaultProduct(slug);
  if (!product) return { title: "Battery Product | Perfect Batteries" };

  return {
    title: `${product.name} | Chinna Mayil Industries — Perfect Batteries`,
    description: product.shortDesc || product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let productData = findDefaultProduct(slug);

  try {
    const dbProduct = await db.product.findFirst({
      where: {
        OR: [
          { slug },
          { slug: `${slug}-battery` },
          { slug: `${slug}-lithium-iron-battery` },
          { slug: slug.replace(/-battery$/, "") },
          { slug: slug.replace(/-lithium-iron-battery$/, "") },
          { id: slug },
          { sku: slug.toUpperCase() },
        ],
        isActive: true,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
        inventory: true,
        specs: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (dbProduct) {
      productData = {
        ...dbProduct,
        price: Number(dbProduct.price),
        dealerPrice: Number(dbProduct.dealerPrice),
        taxRate: Number(dbProduct.taxRate),
      } as any;
    }
  } catch {
    // Graceful fallback to default data
  }

  let paymentConfig = {
    razorpayEnabled: true,
    whatsappEnabled: true,
    whatsappPhone: SITE_CONFIG.whatsapp || "917339670396",
    whatsappPhoneDisplay: SITE_CONFIG.whatsappDisplay || "+91 73396 70396",
    whatsappMessage:
      "Hello Chinna Mayil Industries, I would like to inquire about purchasing {product_name} (SKU: {sku}) priced at {price}. Please provide ordering, payment, and delivery details.",
  };

  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: [
            "RAZORPAY_ENABLED",
            "WHATSAPP_ENABLED",
            "WHATSAPP_PHONE",
            "WHATSAPP_MESSAGE",
          ],
        },
      },
    });
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));

    const razorpayEnabled =
      map["RAZORPAY_ENABLED"] !== undefined
        ? map["RAZORPAY_ENABLED"] === "true"
        : process.env.RAZORPAY_ENABLED !== undefined
        ? process.env.RAZORPAY_ENABLED === "true"
        : true;

    const whatsappEnabled =
      map["WHATSAPP_ENABLED"] !== undefined
        ? map["WHATSAPP_ENABLED"] === "true"
        : true;

    const rawPhone =
      map["WHATSAPP_PHONE"] ||
      process.env.NEXT_PUBLIC_WHATSAPP_PHONE ||
      "914224227227";

    const cleanPhone = normalizeWhatsAppPhone(rawPhone);

    const whatsappMessage =
      map["WHATSAPP_MESSAGE"] ||
      "Hello Chinna Mayil Industries, I would like to inquire about purchasing {product_name} (SKU: {sku}) priced at {price}. Please provide ordering, payment, and delivery details.";

    paymentConfig = {
      razorpayEnabled,
      whatsappEnabled,
      whatsappPhone: cleanPhone,
      whatsappPhoneDisplay: formatPhoneDisplay(rawPhone),
      whatsappMessage,
    };
  } catch {}

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white transition-colors duration-200">
      <ProductDetailClient
        slug={slug}
        initialProduct={productData as any}
        initialPaymentConfig={paymentConfig}
      />
      <Footer />
    </main>
  );
}
