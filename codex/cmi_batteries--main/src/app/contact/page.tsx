import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Contact Us | Perfect Batteries",
  description: "Get in touch with Chinna Mayil Industries — the makers of Perfect Batteries. Located in Coimbatore, Tamil Nadu.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      {/* Header */}
      <section className="bg-gradient-to-b from-black to-[#0A0A0A] border-b border-white/5 pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white">Get in Touch</h1>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">
            We&apos;re here to help with your battery requirements, dealer inquiries, and warranty support.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-white mb-6">Contact Information</h2>
              <div className="space-y-4">


                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Phone</p>
                    <a href={`tel:${COMPANY_INFO.phone.replace(/\s/g, "")}`} className="text-white hover:text-primary transition-colors">
                      {COMPANY_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Email</p>
                    <a href={`mailto:${COMPANY_INFO.email}`} className="text-white hover:text-primary transition-colors">
                      {COMPANY_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Business Hours</p>
                    <p className="text-white text-sm">Mon – Sat: 9:00 AM – 6:00 PM</p>
                    <p className="text-gray-500 text-sm">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dealer CTA */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
              <h3 className="font-heading font-bold text-white mb-2">Become a Dealer</h3>
              <p className="text-gray-400 text-sm mb-4">
                Interested in stocking Perfect Batteries? Apply for our dealer program and get exclusive pricing.
              </p>
              <Link
                href="/auth/dealer-register"
                className="inline-block bg-primary text-black font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
              >
                Apply Now
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h2 className="text-xl font-heading font-bold text-white mb-6">Send us a Message</h2>
              <form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="9999999999"
                    required
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit phone number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
                  <select name="subject" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors">
                    <option value="" className="bg-[#111]">Select a topic…</option>
                    <option value="product" className="bg-[#111]">Product Inquiry</option>
                    <option value="warranty" className="bg-[#111]">Warranty Support</option>
                    <option value="dealer" className="bg-[#111]">Dealer Inquiry</option>
                    <option value="bulk" className="bg-[#111]">Bulk Order</option>
                    <option value="other" className="bg-[#111]">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Tell us how we can help you…"
                    required
                    minLength={10}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full bg-primary text-black font-heading font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors"
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
