import type { Metadata } from "next";
import { COMPANY_INFO } from "@/lib/constants";
import { Zap, Award, Users, MapPin, Phone, Mail, Factory, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/shared/Footer";
import FactoryShowcase from "@/components/sections/FactoryShowcase";
import FutureGoals from "@/components/sections/FutureGoals";
import TeamShowcase from "@/components/sections/TeamShowcase";

export const metadata: Metadata = {
  title: "About Us | Chinna Mayil Industries — Perfect Batteries",
  description: "Learn about Chinna Mayil Industries, the manufacturer of Perfect Batteries. 42+ years of battery manufacturing excellence in Coimbatore, Tamil Nadu.",
};

const milestones = [
  { year: "1982", event: "Chinna Mayil Industries founded in Coimbatore" },
  { year: "1995", event: "Expanded to automotive battery manufacturing" },
  { year: "2005", event: "Launched the Perfect Batteries brand" },
  { year: "2015", event: "Introduced Non-Maintenance Lithium technology" },
  { year: "2020", event: "Expanded pan-India dealer network" },
  { year: "2024", event: "Launched digital platform & dealer portal" },
  { year: "2026", event: "Incorporated as CMI Pvt. Ltd. & Recognized as a Startup by DPIIT (Govt. of India)" },
];

const stats = [
  { label: "Years of Experience", value: "42+", icon: Award },
  { label: "Products Manufactured", value: "50K+", icon: Factory },
  { label: "Active Dealers", value: "200+", icon: Users },
];

const values = [
  { title: "Quality First", desc: "Every battery undergoes rigorous quality control before leaving our facility." },
  { title: "Innovation", desc: "We continuously invest in R&D to bring cutting-edge lithium technology to market." },
  { title: "Reliability", desc: "Our customers trust us for consistent performance across all use cases." },
  { title: "Sustainability", desc: "We are committed to eco-friendly manufacturing and responsible disposal." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white transition-colors duration-200">
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-slate-50 dark:from-black dark:to-[#07080C] pt-36 pb-20 px-4 text-center border-b border-slate-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 text-amber-700 dark:text-primary text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
            <span>Established 1982 • Coimbatore, Tamil Nadu</span>
            <span className="hidden sm:inline">•</span>
            <span>DPIIT Startup: {COMPANY_INFO.dpiit}</span>
            <span className="hidden sm:inline">•</span>
            <span className="font-mono">CIN: {COMPANY_INFO.cin}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight">
            About {COMPANY_INFO.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            For over four decades, we have been powering homes, vehicles, and industries across India with high-performance,
            reliable battery solutions under the <strong className="text-slate-900 dark:text-white font-semibold">Perfect Batteries</strong> brand.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 text-center hover:border-amber-400 dark:hover:border-primary/30 transition-all shadow-md dark:shadow-xl">
              <Icon className="w-6 h-6 text-amber-600 dark:text-primary mx-auto mb-3" />
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{value}</div>
              <div className="text-slate-500 dark:text-gray-300 text-xs font-mono uppercase tracking-wider mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Factory Showcase */}
      <FactoryShowcase />

      {/* DPIIT Recognition Spotlight */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-[#1A1A12] dark:via-[#0C0D14] dark:to-[#161720] border-2 border-amber-500/30 dark:border-primary/30 p-8 md:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 dark:bg-primary/20 border border-amber-500/30 dark:border-primary/30 text-amber-800 dark:text-primary text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-600 dark:text-primary" />
                <span>National Milestone • Startup India</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                We Are Now a DPIIT Recognized Startup!
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-normal">
                A huge milestone in our journey of innovation and engineering excellence. Chinna Mayil Industries is officially recognized as an innovative startup by the <strong className="text-slate-900 dark:text-white font-semibold">Department for Promotion of Industry and Internal Trade (DPIIT)</strong>, Government of India.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-gray-400 font-semibold">DPIIT Registration No.</p>
                  <p className="text-xl font-black font-mono text-amber-600 dark:text-primary mt-1">{COMPANY_INFO.dpiit}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-gray-400 font-semibold">Corporate Identity (CIN)</p>
                  <p className="text-sm font-black font-mono text-slate-900 dark:text-white mt-2 break-all">{COMPANY_INFO.cin}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Government Recognized</span>
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-600 dark:text-primary" /> Driving Innovation</span>
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-600 dark:text-primary" /> Empowering the Future</span>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/20 max-w-sm w-full group">
                <Image
                  src={COMPANY_INFO.dpiitPoster}
                  alt="DPIIT Recognized Startup Certificate Poster"
                  width={600}
                  height={900}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-6xl mx-auto px-4 py-24 border-t border-slate-200 dark:border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Our Story</h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              <p>
                Founded in 1982 by visionary entrepreneurs in Coimbatore, Chinna Mayil Industries
                began as a small battery service workshop. Over the decades, driven by a passion
                for quality and innovation, we grew into one of South India&apos;s most trusted
                battery manufacturers.
              </p>
              <p>
                Our flagship brand, <strong className="text-slate-900 dark:text-white">Perfect Batteries</strong>, represents
                our commitment to delivering non-maintenance lithium batteries that outperform conventional
                alternatives in durability, performance, and value.
              </p>
              <p>
                Today, with a state-of-the-art manufacturing facility in Madukkarai, Coimbatore,
                we serve customers and dealers with a robust pan-India service network.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-amber-600 dark:text-primary shrink-0" />
              {COMPANY_INFO.address}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 font-mono">Our Journey</h3>
            {milestones.map((m, i) => (
              <div key={m.year} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 rounded-full flex items-center justify-center text-amber-600 dark:text-primary text-xs font-mono font-bold shrink-0">
                    {m.year.slice(2)}
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="w-px h-6 bg-slate-200 dark:border-white/10 mt-1" />
                  )}
                </div>
                <div className="pb-4">
                  <span className="text-amber-600 dark:text-primary text-xs font-mono font-bold">{m.year}</span>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5 font-normal">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Goals */}
      <FutureGoals />

      {/* Team Showcase */}
      <TeamShowcase />

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 py-24 border-t border-slate-200 dark:border-white/10">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white text-center mb-10 uppercase tracking-tight">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map(({ title, desc }) => (
            <div key={title} className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 hover:border-amber-400 dark:hover:border-primary/30 transition-all shadow-md dark:shadow-xl">
              <div className="w-10 h-10 bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-amber-600 dark:text-primary" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{title}</h3>
              <p className="text-slate-500 dark:text-gray-300 text-sm leading-relaxed font-normal">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact info */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center shadow-lg dark:shadow-xl">
          <div>
            <Phone className="w-6 h-6 text-amber-600 dark:text-primary mx-auto mb-2" />
            <p className="text-slate-500 dark:text-gray-300 text-xs font-mono uppercase tracking-wider">Phone</p>
            <p className="text-slate-900 dark:text-white font-bold mt-0.5">{COMPANY_INFO.phone}</p>
          </div>
          <div>
            <Mail className="w-6 h-6 text-amber-600 dark:text-primary mx-auto mb-2" />
            <p className="text-slate-500 dark:text-gray-300 text-xs font-mono uppercase tracking-wider">Email</p>
            <p className="text-slate-900 dark:text-white font-bold mt-0.5">{COMPANY_INFO.email}</p>
          </div>
          <div>
            <MapPin className="w-6 h-6 text-amber-600 dark:text-primary mx-auto mb-2" />
            <p className="text-slate-500 dark:text-gray-300 text-xs font-mono uppercase tracking-wider">Location</p>
            <p className="text-slate-900 dark:text-white font-bold mt-0.5">Madukkarai, Coimbatore</p>
          </div>
          <div>
            <Award className="w-6 h-6 text-amber-600 dark:text-primary mx-auto mb-2" />
            <p className="text-slate-500 dark:text-gray-300 text-xs font-mono uppercase tracking-wider">Corporate & DPIIT</p>
            <p className="text-slate-900 dark:text-white font-bold text-xs mt-0.5 font-mono">DPIIT: {COMPANY_INFO.dpiit}</p>
            <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono mt-0.5">CIN: {COMPANY_INFO.cin}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">
          Ready to Power Your Business?
        </h2>
        <p className="text-slate-600 dark:text-gray-400 mb-8 max-w-lg mx-auto font-normal">
          Join our dealer network and get access to exclusive pricing and support.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/dealer-register"
            className="bg-primary text-black font-black text-sm px-8 py-3.5 rounded-2xl hover:bg-yellow-300 transition-all shadow-[0_0_25px_rgba(250,255,0,0.3)] uppercase tracking-wider"
          >
            Become a Dealer
          </Link>
          <Link
            href="/contact"
            className="border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 text-slate-900 dark:text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all uppercase tracking-wider shadow-sm"
          >
            Contact Us
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}

