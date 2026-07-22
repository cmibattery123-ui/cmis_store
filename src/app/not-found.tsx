import Link from "next/link";
import { Search, Home } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center max-w-lg space-y-8">
          {/* 404 visual */}
          <div className="relative">
            <div className="text-[10rem] font-heading font-bold text-white/5 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Search className="w-10 h-10 text-primary" />
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-heading font-bold text-white">Page Not Found</h1>
            <p className="text-gray-400 mt-3">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-primary text-black font-heading font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Home className="w-4 h-4" /> Go Home
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 border border-white/20 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
