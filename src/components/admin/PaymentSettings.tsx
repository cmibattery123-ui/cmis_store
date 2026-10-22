"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Key,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Phone,
  FileText,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";

interface PaymentSettingsData {
  razorpayEnabled: boolean;
  keyId: string;
  keySecretMasked: string;
  keySecretConfigured: boolean;
  webhookSecretMasked: string;
  webhookSecretConfigured: boolean;
  whatsappEnabled?: boolean;
  whatsappPhone?: string;
  whatsappMessage?: string;
}

export default function PaymentSettings() {
  const [loading, setLoading] = useState(true);
  const [savingGateway, setSavingGateway] = useState(false);
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);

  // Razorpay states
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [keySecretMasked, setKeySecretMasked] = useState("");
  const [webhookSecretMasked, setWebhookSecretMasked] = useState("");

  // WhatsApp states
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [whatsappPhone, setWhatsappPhone] = useState("914224227227");
  const [whatsappMessage, setWhatsappMessage] = useState(
    "Hello Chinna Mayil Industries, I would like to inquire about purchasing {product_name} (SKU: {sku}) priced at {price}. Please provide ordering, payment, and delivery details."
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings/payment", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success !== false) && (data.data || data.success)) {
        const settings: PaymentSettingsData = data.data || data;
        setRazorpayEnabled(Boolean(settings.razorpayEnabled));
        setKeyId(settings.keyId || "");
        setKeySecretMasked(settings.keySecretMasked || "");
        setWebhookSecretMasked(settings.webhookSecretMasked || "");

        if (settings.whatsappEnabled !== undefined) {
          setWhatsappEnabled(Boolean(settings.whatsappEnabled));
        }
        if (settings.whatsappPhone) {
          setWhatsappPhone(settings.whatsappPhone);
        }
        if (settings.whatsappMessage) {
          setWhatsappMessage(settings.whatsappMessage);
        }
      } else if (res.status === 403) {
        toast.error("Session expired or admin privileges required. Please refresh or log in.");
      } else {
        toast.error(data.error || "Failed to load payment settings");
      }
    } catch (error) {
      console.error("[PaymentSettings Fetch]", error);
      toast.error("Error fetching payment configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnable = async (newVal: boolean) => {
    setRazorpayEnabled(newVal);
    try {
      const res = await fetch("/api/admin/settings/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ razorpayEnabled: newVal }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        toast.success(
          newVal
            ? "Razorpay Gateway Enabled — Store online checkout is active"
            : "Razorpay Gateway Disabled — Product pages will now direct customers to WhatsApp"
        );
      } else {
        setRazorpayEnabled(!newVal);
        toast.error(data.error || "Failed to update gateway status");
      }
    } catch {
      setRazorpayEnabled(!newVal);
      toast.error("Error toggling payment gateway");
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGateway(true);
    try {
      const payload: Record<string, any> = {
        razorpayEnabled,
        keyId: keyId.trim(),
      };
      if (keySecret.trim()) payload.keySecret = keySecret.trim();
      if (webhookSecret.trim()) payload.webhookSecret = webhookSecret.trim();

      const res = await fetch("/api/admin/settings/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const responseData = await res.json().catch(() => ({}));
      if (res.ok && responseData.success !== false) {
        toast.success("Razorpay Gateway Credentials Updated");
        setKeySecret("");
        setWebhookSecret("");
        await fetchSettings();
      } else {
        toast.error(responseData.error || "Failed to save credentials");
      }
    } catch (error) {
      console.error("[PaymentSettings Save Gateway]", error);
      toast.error("Error saving payment credentials");
    } finally {
      setSavingGateway(false);
    }
  };

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWhatsApp(true);
    try {
      const payload = {
        razorpayEnabled,
        whatsappEnabled,
        whatsappPhone: whatsappPhone.trim(),
        whatsappMessage: whatsappMessage.trim(),
      };

      const res = await fetch("/api/admin/settings/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const responseData = await res.json().catch(() => ({}));
      if (res.ok && responseData.success !== false) {
        toast.success("WhatsApp Order & Inquiry Settings Updated");
        await fetchSettings();
      } else {
        toast.error(responseData.error || "Failed to save WhatsApp settings");
      }
    } catch (error) {
      console.error("[PaymentSettings Save WhatsApp]", error);
      toast.error("Error saving WhatsApp settings");
    } finally {
      setSavingWhatsApp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 dark:text-gray-400 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-amber-600 dark:text-primary" />
        <span>Loading payment settings...</span>
      </div>
    );
  }

  const sampleUrl = buildWhatsAppOrderUrl({
    phone: whatsappPhone,
    template: whatsappMessage,
    productName: "PERFECT CMIP 12-12 Lithium Battery",
    sku: "CMIP-1212-LFP",
    price: 12500,
  });

  const inputCls =
    "w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors";

  return (
    <div className="space-y-8 text-slate-900 dark:text-white">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-1">
          Payment & Ordering Channels
        </h2>
        <p className="text-sm text-slate-500 dark:text-gray-400">
          Configure Razorpay online payment gateway and official WhatsApp ordering fallback.
        </p>
      </div>

      {/* RAZORPAY GATEWAY SECTION */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#07080C] space-y-6 shadow-sm">
        {/* Header Toggle Row */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 flex items-center justify-center text-amber-600 dark:text-primary shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  Razorpay Payment Gateway
                </h3>
                {razorpayEnabled ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-green-400 border border-emerald-500/30 uppercase tracking-wider font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider font-mono">
                    <XCircle className="w-3 h-3" /> Offline (WhatsApp Active)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                {razorpayEnabled
                  ? "Accept UPI, Cards, and NetBanking directly through Razorpay."
                  : "Gateway paused. Product pages and checkout automatically route customers to WhatsApp."}
              </p>
            </div>
          </div>

          {/* Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={razorpayEnabled}
              onChange={(e) => handleToggleEnable(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-7 bg-slate-300 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600 dark:text-primary" /> Razorpay Key ID (Public)
              </label>
              <input
                type="text"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                placeholder="rzp_live_..."
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-primary" /> Razorpay Key Secret (Server Only)
              </label>
              <input
                type="password"
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
                placeholder={keySecretMasked ? `Configured: ${keySecretMasked}` : "Enter Key Secret"}
                className={inputCls}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-primary" /> Webhook Secret
              </label>
              <input
                type="password"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder={webhookSecretMasked ? `Configured: ${webhookSecretMasked}` : "Enter Webhook Secret"}
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={savingGateway}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black font-mono font-bold uppercase text-xs px-5 py-2.5 rounded-xl hover:bg-black dark:hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {savingGateway && <Loader2 className="w-4 h-4 animate-spin" />}
              {savingGateway ? "Saving Credentials..." : "Update Razorpay Keys"}
            </button>
          </div>
        </form>
      </div>

      {/* WHATSAPP ORDERING & INQUIRY CONFIGURATION SECTION */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#07080C] space-y-6 shadow-sm">
        {/* WhatsApp Header Row */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  WhatsApp Ordering & Direct Inquiries
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-green-400 border border-emerald-500/30 uppercase tracking-wider font-mono">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                When Razorpay is turned off, the product page and checkout seamlessly switch to professional WhatsApp order handling.
              </p>
            </div>
          </div>

          {/* WhatsApp Enabled Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={whatsappEnabled}
              onChange={(e) => setWhatsappEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-7 bg-slate-300 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* WhatsApp Form */}
        <form onSubmit={handleSaveWhatsApp} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Business Phone Number *
              </label>
              <input
                type="text"
                required
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="e.g. 919842241101 or +91 422 422 7227"
                className={inputCls}
              />
              <p className="text-[11px] text-slate-500 dark:text-gray-400">
                Include country code without special characters (e.g., 91 for India).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Active Channel Behavior
              </label>
              <div className="p-3 rounded-xl bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-gray-300 space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {!razorpayEnabled
                    ? "🟢 Primary Order Method: Product pages show 'Order via WhatsApp'"
                    : "⚪ Standby Mode: Activates automatically whenever Razorpay is disabled"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">
                  Customers click the button to instantly message your sales desk with product specs.
                </p>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" /> Message Template
                </label>
                <div className="text-[11px] text-slate-400 dark:text-gray-500 font-mono">
                  Tokens: {"{product_name}"}, {"{sku}"}, {"{price}"}
                </div>
              </div>
              <textarea
                rows={3}
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Template message sent by customer on WhatsApp..."
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/[0.03] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono uppercase">
              <span>Customer Message Preview</span>
              <a
                href={sampleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] hover:underline"
              >
                <span>Test WhatsApp Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-700 dark:text-gray-300 italic bg-white dark:bg-[#12131A] p-3 rounded-lg border border-slate-200 dark:border-white/10 font-sans">
              &ldquo;{whatsappMessage
                .replace(/{product_name}/g, "PERFECT CMIP 12-12 Lithium Battery")
                .replace(/{sku}/g, "CMIP-1212-LFP")
                .replace(/{price}/g, "₹12,500")}&rdquo;
            </p>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={savingWhatsApp}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold uppercase text-xs px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {savingWhatsApp && <Loader2 className="w-4 h-4 animate-spin" />}
              {savingWhatsApp ? "Saving WhatsApp Settings..." : "Save WhatsApp Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
