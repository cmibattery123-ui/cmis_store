import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Search, Filter, ArrowRight, Clock, User } from "lucide-react";
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
    <main className="min-h-screen pt-20 bg-black">
      <Navbar />
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-heading font-bold text-white">Battery <span className="text-primary">Insights</span></h1>
              <p className="text-gray-400 text-lg">Stay updated with the latest in lithium technology and energy storage.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="border-white/10 text-white rounded-full"><Filter className="mr-2 w-4 h-4" /> Filter</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {POSTS.map((post, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[16/9] rounded-[2rem] bg-white/5 border border-white/5 mb-6 overflow-hidden group-hover:border-primary/50 transition-all">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center">
                    <span className="text-primary font-heading font-bold opacity-20 uppercase tracking-[0.5em] text-xl">Article</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-primary font-bold">
                    <span>{post.category}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="text-gray-500">{post.date}</span>
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-white group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{post.excerpt}</p>
                  <Button variant="link" className="text-white p-0 h-auto group-hover:text-primary">
                    Read More <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
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
