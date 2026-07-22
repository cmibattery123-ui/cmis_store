"use client";

import { useState } from "react";
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
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      phone: "",
    },
  });

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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">My Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your personal information</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        {/* Avatar placeholder */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-white font-medium">{session?.user?.name}</p>
            <p className="text-gray-500 text-sm">{session?.user?.email}</p>
            <span className="text-xs text-primary font-mono uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded mt-1 inline-block">
              {session?.user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <span className="flex items-center gap-2"><User className="w-4 h-4" /> Full Name</span>
            </label>
            <input
              {...register("name")}
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email Address</span>
            </label>
            <input
              type="email"
              value={session?.user?.email ?? ""}
              disabled
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
            />
            <p className="text-gray-600 text-xs mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> Phone Number</span>
            </label>
            <input
              {...register("phone")}
              type="tel"
              placeholder="9999999999"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-primary text-black font-heading font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
