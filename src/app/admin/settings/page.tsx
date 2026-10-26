"use client";

import { useState, useRef, useEffect } from "react";
import { User, Store, Shield, Bell, Save, Key, Mail, Globe, CreditCard, Loader2, MessageCircle, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useSession } from "next-auth/react";
import PaymentSettings from "@/components/admin/PaymentSettings";

export default function AdminSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security PIN states
  const [adminPin, setAdminPin] = useState("123456");
  const [newAdminPin, setNewAdminPin] = useState("123456");
  const [savingAdminPin, setSavingAdminPin] = useState(false);
  const [adminPinMsg, setAdminPinMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (session?.user?.name) {
      setFullName(session.user.name);
    }
    if (session?.user?.email) {
      setAdminEmail(session.user.email);
    }
    if (session?.user?.image) {
      setAvatarUrl(session.user.image);
    }
  }, [session?.user?.name, session?.user?.email, session?.user?.image]);

  useEffect(() => {
    async function loadAdminPin() {
      try {
        const res = await fetch("/api/user/pin");
        if (res.ok) {
          const json = await res.json();
          if (json.data?.currentPin) {
            setAdminPin(json.data.currentPin);
            setNewAdminPin(json.data.currentPin);
          }
        }
      } catch (err) {
        console.error("Failed to load admin PIN:", err);
      }
    }
    loadAdminPin();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (activeTab === "profile") {
        const payload: { name?: string; image?: string; email?: string } = {};
        if (fullName.trim()) payload.name = fullName.trim();
        if (avatarUrl) payload.image = avatarUrl;
        if (adminEmail.trim()) payload.email = adminEmail.trim();

        const res = await fetch("/api/admin/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Failed to save profile");
        
        // Force session update so the header avatar, email, and name change
        await updateSession({
          name: fullName.trim(),
          email: adminEmail.trim(),
          ...(avatarUrl && { image: avatarUrl }),
        });
      }
      
      setTimeout(() => {
        setLoading(false);
        toast.success("Settings saved successfully!");
      }, 500);
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message || "Failed to save settings");
    }
  };

  const handleSaveAdminPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAdminPin(true);
    setAdminPinMsg(null);

    const cleanPin = newAdminPin.trim();
    if (cleanPin.length < 4 || cleanPin.length > 8) {
      setAdminPinMsg({ type: "error", text: "Security PIN must be between 4 and 8 digits." });
      setSavingAdminPin(false);
      return;
    }

    try {
      const res = await fetch("/api/user/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: cleanPin }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setAdminPin(cleanPin);
        setAdminPinMsg({ type: "success", text: "Security PIN updated successfully!" });
        toast.success("Security PIN updated successfully!");
      } else {
        setAdminPinMsg({ type: "error", text: json.error || "Failed to update Security PIN." });
        toast.error(json.error || "Failed to update Security PIN.");
      }
    } catch {
      setAdminPinMsg({ type: "error", text: "An error occurred while saving Security PIN." });
      toast.error("Failed to update Security PIN.");
    } finally {
      setSavingAdminPin(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      toast.error("File is too large. Maximum size is 800KB.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data.url) {
        setAvatarUrl(data.url);
        toast.success("Avatar uploaded! Click 'Save Settings' to apply.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload avatar image");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Store },
    { id: "profile", label: "Profile", icon: User },
    { id: "payments", label: "Payment Gateway", icon: CreditCard },
    { id: "whatsapp", label: "WhatsApp & Inquiries", icon: MessageCircle },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const inputCls = "w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors text-sm";

  return (
    <div className="space-y-8 max-w-5xl text-slate-900 dark:text-white">
      <div>
        <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
          Manage your store preferences, administrator profile, and system configurations.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-black shadow-sm"
                  : "text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm">
          {activeTab === "payments" ? (
            <PaymentSettings defaultSection="gateway" />
          ) : activeTab === "whatsapp" ? (
            <PaymentSettings defaultSection="whatsapp" />
          ) : (
            <form onSubmit={handleSave}>
              {/* GENERAL TAB */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-1">General Store Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Configure your primary business details visible to customers.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold">Store Name</label>
                      <input type="text" defaultValue="CMI Batteries" className={inputCls} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold">Support Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                        <input type="email" defaultValue="support@cmibattery.com" className={`${inputCls} pl-11`} />
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold">Business Address</label>
                      <textarea rows={3} defaultValue="123 Industrial Phase, Main Highway, City, State - 100000" className={`${inputCls} resize-none`} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold">Default Currency</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                        <select className={`${inputCls} pl-11 appearance-none`}>
                          <option className="bg-white dark:bg-[#12131A] text-slate-900 dark:text-white">INR (₹) - Indian Rupee</option>
                          <option className="bg-white dark:bg-[#12131A] text-slate-900 dark:text-white">USD ($) - US Dollar</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold">Tax/GST Number</label>
                      <input type="text" defaultValue="22AAAAA0000A1Z5" className={`${inputCls} font-mono`} />
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-1">Administrator Profile</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Update your personal account details.</p>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-200 dark:border-white/10">
                    <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary text-2xl font-bold relative overflow-hidden shrink-0">
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt="Admin Avatar" fill className="object-cover" />
                      ) : (
                        "AD"
                      )}
                    </div>
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarUpload} 
                        accept="image/jpeg, image/png, image/gif" 
                        className="hidden" 
                      />
                      <button 
                        type="button" 
                        disabled={uploadingAvatar}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-xl text-xs font-mono font-bold uppercase transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {uploadingAvatar && <Loader2 className="w-4 h-4 animate-spin" />}
                        {uploadingAvatar ? "Uploading..." : "Change Avatar"}
                      </button>
                      <p className="text-xs text-slate-400 dark:text-gray-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter full name"
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold">Personal Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                        <input
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="admin@cmibattery.com"
                          className={`${inputCls} pl-11 font-mono`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === "security" && (
                <div className="space-y-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-1">Security & Access PIN</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Manage your login Security PIN and account authentication.</p>
                  </div>

                  {/* Security PIN Box */}
                  <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-600 dark:text-primary" />
                        Administrator Security PIN
                      </h3>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-primary border border-amber-500/20 px-2.5 py-1 rounded-full">
                        Required for Login
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">
                      Your 4–8 digit Security PIN is required when signing into the administrator panel (Default: <strong className="text-slate-900 dark:text-white font-bold">123456</strong>).
                    </p>

                    {adminPinMsg && (
                      <div
                        className={`text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-mono ${
                          adminPinMsg.type === "success"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        }`}
                      >
                        {adminPinMsg.type === "success" ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        {adminPinMsg.text}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-2">
                      <div className="space-y-1.5 flex-1 max-w-xs">
                        <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold">
                          Set Security PIN
                        </label>
                        <input
                          type="text"
                          maxLength={8}
                          value={newAdminPin}
                          onChange={(e) => setNewAdminPin(e.target.value)}
                          placeholder="123456"
                          className={`${inputCls} font-mono tracking-widest text-center text-base`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveAdminPin}
                        disabled={savingAdminPin || (!newAdminPin.trim()) || (newAdminPin.trim() === adminPin)}
                        className="flex items-center justify-center gap-2 bg-primary text-black font-mono font-bold uppercase text-xs px-6 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50 cursor-pointer shadow-sm h-[42px]"
                      >
                        {savingAdminPin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Update PIN
                      </button>
                    </div>
                  </div>

                  {/* Password Settings */}
                  <div className="pt-2">
                    <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base mb-1">Password</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mb-4 font-mono">Keep your account secure with a strong password.</p>
                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold">Current Password</label>
                        <div className="relative">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                          <input type="password" placeholder="••••••••" className={`${inputCls} pl-11`} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold">New Password</label>
                        <div className="relative">
                          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                          <input type="password" placeholder="••••••••" className={`${inputCls} pl-11`} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 font-mono font-bold">Confirm New Password</label>
                        <div className="relative">
                          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                          <input type="password" placeholder="••••••••" className={`${inputCls} pl-11`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-1">Email Notifications</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Choose what events trigger an email to your inbox.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { id: "n1", label: "New Order Placed", desc: "Receive an email when a customer places a new order." },
                      { id: "n2", label: "Dealer Application", desc: "Receive an email when a new dealer registers for approval." },
                      { id: "n3", label: "Quotation Request", desc: "Receive an email when a dealer requests a quotation." },
                      { id: "n4", label: "Low Stock Alert", desc: "Receive a weekly summary of items running low on stock." },
                    ].map((notif) => (
                      <div key={notif.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{notif.label}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{notif.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-300 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              {activeTab !== "security" && (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary text-black font-mono font-bold uppercase text-xs px-6 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Settings
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
