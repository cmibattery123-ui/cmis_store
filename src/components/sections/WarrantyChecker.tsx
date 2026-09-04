"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldCheck, ShieldAlert, Calendar, User, Cpu, AlertCircle, Loader2 } from "lucide-react";
import { checkWarrantyAction, WarrantyCheckResult } from "@/app/warranty/warranty-action";
import { cn } from "@/lib/utils";

export default function WarrantyChecker() {
  const [serial, setSerial] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WarrantyCheckResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await checkWarrantyAction(serial);
      setResult(res);
    } catch (err) {
      setResult({
        success: false,
        error: "Failed to connect to the database. Please try again.",
        message: "Failed to connect to the database. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-[#F5F5F7] dark:bg-[#000000] relative transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] rounded-[32px] p-8 md:p-12 relative overflow-hidden shadow-sm">
          <div className="relative z-10 text-center mb-8">
            <div className="text-xs font-semibold text-amber-600 dark:text-primary mb-1">
              Live Verification
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-2 tracking-tight">
              Check Warranty Status
            </h2>
            <p className="text-[#6E6E73] dark:text-[#86868B] text-sm md:text-base font-normal">
              Enter your battery&apos;s unique serial number to check its authentic manufacturer registration and active warranty window.
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative z-10 flex flex-col md:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g., CMI-1212-001"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                disabled={loading}
                className="w-full bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-full px-6 py-3.5 outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#242426] transition-all font-mono placeholder:text-[#86868B] uppercase tracking-wider text-base"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !serial.trim()}
              className="bg-primary text-black font-semibold py-3.5 px-7 rounded-full hover:bg-yellow-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm shrink-0 cursor-pointer active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Verify</span>
                </>
              )}
            </button>
          </form>

          {/* Results section */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                {result.success && result.data ? (
                  <div className="border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#12131A] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg">
                    {/* Status indicator bar */}
                    <div
                      className={cn(
                        "absolute top-0 left-0 right-0 h-1.5",
                        result.data.status === "Active" ? "bg-green-500" : "bg-red-500"
                      )}
                    />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
                      <div>
                        <div className="text-[10px] text-slate-500 dark:text-gray-300 font-bold uppercase tracking-widest font-mono">Serial Number</div>
                        <div className="text-xl md:text-2xl font-mono font-black text-slate-900 dark:text-white tracking-widest">{result.data.serialNumber}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.data.status === "Active" ? (
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-mono font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4" />
                            Active Warranty
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
                            <ShieldAlert className="w-4 h-4" />
                            Expired
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-[#1E202B] flex items-center justify-center text-amber-600 dark:text-primary border border-amber-500/20 dark:border-white/10">
                            <Cpu className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 dark:text-gray-300 font-bold uppercase tracking-widest font-mono">Battery Model</div>
                            <div className="text-slate-900 dark:text-white font-bold">{result.data.model}</div>
                          </div>
                        </div>

                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-[#1E202B] flex items-center justify-center text-amber-600 dark:text-primary border border-amber-500/20 dark:border-white/10">
                            <Cpu className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 dark:text-gray-300 font-bold uppercase tracking-widest font-mono">Capacity</div>
                            <div className="text-slate-900 dark:text-white font-bold">{result.data.capacity}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-[#1E202B] flex items-center justify-center text-amber-600 dark:text-primary border border-amber-500/20 dark:border-white/10">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 dark:text-gray-300 font-bold uppercase tracking-widest font-mono">Purchase Date</div>
                            <div className="text-slate-900 dark:text-white font-bold">
                              {new Date(result.data.purchaseDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-[#1E202B] flex items-center justify-center text-amber-600 dark:text-primary border border-amber-500/20 dark:border-white/10">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 dark:text-gray-300 font-bold uppercase tracking-widest font-mono">Warranty Expiry</div>
                            <div className="text-slate-900 dark:text-white font-bold">
                              {new Date(result.data.warrantyExpiry).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {result.data.customerName && (
                      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-[#1E202B] flex items-center justify-center text-amber-600 dark:text-primary border border-amber-500/20 dark:border-white/10">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 dark:text-gray-300 font-bold uppercase tracking-widest font-mono">Registered Customer</div>
                          <div className="text-slate-900 dark:text-white font-bold">{result.data.customerName}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-red-500/20 bg-red-500/10 rounded-3xl p-6 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-slate-900 dark:text-white font-bold uppercase tracking-wider text-sm mb-1 font-mono">Verification Failed</h4>
                      <p className="text-slate-600 dark:text-gray-200 text-sm leading-relaxed font-normal">{result.message}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
