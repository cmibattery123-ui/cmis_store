import type { Metadata } from "next";
import { Shield, Phone, FileText, Mail, MapPin, Clock } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import WarrantySection from "@/components/sections/WarrantySection";
import WarrantyChecker from "@/components/sections/WarrantyChecker";

export const metadata: Metadata = {
  title: "Warranty Protection | Perfect Batteries",
  description: "Industry-leading warranty support for Perfect Batteries. Learn about our free replacement periods and service coverage.",
};

export default function WarrantyPage() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-8">
              <Shield className="w-3 h-3 text-primary" />
              Protection Plan
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white uppercase tracking-tighter mb-6 leading-[0.9]">
              Built to Last.<br />
              <span className="text-primary">Backed by Trust.</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              At {COMPANY_INFO.brand}, we don&apos;t just sell batteries; we provide long-term energy solutions protected by industry-leading warranty terms.
            </p>
          </div>
        </div>
      </section>

      {/* Database Search/Checking Tool */}
      <WarrantyChecker />

      {/* Main Warranty Section (New Premium Component) */}
      <WarrantySection />

      {/* Claim Process & Support */}
      <section className="py-24 bg-black relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-white uppercase mb-8">
                How to Claim <br />
                <span className="text-primary text-2xl md:text-3xl">Your Warranty</span>
              </h2>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Verify Documents", desc: "Ensure you have your original invoice and the physical warranty card supplied at the time of purchase." },
                  { step: "02", title: "Reach Out", desc: "Contact our central service team via phone or email, or visit your nearest authorized dealer." },
                  { step: "03", title: "Technical Assessment", desc: "Our engineers will inspect the battery to verify performance levels and identify the cause of failure." },
                  { step: "04", title: "Fast Resolution", desc: "Once verified, we provide an immediate replacement or repair within 7 working days." }
                ].map((s) => (
                  <div key={s.step} className="flex gap-6 group">
                    <div className="text-2xl font-heading font-bold text-white/20 group-hover:text-primary transition-colors">{s.step}</div>
                    <div className="space-y-1">
                      <h4 className="text-white font-bold uppercase text-sm tracking-widest">{s.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-12 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[60px] rounded-full" />
               <h3 className="text-2xl font-heading font-bold text-white mb-6 uppercase">Support Center</h3>
               <p className="text-gray-400 mb-10 text-sm">Need immediate assistance with your Perfect Battery? Our support engineers are available Mon-Sat, 9AM to 6PM.</p>
               
               <div className="space-y-6 mb-10">
                 <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">Call Us</div>
                      <div className="text-white font-bold">{COMPANY_INFO.phone}</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">Email Support</div>
                      <div className="text-white font-bold">{COMPANY_INFO.email}</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">Factory Location</div>
                      <div className="text-white font-bold">Coimbatore, Tamil Nadu</div>
                    </div>
                 </div>
               </div>

               <Link
                href="/contact"
                className="block w-full bg-white text-black font-heading font-bold py-4 rounded-2xl text-center hover:bg-primary transition-all shadow-xl"
               >
                 GET IN TOUCH
               </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

