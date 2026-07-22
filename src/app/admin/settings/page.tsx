"use client";

import { useState, useRef, useEffect } from "react";
import { User, Store, Shield, Bell, Save, Key, Mail, Globe, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function AdminSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user?.image) {
      setAvatarUrl(session.user.image);
    }
  }, [session?.user?.image]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (activeTab === "profile" && avatarUrl) {
        const res = await fetch("/api/admin/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: avatarUrl }),
        });
        
        if (!res.ok) throw new Error("Failed to save profile");
        
        // Force session update so the header avatar changes too
        await updateSession({ image: avatarUrl });
      }
      
      setTimeout(() => {
        setLoading(false);
        toast.success("Settings saved successfully!");
      }, 500);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to save settings");
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
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload image");

      const responseData = await res.json();
      setAvatarUrl(responseData.data.url);
      toast.success("Avatar updated successfully!");
    } catch (error) {
      toast.error("Failed to upload avatar");
      console.error(error);
    } finally {
      setUploadingAvatar(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const tabs = [
    { id: "general", label: "General Store", icon: Store },
    { id: "profile", label: "Admin Profile", icon: User },
    { id: "security", label: "Security & Passwords", icon: Shield },
    { id: "payments", label: "Payment Gateways", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">System Settings</h1>
        <p className="text-gray-400 text-sm mt-1">
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-black font-medium shadow-[0_0_15px_rgba(255,255,255,0.1)] shadow-primary/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSave}>
            
            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6">
                  <h2 className="text-xl font-heading font-bold text-white mb-1">General Store Settings</h2>
                  <p className="text-sm text-gray-400">Configure your primary business details visible to customers.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Store Name</label>
                    <input type="text" defaultValue="PERFECT BATTERY" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Support Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="email" defaultValue="support@perfectbattery.com" className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Business Address</label>
                    <textarea rows={3} defaultValue="123 Industrial Phase, Main Highway, City, State - 100000" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Default Currency</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <select className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors appearance-none">
                        <option>INR (₹) - Indian Rupee</option>
                        <option>USD ($) - US Dollar</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Tax/GST Number</label>
                    <input type="text" defaultValue="22AAAAA0000A1Z5" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6">
                  <h2 className="text-xl font-heading font-bold text-white mb-1">Administrator Profile</h2>
                  <p className="text-sm text-gray-400">Update your personal account details.</p>
                </div>
                
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
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
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {uploadingAvatar && <Loader2 className="w-4 h-4 animate-spin" />}
                      {uploadingAvatar ? "Uploading..." : "Change Avatar"}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Full Name</label>
                    <input type="text" defaultValue={session?.user?.name || "Admin User"} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Personal Email</label>
                    <input type="email" defaultValue={session?.user?.email || "admin@perfect.com"} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-gray-400 text-sm focus:outline-none focus:border-primary transition-colors cursor-not-allowed" disabled />
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6">
                  <h2 className="text-xl font-heading font-bold text-white mb-1">Security & Passwords</h2>
                  <p className="text-sm text-gray-400">Keep your account secure with a strong password.</p>
                </div>
                
                <div className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Current Password</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="password" placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">New Password</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="password" placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Confirm New Password</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="password" placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === "payments" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6">
                  <h2 className="text-xl font-heading font-bold text-white mb-1">Payment Gateways</h2>
                  <p className="text-sm text-gray-400">Configure Razorpay and other payment providers.</p>
                </div>
                
                <div className="p-5 rounded-xl border border-white/10 bg-black/50 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white">Razorpay Integration</h3>
                      <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-500/20 text-green-400 uppercase tracking-widest">Active</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">Accept payments via UPI, Credit/Debit Cards, and NetBanking.</p>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500">Razorpay Key ID</label>
                        <input type="text" defaultValue="rzp_test_xxxxxx" className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-primary transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500">Razorpay Key Secret</label>
                        <input type="password" defaultValue="••••••••••••••••" className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6">
                  <h2 className="text-xl font-heading font-bold text-white mb-1">Email Notifications</h2>
                  <p className="text-sm text-gray-400">Choose what events trigger an email to your inbox.</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    { id: "n1", label: "New Order Placed", desc: "Receive an email when a customer places a new order." },
                    { id: "n2", label: "Dealer Application", desc: "Receive an email when a new dealer registers for approval." },
                    { id: "n3", label: "Quotation Request", desc: "Receive an email when a dealer requests a quotation." },
                    { id: "n4", label: "Low Stock Alert", desc: "Receive a weekly summary of items running low on stock." },
                  ].map((notif) => (
                    <div key={notif.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20">
                      <div>
                        <p className="font-medium text-white text-sm">{notif.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{notif.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-primary text-black font-medium px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
