"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Building2, Shield, Loader2, RefreshCw, KeyRound, Check, AlertCircle, Edit2, Save, X } from "lucide-react";
import { formatDate } from "@/lib/utils/api";
import { toast } from "sonner";

const statusColor: Record<string, string> = {
  PENDING:   "bg-amber-500/10 text-amber-600 dark:text-yellow-400 border border-amber-500/20",
  APPROVED:  "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20",
  REJECTED:  "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  SUSPENDED: "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/20",
};

export default function DealerProfilePage() {
  const { update: updateSession } = useSession();
  const [dealer, setDealer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Security PIN states
  const [pin, setPin] = useState("123456");
  const [newPin, setNewPin] = useState("123456");
  const [savingPin, setSavingPin] = useState(false);
  const [pinMsg, setPinMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/dealer/profile");
      const json = await res.json();
      if (res.ok && json.data) {
        setDealer(json.data);
        setFullName(json.data.user?.name || "");
        setEmail(json.data.user?.email || "");
        setPhone(json.data.phone || json.data.user?.phone || "");
      }

      const pinRes = await fetch("/api/dealer/pin");
      if (pinRes.ok) {
        const pinJson = await pinRes.json();
        if (pinJson.data?.currentPin) {
          setPin(pinJson.data.currentPin);
          setNewPin(pinJson.data.currentPin);
        }
      }
    } catch (err) {
      console.error("Failed to load dealer profile:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }
    if (!email.trim()) {
      toast.error("Email cannot be empty.");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/dealer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName.trim(), email: email.trim(), phone: phone.trim() }),
      });
      const json = await res.json();

      if (res.ok && json.data) {
        setDealer(json.data);
        await updateSession({ name: fullName.trim(), email: email.trim() });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(json.error || "Failed to update profile.");
      }
    } catch {
      toast.error("An error occurred while updating profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleUpdatePin(e: React.FormEvent) {
    e.preventDefault();
    setSavingPin(true);
    setPinMsg(null);

    try {
      const res = await fetch("/api/dealer/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: newPin }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setPin(newPin);
        setPinMsg({ type: "success", text: "Security PIN updated successfully!" });
      } else {
        setPinMsg({ type: "error", text: json.error || "Failed to update Security PIN." });
      }
    } catch {
      setPinMsg({ type: "error", text: "An error occurred while saving Security PIN." });
    } finally {
      setSavingPin(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-gray-400">
        <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
        <span className="text-xs font-mono">Loading profile...</span>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-gray-400">
        <p>Dealer profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            Manage your dealer account and business information.
          </p>
        </div>
        <button
          onClick={() => loadProfile()}
          className="p-2 rounded-xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-700 dark:text-gray-300"
          title="Refresh profile"
          aria-label="Refresh profile"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Status */}
        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <h2 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-amber-600 dark:text-primary" /> Account Status
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-slate-500 dark:text-gray-400 text-xs font-mono font-bold uppercase tracking-widest mb-1">Status</p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold inline-block ${statusColor[dealer.status] ?? ""}`}>
                {dealer.status}
              </span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-gray-400 text-xs font-mono font-bold uppercase tracking-widest mb-1">Credit Limit</p>
              <p className="text-slate-900 dark:text-white font-bold font-mono">₹{Number(dealer.creditLimit || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-gray-400 text-xs font-mono font-bold uppercase tracking-widest mb-1">Discount Rate</p>
              <p className="text-amber-600 dark:text-primary font-bold font-mono">{Number(dealer.discountPercent || 0)}% Off</p>
            </div>
          </div>
        </div>

        {/* Security PIN Settings */}
        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <KeyRound className="w-4 h-4 text-amber-600 dark:text-primary" /> Security PIN
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-4 font-mono">
              Your 6-digit Security PIN is required when signing into your dealer account (Default: <strong className="text-slate-900 dark:text-white font-bold">123456</strong>).
            </p>

            {pinMsg && (
              <div
                className={`text-xs px-3 py-2 rounded-xl mb-4 flex items-center gap-2 ${
                  pinMsg.type === "success"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                }`}
              >
                {pinMsg.type === "success" ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {pinMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdatePin} className="space-y-3">
              <div>
                <label htmlFor="dealer-new-pin" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-1">
                  Set Security PIN
                </label>
                <input
                  id="dealer-new-pin"
                  type="text"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono tracking-widest text-center text-base focus:outline-none focus:border-amber-500 dark:focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={savingPin || newPin === pin}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-black font-bold text-xs uppercase font-mono tracking-wider hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {savingPin ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Security PIN"}
              </button>
            </form>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600 dark:text-primary" /> Personal Information
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white transition-colors cursor-pointer"
            >
              {isEditing ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit2 className="w-3.5 h-3.5" /> Edit Profile</>}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="dealer-name-edit" className="block text-xs font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="dealer-name-edit"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 dark:focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="dealer-email-edit" className="block text-xs font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="dealer-email-edit"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-amber-500 dark:focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="dealer-phone-edit" className="block text-xs font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="dealer-phone-edit"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9999999999"
                    className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 dark:focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="py-2 px-5 rounded-xl bg-primary text-black font-bold text-xs uppercase font-mono tracking-wider hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-slate-500 dark:text-gray-400 text-xs font-mono font-bold uppercase tracking-widest mb-1">Full Name</p>
                <p className="text-slate-900 dark:text-white font-medium">{dealer.user?.name}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-gray-400 text-xs font-mono font-bold uppercase tracking-widest mb-1">Email Address</p>
                <p className="text-slate-900 dark:text-white font-mono text-xs">{dealer.user?.email}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-gray-400 text-xs font-mono font-bold uppercase tracking-widest mb-1">Member Since</p>
                <p className="text-slate-700 dark:text-gray-300 font-mono text-xs">{formatDate(dealer.user?.createdAt)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Business Information */}
        <div className="md:col-span-2 bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <h2 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-amber-600 dark:text-primary" /> Business Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-500 dark:text-gray-400 text-xs font-mono font-bold uppercase tracking-widest mb-1">Business Name</p>
              <p className="text-slate-900 dark:text-white font-medium">{dealer.businessName}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-gray-400 text-xs font-mono font-bold uppercase tracking-widest mb-1">GST Number</p>
              <p className="text-slate-900 dark:text-white font-mono">{dealer.gstNumber || "Not Provided"}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-gray-400 text-xs font-mono font-bold uppercase tracking-widest mb-1">PAN Number</p>
              <p className="text-slate-900 dark:text-white font-mono">{dealer.panNumber || "Not Provided"}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-gray-400 text-xs font-mono font-bold uppercase tracking-widest mb-1">Phone Number</p>
              <p className="text-slate-900 dark:text-white font-mono">{dealer.phone || dealer.user?.phone || "—"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-slate-500 dark:text-gray-400 text-xs font-mono font-bold uppercase tracking-widest mb-1">Business Address</p>
              <p className="text-slate-900 dark:text-white">{dealer.businessAddress || dealer.address || "—"}</p>
              <p className="text-slate-500 dark:text-gray-400 text-sm mt-0.5">{dealer.city || ""}{dealer.state ? `, ${dealer.state}` : ""} {dealer.pincode ? `- ${dealer.pincode}` : ""}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-2">
        <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">
          To update your profile information, please contact an administrator.
        </p>
      </div>
    </div>
  );
}
