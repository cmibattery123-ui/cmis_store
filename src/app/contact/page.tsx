import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Contact Us | Perfect Batteries",
  description: "Get in touch with Chinna Mayil Industries — the makers of Perfect Batteries. Located in Coimbatore, Tamil Nadu.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white transition-colors duration-200">
      {/* Header */}
      <section className="bg-gradient-to-b from-white to-slate-50 dark:from-black dark:to-[#07080C] border-b border-slate-200 dark:border-white/10 pt-36 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 text-amber-700 dark:text-primary text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Customer & Dealer Support</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight">
            Contact Perfect Batteries
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-xl mx-auto font-normal text-base md:text-lg">
            Reach our sales, engineering, and service teams for inquiries, dealerships, or technical support.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-5 shadow-sm">
                  <div className="w-12 h-12 bg-amber-500/10 dark:bg-[#161722] border border-amber-500/20 dark:border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-amber-600 dark:text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-gray-300 uppercase tracking-widest font-mono font-bold">Phone</p>
                    <a href={`tel:${COMPANY_INFO.phone.replace(/\s/g, "")}`} className="text-slate-900 dark:text-white font-bold hover:text-amber-600 dark:hover:text-primary transition-colors text-sm">
                      {COMPANY_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-5 shadow-sm">
                  <div className="w-12 h-12 bg-amber-500/10 dark:bg-[#161722] border border-amber-500/20 dark:border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-amber-600 dark:text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-gray-300 uppercase tracking-widest font-mono font-bold">Email</p>
                    <a href={`mailto:${COMPANY_INFO.email}`} className="text-slate-900 dark:text-white font-bold hover:text-amber-600 dark:hover:text-primary transition-colors text-sm">
                      {COMPANY_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-5 shadow-sm">
                  <div className="w-12 h-12 bg-amber-500/10 dark:bg-[#161722] border border-amber-500/20 dark:border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-gray-300 uppercase tracking-widest font-mono font-bold">Business Hours</p>
                    <p className="text-slate-900 dark:text-white text-sm font-bold">Mon – Sat: 9:00 AM – 6:00 PM</p>
                    <p className="text-slate-500 dark:text-gray-400 text-xs font-normal">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dealer CTA */}
            <div className="bg-amber-500/5 dark:bg-[#0C0D14] border border-amber-500/20 dark:border-primary/20 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Become a Dealer</h3>
              <p className="text-slate-600 dark:text-gray-300 text-sm mb-4 font-normal">
                Interested in stocking Perfect Batteries? Apply for our dealer program and get exclusive pricing.
              </p>
              <Link
                href="/auth/dealer-register"
                className="inline-block bg-primary text-black font-black px-5 py-2.5 rounded-2xl hover:bg-yellow-300 transition-all text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(250,255,0,0.2)]"
              >
                Apply Now
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Send us a Message</h2>
              <form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">Your Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      required
                      className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">Email Address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                      className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">Phone Number *</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    placeholder="9999999999"
                    required
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit phone number"
                    className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">Subject *</label>
                  <select id="contact-subject" name="subject" required className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-all text-sm cursor-pointer">
                    <option value="" className="bg-white dark:bg-[#12131A]">Select a topic…</option>
                    <option value="product" className="bg-white dark:bg-[#12131A]">Product Inquiry</option>
                    <option value="warranty" className="bg-white dark:bg-[#12131A]">Warranty Support</option>
                    <option value="dealer" className="bg-white dark:bg-[#12131A]">Dealer Inquiry</option>
                    <option value="bulk" className="bg-white dark:bg-[#12131A]">Bulk Order</option>
                    <option value="other" className="bg-white dark:bg-[#12131A]">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">Message *</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    placeholder="Tell us how we can help you…"
                    required
                    minLength={10}
                    className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full bg-primary text-black font-black py-4 rounded-2xl hover:bg-yellow-300 transition-all uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(250,255,0,0.3)] cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
