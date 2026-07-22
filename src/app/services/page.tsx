import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Zap, Truck, Home, Building2, Headset, Settings, Battery, Lightbulb } from "lucide-react";

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
    <main className="min-h-screen pt-20 bg-black">
      <Navbar />

      <section className="py-24 border-b border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white">Our <span className="text-primary">Expertise</span></h1>
            <p className="text-gray-400 text-lg">Beyond manufacturing, we provide end-to-end energy solutions tailored for modern requirements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, i) => (
              <div key={i} className="group p-10 rounded-[3rem] bg-[#0A0A0A] border border-white/5 hover:border-primary/30 transition-all hover:bg-white/[0.02]">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                  <service.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-4">{service.title}</h3>
                <p className="text-gray-500 leading-relaxed">{service.desc}</p>
                <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-2 text-primary font-bold text-sm cursor-pointer group/link">
                  Learn More <Zap className="w-4 h-4 fill-primary group-hover/link:translate-x-1 transition-transform" />
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
