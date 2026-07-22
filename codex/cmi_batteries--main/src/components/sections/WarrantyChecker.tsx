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
        message: "Failed to connect to the database. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 bg-black relative">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden backdrop-blur-xl shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-heading font-bold text-white uppercase mb-3">
              Serial Number <span className="text-primary">Checker</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base">
              Enter your battery&apos;s unique serial number printed on the warranty card or the battery case to check its validity and coverage status.
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative z-10 flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g., CMI-1212-001"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-mono placeholder:text-gray-600 uppercase tracking-widest text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !serial.trim()}
              className="bg-primary text-black font-heading font-bold py-4 px-8 rounded-2xl hover:bg-primary/80 disabled:opacity-50 disabled:hover:bg-primary transition-all flex items-center justify-center gap-2 text-sm tracking-wider uppercase shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Verify Warranty
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
                  <div className="border border-white/10 bg-white/[0.02] rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
                    {/* Status indicator bar */}
                    <div
                      className={cn(
                        "absolute top-0 left-0 right-0 h-1.5",
                        result.data.status === "Active" ? "bg-green-500" : "bg-red-500"
                      )}
                    />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/5">
                      <div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Serial Number</div>
                        <div className="text-xl md:text-2xl font-mono font-bold text-white tracking-widest">{result.data.serialNumber}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.data.status === "Active" ? (
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4" />
                            Active Warranty
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
                            <ShieldAlert className="w-4 h-4" />
                            Expired
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/5">
                            <Cpu className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Battery Model</div>
                            <div className="text-white font-bold">{result.data.model}</div>
                          </div>
                        </div>

                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/5">
                            <Cpu className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Capacity</div>
                            <div className="text-white font-bold">{result.data.capacity}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/5">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Purchase Date</div>
                            <div className="text-white font-bold">
                              {new Date(result.data.purchaseDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/5">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Warranty Expiry</div>
                            <div className="text-white font-bold">
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
                      <div className="mt-6 pt-6 border-t border-white/5 flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/5">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Registered Customer</div>
                          <div className="text-white font-bold">{result.data.customerName}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-red-500/20 bg-red-500/5 rounded-[2rem] p-6 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-1">Verification Failed</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{result.message}</p>
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
