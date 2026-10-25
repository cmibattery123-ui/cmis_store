"use client";

import React from "react";
import { Phone, Mail, Clock, PhoneCall } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { useWhatsAppSettings } from "@/store/whatsapp-settings";

interface ContactChannelsProps {
  initialPhone?: string;
  initialWaUrl?: string;
  initialTelUrl?: string;
}

export default function ContactChannels({
  initialPhone,
  initialWaUrl,
  initialTelUrl,
}: ContactChannelsProps = {}) {
  const { whatsappUrl, whatsappPhoneDisplay, whatsappLocalDisplay, callPhoneDisplay, telUrl } =
    useWhatsAppSettings();

  const displayPhone =
    whatsappLocalDisplay ||
    whatsappPhoneDisplay ||
    initialPhone ||
    COMPANY_INFO.whatsappLocalDisplay ||
    COMPANY_INFO.whatsappDisplay ||
    COMPANY_INFO.phone;

  const officePhone =
    callPhoneDisplay ||
    initialPhone ||
    COMPANY_INFO.phone;

  const directTel =
    telUrl ||
    initialTelUrl ||
    `tel:${COMPANY_INFO.phoneRaw}`;

  const directWa =
    whatsappUrl ||
    initialWaUrl ||
    COMPANY_INFO.whatsappUrl;

  return (
    <div className="space-y-4">
      {/* WhatsApp Support & Ordering Desk */}
      <div className="bg-white dark:bg-[#0C0D14] border-2 border-emerald-500/40 dark:border-emerald-500/30 rounded-3xl p-5 shadow-sm hover:border-emerald-500 transition-all">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center shrink-0 text-[#25D366]">
              <WhatsAppIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono font-bold">
                WhatsApp Direct
              </p>
              <a
                href={directWa}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-900 dark:text-white font-bold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-base font-mono"
              >
                {displayPhone}
              </a>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
          <a
            href={directWa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#25D366] text-black font-bold text-xs uppercase font-mono tracking-wider hover:bg-emerald-400 transition-all shadow-sm"
          >
            <WhatsAppIcon className="w-4 h-4" />
            WhatsApp
          </a>
          <a
            href={directTel}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold text-xs uppercase font-mono tracking-wider transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Call Direct
          </a>
        </div>
      </div>

      {/* Telephone Support Card */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 dark:bg-[#161722] border border-amber-500/20 dark:border-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-amber-600 dark:text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-gray-300 uppercase tracking-widest font-mono font-bold">
              Office Phone
            </p>
            <a
              href={directTel}
              className="text-slate-900 dark:text-white font-bold hover:text-amber-600 dark:hover:text-primary transition-colors text-sm font-mono"
            >
              {officePhone}
            </a>
          </div>
        </div>
        <a
          href={directTel}
          className="py-1.5 px-3 rounded-xl bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 text-amber-700 dark:text-primary font-mono font-bold text-xs hover:bg-amber-500/20 transition-all"
        >
          Call
        </a>
      </div>

      {/* Email Card */}
      <div className="flex items-center gap-4 bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-5 shadow-sm">
        <div className="w-12 h-12 bg-amber-500/10 dark:bg-[#161722] border border-amber-500/20 dark:border-white/10 rounded-2xl flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5 text-amber-600 dark:text-primary" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 dark:text-gray-300 uppercase tracking-widest font-mono font-bold">
            Email
          </p>
          <a
            href={`mailto:${COMPANY_INFO.email}`}
            className="text-slate-900 dark:text-white font-bold hover:text-amber-600 dark:hover:text-primary transition-colors text-sm"
          >
            {COMPANY_INFO.email}
          </a>
        </div>
      </div>

      {/* Business Hours Card */}
      <div className="flex items-center gap-4 bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-5 shadow-sm">
        <div className="w-12 h-12 bg-amber-500/10 dark:bg-[#161722] border border-amber-500/20 dark:border-white/10 rounded-2xl flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-amber-600 dark:text-primary" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 dark:text-gray-300 uppercase tracking-widest font-mono font-bold">
            Business Hours
          </p>
          <p className="text-slate-900 dark:text-white text-sm font-bold">Mon – Sat: 9:00 AM – 6:00 PM</p>
          <p className="text-slate-500 dark:text-gray-400 text-xs font-normal">Sunday: Closed</p>
        </div>
      </div>
    </div>
  );
}
