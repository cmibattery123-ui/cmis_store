"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+91[\-\s]?)?[0]?[6-9]\d{9}$/.test(val.replace(/\s/g, "")),
      "Please enter a valid 10-digit mobile number"
    )
    .or(z.literal("")),
});

type ProfileInput = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [saved, setSaved] = useState(false);

  // Security PIN state
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [hasCustomPin, setHasCustomPin] = useState(false);
  const [savingPin, setSavingPin] = useState(false);
  const [pinMsg, setPinMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
      phone: (session?.user as any)?.phone ?? "",
    },
  });

  async function loadProfile() {
    try {
      const res = await fetch("/api/customer/profile");
      if (res.ok) {
        const json = await res.json();
        const data = json?.data || json;
        if (data) {
          reset({
            name: data.name || session?.user?.name || "",
            email: data.email || session?.user?.email || "",
            phone: data.phone || "",
          });
          if (data.pin) {
            setCurrentPin(data.pin);
            setNewPin(data.pin);
            setHasCustomPin(true);
          }
        }
      }

      const pinRes = await fetch("/api/user/pin");
      if (pinRes.ok) {
        const pinJson = await pinRes.json();
        if (pinJson.data?.currentPin) {
          setCurrentPin(pinJson.data.currentPin);
          setNewPin(pinJson.data.currentPin);
          setHasCustomPin(Boolean(pinJson.data.hasCustomPin));
        }
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [session, reset]);

  async function onSubmit(data: ProfileInput) {
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || "Update failed");
      }

      await update({ name: data.name, email: data.email });
      router.refresh();
      setSaved(true);
      toast.success("Profile updated successfully");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile. Please try again.");
    }
  }

  async function handleUpdatePin(e: React.FormEvent) {
    e.preventDefault();
    setSavingPin(true);
    setPinMsg(null);

    const cleanPin = newPin.trim();
    if (cleanPin.length < 4 || cleanPin.length > 8) {
      setPinMsg({ type: "error", text: "Security PIN must be between 4 and 8 characters/digits" });
      setSavingPin(false);
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
        setCurrentPin(cleanPin);
        setHasCustomPin(true);
        setPinMsg({ type: "success", text: "Security PIN updated successfully!" });
        toast.success("Security PIN updated successfully!");
      } else {
        setPinMsg({ type: "error", text: json.error || "Failed to update Security PIN." });
      }
    } catch {
      setPinMsg({ type: "error", text: "An error occurred while saving Security PIN." });
    } finally {
      setSavingPin(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl text-slate-900 dark:text-white">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-600 dark:text-gray-400 text-sm mt-1 font-normal">Manage your personal information and account security</p>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* Avatar Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="w-16 h-16 bg-amber-500/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-amber-600 dark:text-primary" />
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-bold text-base">{session?.user?.name}</p>
            <p className="text-slate-500 dark:text-gray-300 text-xs font-mono">{session?.user?.email}</p>
            <span className="text-[10px] text-amber-600 dark:text-primary font-mono font-bold uppercase tracking-widest bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 px-2.5 py-0.5 rounded-full mt-2 inline-block">
              {session?.user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="customer-name" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
              <span className="flex items-center gap-2"><User className="w-4 h-4 text-amber-600 dark:text-primary" /> Full Name</span>
            </label>
            <input
              id="customer-name"
              {...register("name")}
              type="text"
              className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm"
            />
            {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-mono">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="customer-email" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-amber-600 dark:text-primary" /> Email Address</span>
            </label>
            <input
              id="customer-email"
              type="email"
              {...register("email")}
              className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm font-mono"
            />
            {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-mono">{errors.email.message}</p>}
            <p className="text-slate-400 dark:text-gray-400 text-xs mt-1 font-mono">You will use this email address to sign into your account</p>
          </div>

          <div>
            <label htmlFor="customer-phone" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
              <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-amber-600 dark:text-primary" /> Phone Number</span>
            </label>
            <input
              id="customer-phone"
              {...register("phone")}
              type="tel"
              placeholder="9999999999"
              className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm"
            />
            {errors.phone && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-mono">{errors.phone.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-primary text-black font-black uppercase tracking-wider text-xs px-8 py-3.5 rounded-2xl hover:bg-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(250,255,0,0.25)] mt-4 cursor-pointer"
          >
            {saved ? (
              <><CheckCircle className="w-4 h-4" /> Saved!</>
            ) : isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>

      {/* Security PIN Settings Card */}
      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-primary">
              <CheckCircle className="w-4 h-4" />
            </span>
            Security PIN
          </h2>
          {hasCustomPin && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              PIN Active
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-400 mb-6 font-mono">
          Set an optional 4 to 8 digit Security PIN to safeguard your customer account during sign-in.
        </p>

        {pinMsg && (
          <div
            className={`text-xs px-4 py-3 rounded-2xl mb-5 flex items-center gap-2 font-mono ${
              pinMsg.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
            }`}
          >
            {pinMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdatePin} className="space-y-4">
          <div>
            <label htmlFor="customer-pin-input" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
              New Security PIN (4–8 digits)
            </label>
            <input
              id="customer-pin-input"
              type="text"
              maxLength={8}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="e.g. 1234"
              className="w-full sm:w-64 bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-mono tracking-widest text-center text-base focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={savingPin || (!newPin.trim()) || (newPin.trim() === currentPin)}
            className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white font-bold text-xs uppercase font-mono tracking-wider px-6 py-3 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {savingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Security PIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
