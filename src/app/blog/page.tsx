import Footer from "@/components/shared/Footer";
import { Filter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const POSTS = [
  {
    title: "The Future of Electric Mobility in India",
    excerpt: "How lithium technology is revolutionizing the 2-wheeler and 3-wheeler segment in Tamil Nadu.",
    date: "May 15, 2024",
    author: "Admin",
    category: "Industry",
  },
  {
    title: "Why Lithium Beats Lead Acid for UPS",
    excerpt: "A deep dive into efficiency, cost-savings, and longevity for office power backup.",
    date: "May 10, 2024",
    author: "Technical Team",
    category: "Technology",
  },
  {
    title: "Maintaining Your Perfect Battery",
    excerpt: "Pro tips to maximize the life of your CMIP series lithium battery.",
    date: "May 05, 2024",
    author: "Service Head",
    category: "Maintenance",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen pt-20 bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white transition-colors duration-200">
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 text-amber-700 dark:text-primary text-xs font-semibold">
                Insights & Guides
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
                Battery Knowledge & News
              </h1>
              <p className="text-slate-600 dark:text-gray-400 text-base md:text-lg max-w-2xl font-normal">
                Articles on lithium battery technology, solar integration guides, and maintenance tips from our engineering team.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider">
                <Filter className="mr-2 w-4 h-4" /> Filter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {POSTS.map((post, i) => (
              <div key={i} className="group cursor-pointer bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 hover:border-amber-500/40 dark:hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between">
                <div>
                  <div className="aspect-[16/9] rounded-2xl bg-slate-100 dark:bg-[#12131A] border border-slate-200 dark:border-white/10 mb-6 overflow-hidden flex items-center justify-center relative">
                    <div className="w-full h-full bg-gradient-to-br from-amber-500/10 dark:from-primary/20 to-transparent flex items-center justify-center">
                      <span className="text-amber-600/40 dark:text-primary/30 font-black uppercase tracking-[0.4em] text-xl font-mono">Article</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-amber-600 dark:text-primary font-mono font-bold">
                      <span>{post.category}</span>
                      <span className="w-1 h-1 bg-slate-300 dark:bg-white/20 rounded-full" />
                      <span className="text-slate-400 dark:text-gray-300">{post.date}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed font-normal">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-white/10">
                  <span className="inline-flex items-center text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-primary transition-colors">
                    Read More <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
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
