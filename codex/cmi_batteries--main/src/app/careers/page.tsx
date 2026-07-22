import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Briefcase, Zap, Rocket, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const OPENINGS = [
  { role: "Production Engineer", type: "Full-time", location: "Coimbatore" },
  { role: "Sales Manager", type: "Full-time", location: "Chennai / Bangalore" },
  { role: "BMS Developer", type: "Full-time", location: "Coimbatore" },
  { role: "Quality Analyst", type: "Full-time", location: "Coimbatore" },
];

export default function CareersPage() {
  return (
    <main className="min-h-screen pt-20 bg-black">
      <Navbar />
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white">Join the <span className="text-primary">Power</span> Team</h1>
            <p className="text-gray-400 text-lg">Build the future of energy storage with South India's fastest-growing lithium technology company.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
              { icon: Rocket, title: "Fast Growth", desc: "Scale your career alongside a pioneering industry leader." },
              { icon: Zap, title: "Innovation", desc: "Work with the latest in lithium-ion and BMS technology." },
              { icon: Heart, title: "Culture", desc: "A collaborative, professional, and diverse workplace." },
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-[#0A0A0A] border border-white/5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-heading font-bold text-white mb-8">Current Openings</h2>
            {OPENINGS.map((job, i) => (
              <div key={i} className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-primary/30 transition-all group">
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-xl font-heading font-bold text-white group-hover:text-primary transition-colors">{job.role}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-gray-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.type}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span>{job.location}</span>
                  </div>
                </div>
                <Button className="bg-white/5 hover:bg-primary hover:text-black border-white/10 px-8 rounded-full">Apply Now</Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
