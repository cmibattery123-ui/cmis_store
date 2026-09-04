"use client";

import { useState, useEffect } from "react";
import { CreditCard, Key, ShieldCheck, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api";

interface PaymentSettingsData {
  razorpayEnabled: boolean;
  keyId: string;
  keySecretMasked: string;
  keySecretConfigured: boolean;
  webhookSecretMasked: string;
  webhookSecretConfigured: boolean;
}

export default function PaymentSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");

  const [keySecretMasked, setKeySecretMasked] = useState("");
  const [webhookSecretMasked, setWebhookSecretMasked] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl("/api/admin/settings/payment"));
      const data = await res.json();

      if (res.ok && data.success) {
        const settings: PaymentSettingsData = data.data;
        setRazorpayEnabled(settings.razorpayEnabled);
        setKeyId(settings.keyId || "");
        setKeySecretMasked(settings.keySecretMasked || "");
        setWebhookSecretMasked(settings.webhookSecretMasked || "");
      } else {
        toast.error("Failed to load payment settings");
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
      const res = await fetch(apiUrl("/api/admin/settings/payment"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ razorpayEnabled: newVal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(newVal ? "Razorpay Gateway Enabled" : "Razorpay Gateway Disabled");
      } else {
        setRazorpayEnabled(!newVal);
        toast.error(data.error || "Failed to update gateway status");
      }
    } catch (error) {
      setRazorpayEnabled(!newVal);
      toast.error("Error toggling payment gateway");
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        razorpayEnabled,
        keyId: keyId.trim(),
      };
      if (keySecret.trim()) payload.keySecret = keySecret.trim();
      if (webhookSecret.trim()) payload.webhookSecret = webhookSecret.trim();

      const res = await fetch(apiUrl("/api/admin/settings/payment"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      if (res.ok && responseData.success) {
        toast.success("Payment Gateway Settings Updated Successfully");
        setKeySecret("");
        setWebhookSecret("");
        await fetchSettings();
      } else {
        toast.error(responseData.error || "Failed to save credentials");
      }
    } catch (error) {
      console.error("[PaymentSettings Save]", error);
      toast.error("Error saving payment credentials");
    } finally {
      setSaving(false);
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

  const inputCls = "w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors";

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-1">
            Payment Gateways
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">
            Manage Razorpay zero-trust integration & administrative settings.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#07080C] space-y-6 shadow-sm">
        {/* Header Toggle Row */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 flex items-center justify-center text-amber-600 dark:text-primary shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Razorpay Integration</h3>
                {razorpayEnabled ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-green-400 border border-emerald-500/30 uppercase tracking-wider font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 uppercase tracking-wider font-mono">
                    <XCircle className="w-3 h-3" /> Disabled
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                Accept UPI, Cards, NetBanking with zero-trust server validation.
              </p>
            </div>
          </div>

          {/* Optimistic Switch */}
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

          <div className="flex items-center justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-black font-mono font-bold uppercase text-xs px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving Configuration..." : "Update Gateway Credentials"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
