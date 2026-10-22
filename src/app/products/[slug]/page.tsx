import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ProductDetailClient from "@/components/products/ProductDetailClient";
import { DEFAULT_PRODUCTS } from "@/lib/default-data";
import { db } from "@/lib/db";
import { normalizeWhatsAppPhone } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const dbProduct = await db.product.findUnique({
      where: { slug, isActive: true },
      select: { name: true, shortDesc: true, description: true, metaTitle: true, metaDesc: true },
    });
    if (dbProduct) {
      return {
        title: dbProduct.metaTitle || `${dbProduct.name} | Chinna Mayil Industries — Perfect Batteries`,
        description: dbProduct.metaDesc || dbProduct.shortDesc || dbProduct.description,
      };
    }
  } catch {}

  const product = DEFAULT_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: "Battery Product | Perfect Batteries" };

  return {
    title: `${product.name} | Chinna Mayil Industries — Perfect Batteries`,
    description: product.shortDesc || product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let productData = DEFAULT_PRODUCTS.find((p) => p.slug === slug) || null;

  try {
    const dbProduct = await db.product.findUnique({
      where: { slug, isActive: true },
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
    whatsappPhone: "914224227227",
    whatsappPhoneDisplay: "+91 422 422 7227",
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
      whatsappPhoneDisplay: rawPhone.startsWith("+") ? rawPhone : `+${cleanPhone}`,
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
