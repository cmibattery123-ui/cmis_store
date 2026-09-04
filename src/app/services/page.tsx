import Footer from "@/components/shared/Footer";
import { Zap, Truck, Home, Building2, Headset, Settings, Battery, Lightbulb, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const SERVICES = [
  {
    title: "Lithium Battery Manufacturing",
    desc: "State-of-the-art production line for high-performance lithium cells and packs.",
    icon: Battery,
  },
  {
    title: "Vehicle Battery Solutions",
    desc: "Customized power solutions for electric 2-wheelers, 3-wheelers, and commercial vehicles.",
    icon: Truck,
  },
  {
    title: "Home Backup Systems",
    desc: "Next-gen energy storage for residential UPS and solar integration.",
    icon: Home,
  },
  {
    title: "Office Battery Systems",
    desc: "Uninterrupted power solutions for IT infrastructure and corporate offices.",
    icon: Building2,
  },
  {
    title: "Dealer Support",
    desc: "Comprehensive marketing and technical support for our growing dealer network.",
    icon: Headset,
  },
  {
    title: "Battery Consultation",
    desc: "Expert guidance for industrial energy requirements and custom pack design.",
    icon: Lightbulb,
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white transition-colors duration-200">
      {/* Hero */}
      <section className="pt-36 pb-20 border-b border-slate-200 dark:border-white/10 bg-gradient-to-b from-white to-slate-50 dark:from-black dark:to-[#07080C]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 text-amber-700 dark:text-primary text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
              <Zap className="w-3.5 h-3.5" />
              <span>Technical Capabilities & Engineering</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight">
              Our Services & Capabilities
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl mx-auto font-normal">
              Beyond standard manufacturing, we provide custom battery assembly, solar energy integration, and industrial engineering consultations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, i) => (
              <div key={i} className="group p-8 md:p-10 rounded-3xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 hover:border-amber-400 dark:hover:border-primary/30 transition-all shadow-md dark:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 flex items-center justify-center text-amber-600 dark:text-primary mb-6 group-hover:scale-110 transition-transform">
                    <service.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-amber-600 dark:group-hover:text-yellow-200 transition-colors">{service.title}</h3>
                  <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed font-normal">{service.desc}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-amber-600 dark:text-primary font-bold text-xs uppercase tracking-wider font-mono">
                  <span>Consult Engineering</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
