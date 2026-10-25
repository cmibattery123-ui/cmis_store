"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { COMPANY_INFO } from "@/lib/constants";
import {
  normalizeWhatsAppPhone,
  formatPhoneDisplay,
  formatLocalPhoneDisplay,
  buildTelUrl,
  buildGeneralWhatsAppUrl,
} from "@/lib/whatsapp";

export interface WhatsAppSettingsContextValue {
  whatsappPhone: string;
  whatsappPhoneDisplay: string;
  whatsappLocalDisplay: string;
  whatsappUrl: string;
  whatsappMessage: string;
  whatsappEnabled: boolean;
  razorpayEnabled: boolean;
  callPhone: string;
  callPhoneDisplay: string;
  telUrl: string;
  refreshSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: WhatsAppSettingsContextValue = {
  whatsappPhone: COMPANY_INFO.whatsapp,
  whatsappPhoneDisplay: COMPANY_INFO.whatsappDisplay,
  whatsappLocalDisplay: COMPANY_INFO.whatsappLocalDisplay || "0 422 422 7227",
  whatsappUrl: COMPANY_INFO.whatsappUrl,
  whatsappMessage:
    "Hello Chinna Mayil Industries, I would like to inquire about purchasing {product_name} (SKU: {sku}) priced at {price}. Please provide ordering, payment, and delivery details.",
  whatsappEnabled: true,
  razorpayEnabled: true,
  callPhone: COMPANY_INFO.phoneRaw,
  callPhoneDisplay: COMPANY_INFO.phone,
  telUrl: `tel:${COMPANY_INFO.phoneRaw}`,
  refreshSettings: async () => {},
};

const WhatsAppSettingsContext = createContext<WhatsAppSettingsContextValue>(DEFAULT_SETTINGS);

export function WhatsAppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<WhatsAppSettingsContextValue>(DEFAULT_SETTINGS);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/payments/status", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const data = json?.data;
        if (data) {
          const rawPhone = data.rawPhone || data.whatsappPhone || COMPANY_INFO.phone;
          const cleanPhone = normalizeWhatsAppPhone(rawPhone);
          const phoneDisplay = data.whatsappPhoneDisplay || formatPhoneDisplay(rawPhone);
          const localDisplay = data.whatsappLocalDisplay || formatLocalPhoneDisplay(rawPhone);
          const msg = data.whatsappMessage || DEFAULT_SETTINGS.whatsappMessage;
          const waUrl = buildGeneralWhatsAppUrl(cleanPhone);
          const tel = buildTelUrl(cleanPhone);

          setSettings((prev) => ({
            ...prev,
            whatsappPhone: cleanPhone,
            whatsappPhoneDisplay: phoneDisplay,
            whatsappLocalDisplay: localDisplay,
            whatsappUrl: waUrl,
            whatsappMessage: msg,
            whatsappEnabled: data.whatsappEnabled !== undefined ? Boolean(data.whatsappEnabled) : true,
            razorpayEnabled: data.razorpayEnabled !== undefined ? Boolean(data.razorpayEnabled) : true,
            callPhone: cleanPhone,
            callPhoneDisplay: localDisplay,
            telUrl: tel,
          }));
        }
      }
    } catch {
      // Keep existing or default settings on network error
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    const handleUpdate = () => {
      fetchSettings();
    };

    window.addEventListener("whatsapp-settings-updated", handleUpdate);
    return () => {
      window.removeEventListener("whatsapp-settings-updated", handleUpdate);
    };
  }, [fetchSettings]);

  return (
    <WhatsAppSettingsContext.Provider value={{ ...settings, refreshSettings: fetchSettings }}>
      {children}
    </WhatsAppSettingsContext.Provider>
  );
}

export function useWhatsAppSettings() {
  return useContext(WhatsAppSettingsContext);
}
