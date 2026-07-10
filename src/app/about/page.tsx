import type { Metadata } from "next";
import { COMPANY_INFO } from "@/lib/constants";
import { Zap, Award, Users, MapPin, Phone, Mail, Factory } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
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
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A]">
        {/* Hero */}
        <section className="bg-gradient-to-b from-black to-[#0A0A0A] py-24 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Zap className="w-3 h-3" /> Est. 1982
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">
              About {COMPANY_INFO.name}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              For over four decades, we have been powering lives across India with high-performance,
              reliable battery solutions under the <span className="text-primary font-semibold">Perfect Batteries</span> brand.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-primary/30 transition-colors">
                <Icon className="w-6 h-6 text-primary mx-auto mb-3" />
                <div className="text-3xl font-heading font-bold text-white">{value}</div>
                <div className="text-gray-400 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Factory Showcase */}
        <FactoryShowcase />

        {/* Story */}
        <section className="max-w-6xl mx-auto px-4 py-24 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold text-white mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Founded in 1982 by visionary entrepreneurs in Coimbatore, Chinna Mayil Industries
                  began as a small battery service workshop. Over the decades, driven by a passion
                  for quality and innovation, we grew into one of South India&apos;s most trusted
                  battery manufacturers.
                </p>
                <p>
                  Our flagship brand, <strong className="text-white">Perfect Batteries</strong>, represents
                  our commitment to delivering non-maintenance lithium batteries that outperform conventional
                  alternatives in durability, performance, and value.
                </p>
                <p>
                  Today, with a state-of-the-art manufacturing facility in Madukkarai, Coimbatore,
                  we serve customers and dealers with a robust pan-India service network.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-primary" />
                {COMPANY_INFO.address}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-heading font-bold text-white mb-4">Our Journey</h3>
              {milestones.map((m, i) => (
                <div key={m.year} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-heading font-bold shrink-0">
                      {m.year.slice(2)}
                    </div>
                    {i < milestones.length - 1 && (
                      <div className="w-px h-6 bg-white/10 mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <span className="text-primary text-xs font-mono font-bold">{m.year}</span>
                    <p className="text-gray-300 text-sm mt-0.5">{m.event}</p>
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
        <section className="max-w-6xl mx-auto px-4 py-24 border-t border-white/5">
          <h2 className="text-3xl font-heading font-bold text-white text-center mb-10">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact info */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <Phone className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Phone</p>
              <p className="text-white font-medium">{COMPANY_INFO.phone}</p>
            </div>
            <div>
              <Mail className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-white font-medium">{COMPANY_INFO.email}</p>
            </div>
            <div>
              <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Location</p>
              <p className="text-white font-medium">Madukkarai, Coimbatore</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Ready to Power Your Business?
          </h2>
          <p className="text-gray-400 mb-8">
            Join our dealer network and get access to exclusive pricing and support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/dealer-register"
              className="bg-primary text-black font-heading font-bold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Become a Dealer
            </Link>
            <Link
              href="/contact"
              className="border border-white/20 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

