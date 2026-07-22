import { Suspense } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import ProductShowcase from "@/components/sections/ProductShowcase";
import SpecificationTable from "@/components/sections/SpecificationTable";
import Mission from "@/components/sections/Mission";
import CTA from "@/components/sections/CTA";
import { db } from "@/lib/db";

async function ProductSection() {
  const products = await db.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      specs: { orderBy: { sortOrder: "asc" } },
    },
    take: 4,
  });

  const serializedProducts = products.map(p => ({
    ...p,
    price: Number(p.price),
    dealerPrice: Number(p.dealerPrice),
    taxRate: Number(p.taxRate)
  }));

  return <ProductShowcase products={serializedProducts as any} />;
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <ProductSection />
      </Suspense>
      <SpecificationTable />
      <Mission />
      <CTA />
      <Footer />
    </main>
  );
}
