"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Zap, Battery, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/api";
import { DEFAULT_PRODUCTS } from "@/lib/default-data";

type Product = {
  id: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  price: number;
  dealerPrice?: number;
  taxRate?: number;
  images: { url: string }[];
  specs?: { label: string; value: string; unit: string | null }[];
};

export default function ProductShowcase({ products }: { products: Product[] }) {
  const displayProducts = products && products.length > 0 ? products : DEFAULT_PRODUCTS.slice(0, 4);

  return (
    <section className="py-24 sm:py-32 bg-white dark:bg-[#000000] relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header - Apple Style */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-16">
          <div className="space-y-2">
            <div>
              <span className="text-xs md:text-sm font-semibold tracking-normal text-amber-600 dark:text-primary">
                Featured Models
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-[-0.025em]">
              Explore the Lineup.
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-primary hover:underline transition-all group"
          >
            <span>All products</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Product Cards Grid - Apple Store Card Aesthetic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, i) => {
            const imageUrl = product.images?.[0]?.url || "/assets/batt1-removebg-preview.png";
            const price = Number(product.price) || 0;

            return (
              <Link href={`/products/${product.slug}`} key={product.id} className="group">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  className="h-full flex flex-col justify-between rounded-[24px] bg-[#F5F5F7] dark:bg-[#161617] border border-black/[0.04] dark:border-white/[0.08] p-6 hover:shadow-xl dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:-translate-y-1"
                >
                  {/* Image Showcase Pedestal */}
                  <div className="relative aspect-square w-full rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center p-6 mb-5 overflow-hidden">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        width={220}
                        height={220}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain max-h-[160px] drop-shadow-sm group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F5F5F7] dark:bg-black/70 backdrop-blur-md border border-black/[0.06] dark:border-white/10 text-[10px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm">
                        5-Yr Warranty
                      </span>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-semibold text-amber-600 dark:text-primary mb-1">
                        LiFePO4 Storage
                      </div>
                      <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-base group-hover:text-amber-600 dark:group-hover:text-yellow-200 transition-colors line-clamp-2 mb-1.5 tracking-tight">
                        {product.name}
                      </h3>
                      {product.shortDesc && (
                        <p className="text-xs text-[#6E6E73] dark:text-[#86868B] line-clamp-2 mb-4 leading-relaxed font-normal">
                          {product.shortDesc}
                        </p>
                      )}
                    </div>

                    {/* Price and CTA Row */}
                    <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-[#86868B] font-medium">Starting at</div>
                        <div className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                          {formatCurrency(price)}
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-white dark:bg-[#242426] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center text-[#1D1D1F] dark:text-white group-hover:bg-primary group-hover:text-black group-hover:border-transparent transition-all shadow-sm">
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-black font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-yellow-300 transition-all shadow-sm active:scale-[0.98]"
          >
            <span>View All Battery Models</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
