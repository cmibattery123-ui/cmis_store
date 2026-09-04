import type { Metadata } from "next";
import { Shield, Phone, FileText, Mail, MapPin, Clock } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";
import Link from "next/link";
import Footer from "@/components/shared/Footer";
import WarrantySection from "@/components/sections/WarrantySection";
import WarrantyChecker from "@/components/sections/WarrantyChecker";

export const metadata: Metadata = {
  title: "Warranty Protection | Perfect Batteries",
  description: "Industry-leading warranty support for Perfect Batteries. Learn about our free replacement periods and service coverage.",
};

export default function WarrantyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white transition-colors duration-200">
      
      {/* Hero Section */}
      <section className="relative pt-36 pb-20 overflow-hidden border-b border-slate-200 dark:border-white/10 bg-gradient-to-b from-white to-slate-50 dark:from-black dark:to-[#07080C]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-amber-500/5 dark:bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 text-amber-700 dark:text-primary text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Official Warranty Center</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight">
              Built to Last. Backed by Trust.
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
              At {COMPANY_INFO.brand}, our batteries are backed by multi-year replacement guarantees and prompt service coverage across India.
            </p>
          </div>
        </div>
      </section>

      {/* Database Search/Checking Tool */}
      <WarrantyChecker />

      {/* Main Warranty Section (New Premium Component) */}
      <WarrantySection />

      {/* Claim Process & Support */}
      <section className="py-24 bg-white dark:bg-[#07080C] relative transition-colors duration-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-8">
                How to Claim Your Warranty
              </h2>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Verify Documents", desc: "Ensure you have your original invoice and the physical warranty card supplied at the time of purchase." },
                  { step: "02", title: "Reach Out", desc: "Contact our central service team via phone or email, or visit your nearest authorized dealer." },
                  { step: "03", title: "Technical Assessment", desc: "Our engineers will inspect the battery to verify performance levels and identify the cause of failure." },
                  { step: "04", title: "Fast Resolution", desc: "Once verified, we provide an immediate replacement or repair within 7 working days." }
                ].map((s) => (
                  <div key={s.step} className="flex gap-6 group">
                    <div className="text-2xl font-black font-mono text-slate-300 dark:text-white/20 group-hover:text-amber-600 dark:group-hover:text-primary transition-colors">{s.step}</div>
                    <div className="space-y-1">
                      <h4 className="text-slate-900 dark:text-white font-bold uppercase text-sm tracking-widest font-mono">{s.title}</h4>
                      <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed font-normal">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 dark:bg-primary/10 blur-[60px] rounded-full" />
               <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Support Center</h3>
               <p className="text-slate-600 dark:text-gray-300 mb-8 text-sm font-normal">Need immediate assistance with your Perfect Battery? Our support engineers are available Mon-Sat, 9AM to 6PM.</p>
               
               <div className="space-y-4 mb-8">
                 <div className="flex items-center gap-4 group p-3 rounded-2xl bg-slate-50 dark:bg-[#161722] border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-[#1E202B] flex items-center justify-center text-amber-600 dark:text-primary group-hover:bg-primary group-hover:text-black transition-all">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-gray-300 font-bold uppercase font-mono">Call Us</div>
                      <div className="text-slate-900 dark:text-white font-bold text-sm">{COMPANY_INFO.phone}</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 group p-3 rounded-2xl bg-slate-50 dark:bg-[#161722] border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-[#1E202B] flex items-center justify-center text-amber-600 dark:text-primary group-hover:bg-primary group-hover:text-black transition-all">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-gray-300 font-bold uppercase font-mono">Email Support</div>
                      <div className="text-slate-900 dark:text-white font-bold text-sm">{COMPANY_INFO.email}</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 group p-3 rounded-2xl bg-slate-50 dark:bg-[#161722] border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-[#1E202B] flex items-center justify-center text-amber-600 dark:text-primary group-hover:bg-primary group-hover:text-black transition-all">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-gray-300 font-bold uppercase font-mono">Factory Location</div>
                      <div className="text-slate-900 dark:text-white font-bold text-sm">Coimbatore, Tamil Nadu</div>
                    </div>
                 </div>
               </div>

               <Link
                href="/contact"
                className="block w-full bg-primary text-black font-black py-4 rounded-2xl text-center hover:bg-yellow-300 transition-all shadow-[0_0_20px_rgba(250,255,0,0.3)] uppercase tracking-wider text-sm"
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

