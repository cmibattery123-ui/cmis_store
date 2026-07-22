"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Zap } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/api";
import { COMPANY_INFO } from "@/lib/constants";

type Product = {
  id: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  price: number;
  images: { url: string }[];
  specs: { label: string; value: string; unit: string | null }[];
};

export default function ProductShowcase({ products }: { products: Product[] }) {
  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white uppercase tracking-widest">
            Our Products
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16">
          {products.map((product, i) => (
            <Link href={`/products/${product.slug}`} key={product.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col items-center group cursor-pointer"
              >
                {/* Circular Frame */}
                <div className="relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full border-[6px] border-white/10 mb-6 group-hover:shadow-[0_0_40px_rgba(250,255,0,0.2)] transition-shadow duration-500">
                  {/* Colored Accent Curve */}
                  <div className="absolute inset-[-6px] border-[6px] border-transparent border-b-primary border-l-primary rounded-full transition-transform duration-700 ease-in-out group-hover:rotate-180" />
                  
                  {/* Inner White Background (as seen in screenshot) */}
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center p-6 overflow-hidden">
                    <Image
                      src={product.images[0]?.url || COMPANY_INFO.logo}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Optional Product Name Below (Keeps it accessible) */}
                <h3 className="text-white font-heading font-bold text-lg md:text-xl uppercase tracking-wider group-hover:text-primary transition-colors text-center max-w-[200px] line-clamp-2">
                  {product.name}
                </h3>
              </motion.div>
            </Link>
          ))}

          {products.length === 0 && (
            <div className="w-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-3xl">
              No products found in the database. Run the seed script!
            </div>
          )}
          {products.length > 0 && (
            <div className="w-full mt-16 flex justify-center">
              <Link href="/products" className="inline-flex items-center justify-center bg-primary text-black font-heading font-bold text-sm px-8 h-12 rounded-xl hover:bg-primary/90 transition-colors group gap-2">
                VIEW ALL PRODUCTS
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
