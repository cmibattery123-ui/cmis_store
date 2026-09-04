import { Suspense } from "react";
import Footer from "@/components/shared/Footer";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import ProductShowcase from "@/components/sections/ProductShowcase";
import SpecificationTable from "@/components/sections/SpecificationTable";
import Mission from "@/components/sections/Mission";
import CTA from "@/components/sections/CTA";
import { db } from "@/lib/db";

async function ProductSection() {
  let products: any[] = [];
  try {
    const fetched = await db.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        specs: { orderBy: { sortOrder: "asc" } },
      },
      take: 4,
    });
    products = fetched.map((p) => ({
      ...p,
      price: Number(p.price),
      dealerPrice: Number(p.dealerPrice),
      taxRate: Number(p.taxRate),
    }));
  } catch {
    // Graceful fallback for static prerendering builds
  }

  return <ProductShowcase products={products} />;
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Hero />
      <Features />
      <Suspense
        fallback={
          <div className="h-96 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ProductSection />
      </Suspense>
      <SpecificationTable />
      <Mission />
      <CTA />
      <Footer />
    </main>
  );
}
