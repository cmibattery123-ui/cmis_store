import React from "react";
import Link from "next/link";
import { Zap, Globe, MessageSquare, Mail, Phone, MapPin, Clock } from "lucide-react";
import { COMPANY_INFO, NAV_LINKS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CurrentYear from "@/components/shared/CurrentYear";

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 md:gap-6">
              <div className="relative w-16 h-16 md:w-28 md:h-28">
                <img src={COMPANY_INFO.logo} alt="CMI Logo" className="object-contain w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-2xl md:text-4xl tracking-tighter leading-none text-white">
                  PERFECT
                </span>
                <span className="text-xs md:text-base mt-1 text-primary font-bold tracking-[0.2em] uppercase leading-none">
                  BATTERIES
                </span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Leading lithium battery manufacturer based in Coimbatore delivering high-performance, eco-friendly, long-life battery solutions for the next generation.
            </p>
            <div className="flex gap-4">
              {[Globe, MessageSquare, Zap].map((Icon, i) => (
                <Link key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all">
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-6 text-white uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-4">
              {NAV_LINKS.slice(0, 5).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-primary transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-6 text-white uppercase tracking-wider text-sm">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-gray-400">
                <Clock className="w-5 h-5 text-primary shrink-0" />
                <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-400">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>{COMPANY_INFO.phone}</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-400">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>{COMPANY_INFO.email}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-6 text-white uppercase tracking-wider text-sm">Location</h4>
            <a 
              href="https://www.google.com/maps/place/CHINNA+MAYIL+INDUSTRIES/@10.9125928,76.96592,982m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3ba85b0e3fd33829:0xdfbb2ff8904c8b3f!8m2!3d10.9125928!4d76.9684949!16s%2Fg%2F11z6pt1lsq!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDUwNi4wIKXMDSoASAFQAw%3D%3D" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                <p className="text-gray-400 text-sm leading-relaxed">
                  Visit us at our headquarters in Coimbatore for technical support and inquiries.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary group-hover:text-white transition-colors uppercase tracking-widest relative">
                <span className="relative">
                  Get Directions
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </span>
                <Zap className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </div>
              {/* Decorative element - now with pointer-events-none */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all pointer-events-none" />
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs text-center md:text-left">
            © <CurrentYear /> {COMPANY_INFO.name}. All rights reserved. Designed for the Future.
          </p>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-xs">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-300 text-xs">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
