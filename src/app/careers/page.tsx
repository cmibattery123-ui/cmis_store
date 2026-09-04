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
    <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white pt-36 md:pt-44 transition-colors duration-200">
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 text-amber-700 dark:text-primary text-xs font-semibold">
              Careers & Opportunities
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
              Join Our Engineering & Operations Team
            </h1>
            <p className="text-slate-600 dark:text-gray-400 text-base md:text-lg font-normal max-w-2xl mx-auto">
              Build the future of clean energy storage with one of South India&apos;s leading battery manufacturers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { icon: Rocket, title: "Career Growth", desc: "Grow your career alongside experienced industry leaders and engineers." },
              { icon: Zap, title: "Engineering Rigor", desc: "Work with advanced lithium-ion and smart BMS technology." },
              { icon: Heart, title: "Great Culture", desc: "A supportive, safety-focused, and collaborative environment." },
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 text-center shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-[#161722] flex items-center justify-center text-amber-600 dark:text-primary mx-auto mb-6 shadow-sm">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-gray-300 text-sm font-normal">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
              Current Openings
            </h2>
            {OPENINGS.map((job, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-amber-500/40 dark:hover:border-primary/40 transition-all group shadow-lg">
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-primary transition-colors">{job.role}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-mono font-bold text-slate-500 dark:text-gray-300 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-primary" /> {job.type}</span>
                    <span className="w-1 h-1 bg-slate-300 dark:bg-white/20 rounded-full" />
                    <span>{job.location}</span>
                  </div>
                </div>
                <Button className="bg-primary text-black font-black uppercase tracking-wider text-xs px-8 py-3.5 rounded-2xl hover:bg-yellow-300 transition-all shadow-[0_0_15px_rgba(250,255,0,0.2)]">
                  Apply Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
