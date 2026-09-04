"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Loader2, AlertCircle, CheckCircle, Building2, User, MapPin } from "lucide-react";
import { dealerRegisterSchema, type DealerRegisterInput } from "@/lib/validations/auth";
import { COMPANY_INFO } from "@/lib/constants";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh",
  "Chandigarh","Puducherry",
];

const inputCls = "w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm";
const labelCls = "block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2";
const errorCls = "text-red-500 dark:text-red-400 text-xs mt-1 font-mono";

export default function DealerRegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DealerRegisterInput>({
    resolver: zodResolver(dealerRegisterSchema),
  });

  async function onSubmit(data: DealerRegisterInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/dealer-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setServerError(json.error || "Failed to submit dealer application. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setServerError("Network error. Please try again.");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-md p-8 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl"
        >
          <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Application Submitted!</h2>
          <p className="text-slate-600 dark:text-gray-400 font-normal text-sm">
            Your dealer application is under review. Our team will verify your documents and notify you within 2–3 business days.
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-primary text-black font-black px-8 py-3.5 rounded-2xl hover:bg-yellow-300 transition-all uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(250,255,0,0.3)] mt-4"
          >
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white py-16 px-4 bg-grid transition-colors duration-200">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,255,0,0.3)]">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="font-black text-slate-900 dark:text-white text-xl tracking-tight uppercase">{COMPANY_INFO.brand}</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-6 uppercase tracking-tight">Dealer Registration</h1>
          <p className="text-slate-600 dark:text-gray-400 text-sm mt-1 font-normal">
            Join our dealer network and get exclusive pricing
          </p>
        </div>

        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-8 shadow-xl space-y-8">
          {serverError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-2xl px-4 py-3 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Info */}
            <section>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-white/10">
                <User className="w-4 h-4 text-amber-600 dark:text-primary" />
                <h2 className="font-mono font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest">
                  Personal Information
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dealer-name" className={labelCls}>Full Name</label>
                  <input id="dealer-name" {...register("name")} placeholder="John Doe" className={inputCls} />
                  {errors.name && <p className={errorCls}>{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="dealer-email" className={labelCls}>Email Address</label>
                  <input id="dealer-email" {...register("email")} type="email" placeholder="dealer@company.com" className={inputCls} />
                  {errors.email && <p className={errorCls}>{errors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="dealer-phone" className={labelCls}>Phone Number</label>
                  <input id="dealer-phone" {...register("phone")} type="tel" placeholder="9999999999" className={inputCls} />
                  {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
                </div>
                <div>
                  <label htmlFor="dealer-password" className={labelCls}>Password</label>
                  <input id="dealer-password" {...register("password")} type="password" placeholder="Min 8 characters" className={inputCls} />
                  {errors.password && <p className={errorCls}>{errors.password.message}</p>}
                </div>
              </div>
            </section>

            {/* Business Info */}
            <section>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-white/10">
                <Building2 className="w-4 h-4 text-amber-600 dark:text-primary" />
                <h2 className="font-mono font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest">
                  Business Information
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="dealer-business-name" className={labelCls}>Business Name</label>
                  <input id="dealer-business-name" {...register("businessName")} placeholder="ABC Batteries Pvt Ltd" className={inputCls} />
                  {errors.businessName && <p className={errorCls}>{errors.businessName.message}</p>}
                </div>
                <div>
                  <label htmlFor="dealer-gst" className={labelCls}>GST Number (Optional)</label>
                  <input id="dealer-gst" {...register("gstNumber")} placeholder="22AAAAA0000A1Z5" className={inputCls} />
                  {errors.gstNumber && <p className={errorCls}>{errors.gstNumber.message}</p>}
                </div>
                <div>
                  <label htmlFor="dealer-pan" className={labelCls}>PAN Number (Optional)</label>
                  <input id="dealer-pan" {...register("panNumber")} placeholder="AAAAA9999A" className={inputCls} />
                  {errors.panNumber && <p className={errorCls}>{errors.panNumber.message}</p>}
                </div>
              </div>
            </section>

            {/* Address */}
            <section>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-white/10">
                <MapPin className="w-4 h-4 text-amber-600 dark:text-primary" />
                <h2 className="font-mono font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest">
                  Business Address
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="dealer-address" className={labelCls}>Street Address</label>
                  <textarea
                    id="dealer-address"
                    {...register("businessAddress")}
                    rows={2}
                    placeholder="Shop No., Street, Area..."
                    className={`${inputCls} resize-none`}
                  />
                  {errors.businessAddress && <p className={errorCls}>{errors.businessAddress.message}</p>}
                </div>
                <div>
                  <label htmlFor="dealer-city" className={labelCls}>City</label>
                  <input id="dealer-city" {...register("city")} placeholder="Coimbatore" className={inputCls} />
                  {errors.city && <p className={errorCls}>{errors.city.message}</p>}
                </div>
                <div>
                  <label htmlFor="dealer-state" className={labelCls}>State</label>
                  <select id="dealer-state" {...register("state")} className={inputCls}>
                    <option value="" className="bg-white dark:bg-[#111]">Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s} className="bg-white dark:bg-[#111]">{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className={errorCls}>{errors.state.message}</p>}
                </div>
                <div>
                  <label htmlFor="dealer-pincode" className={labelCls}>Pincode</label>
                  <input id="dealer-pincode" {...register("pincode")} placeholder="641001" className={inputCls} />
                  {errors.pincode && <p className={errorCls}>{errors.pincode.message}</p>}
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-black font-black uppercase tracking-wider text-xs py-4 rounded-2xl hover:bg-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(250,255,0,0.3)]"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Application…</>
              ) : (
                "Submit Dealer Application"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-amber-600 dark:text-primary font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
