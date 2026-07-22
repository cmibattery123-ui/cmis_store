"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Loader2, AlertCircle, CheckCircle, Building2, User, MapPin } from "lucide-react";
import { dealerRegisterSchema, type DealerRegisterInput } from "@/lib/validations/auth";
import { dealerRegisterAction } from "@/actions/auth.actions";
import { COMPANY_INFO } from "@/lib/constants";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh",
  "Chandigarh","Puducherry",
];

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";
const labelCls = "block text-sm font-medium text-gray-300 mb-2";
const errorCls = "text-red-400 text-xs mt-1";

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
    const result = await dealerRegisterAction(data);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-md"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-white">Application Submitted!</h2>
          <p className="text-gray-400">
            Your dealer application is under review. Our team will verify your documents and notify you within 2–3 business days.
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors mt-4"
          >
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4 bg-grid">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="font-heading font-bold text-white text-xl">{COMPANY_INFO.brand}</span>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-white mt-6">Dealer Registration</h1>
          <p className="text-gray-400 text-sm mt-1">
            Join our dealer network and get exclusive pricing
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">
          {serverError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Info */}
            <section>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                <User className="w-4 h-4 text-primary" />
                <h2 className="font-heading font-bold text-white text-sm uppercase tracking-widest">
                  Personal Information
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input {...register("name")} placeholder="John Doe" className={inputCls} />
                  {errors.name && <p className={errorCls}>{errors.name.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input {...register("email")} type="email" placeholder="dealer@company.com" className={inputCls} />
                  {errors.email && <p className={errorCls}>{errors.email.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input {...register("phone")} type="tel" placeholder="9999999999" className={inputCls} />
                  {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <input {...register("password")} type="password" placeholder="Min 8 characters" className={inputCls} />
                  {errors.password && <p className={errorCls}>{errors.password.message}</p>}
                </div>
              </div>
            </section>

            {/* Business Info */}
            <section>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                <Building2 className="w-4 h-4 text-primary" />
                <h2 className="font-heading font-bold text-white text-sm uppercase tracking-widest">
                  Business Information
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Business Name</label>
                  <input {...register("businessName")} placeholder="ABC Batteries Pvt Ltd" className={inputCls} />
                  {errors.businessName && <p className={errorCls}>{errors.businessName.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>GST Number (Optional)</label>
                  <input {...register("gstNumber")} placeholder="22AAAAA0000A1Z5" className={inputCls} />
                  {errors.gstNumber && <p className={errorCls}>{errors.gstNumber.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>PAN Number (Optional)</label>
                  <input {...register("panNumber")} placeholder="AAAAA9999A" className={inputCls} />
                  {errors.panNumber && <p className={errorCls}>{errors.panNumber.message}</p>}
                </div>
              </div>
            </section>

            {/* Address */}
            <section>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                <MapPin className="w-4 h-4 text-primary" />
                <h2 className="font-heading font-bold text-white text-sm uppercase tracking-widest">
                  Business Address
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Street Address</label>
                  <textarea
                    {...register("businessAddress")}
                    rows={2}
                    placeholder="Shop No., Street, Area..."
                    className={`${inputCls} resize-none`}
                  />
                  {errors.businessAddress && <p className={errorCls}>{errors.businessAddress.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input {...register("city")} placeholder="Coimbatore" className={inputCls} />
                  {errors.city && <p className={errorCls}>{errors.city.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <select {...register("state")} className={inputCls}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s} className="bg-[#111]">{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className={errorCls}>{errors.state.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Pincode</label>
                  <input {...register("pincode")} placeholder="641001" className={inputCls} />
                  {errors.pincode && <p className={errorCls}>{errors.pincode.message}</p>}
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-black font-heading font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Application…</>
              ) : (
                "Submit Dealer Application"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
