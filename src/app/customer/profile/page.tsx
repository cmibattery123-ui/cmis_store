"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number").optional().or(z.literal("")),
});

type ProfileInput = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      phone: (session?.user as any)?.phone ?? "",
    },
  });

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const res = await fetch("/api/customer/profile");
        if (res.ok) {
          const json = await res.json();
          const data = json?.data || json;
          if (data && isMounted) {
            reset({
              name: data.name || session?.user?.name || "",
              phone: data.phone || "",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [session, reset]);

  async function onSubmit(data: ProfileInput) {
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Update failed");

      await update({ name: data.name });
      setSaved(true);
      toast.success("Profile updated successfully");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to update profile. Please try again.");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl text-slate-900 dark:text-white">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-600 dark:text-gray-400 text-sm mt-1 font-normal">Manage your personal information</p>
      </div>

      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* Avatar placeholder */}
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
              value={session?.user?.email ?? ""}
              disabled
              className="w-full bg-slate-100 dark:bg-[#161722] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-500 dark:text-gray-400 cursor-not-allowed font-mono text-sm"
            />
            <p className="text-slate-400 dark:text-gray-400 text-xs mt-1 font-mono">Email cannot be changed</p>
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
            className="flex items-center justify-center gap-2 bg-primary text-black font-black uppercase tracking-wider text-xs px-8 py-3.5 rounded-2xl hover:bg-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(250,255,0,0.25)] mt-4"
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
    </div>
  );
}
