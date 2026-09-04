"use client";

import React, { useState, useMemo } from "react";
import { Search, Zap, CheckCircle2, SlidersHorizontal } from "lucide-react";

type Spec = {
  id: string;
  model: string;
  volts: string;
  capacity: string;
  length: string;
  breadth: string;
  height: string;
  weight: string;
};

export default function SpecificationTableClient({ initialSpecs }: { initialSpecs: Spec[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const filterOptions = ["ALL", "12V", "LiFePO4", "Inverter"];

  const filteredSpecs = useMemo(() => {
    return initialSpecs.filter((spec) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        spec.model.toLowerCase().includes(q) ||
        spec.capacity.toLowerCase().includes(q) ||
        spec.volts.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (selectedFilter === "12V") return spec.volts.includes("12");
      if (selectedFilter === "LiFePO4") return spec.model.toLowerCase().includes("life");
      if (selectedFilter === "Inverter") return spec.model.toLowerCase().includes("inverter") || spec.model.toLowerCase().includes("inv");

      return true;
    });
  }, [initialSpecs, searchTerm, selectedFilter]);

  return (
    <section className="py-28 bg-white dark:bg-[#08090D] border-t border-slate-200 dark:border-white/10 relative overflow-hidden transition-colors duration-200">
      {/* Background illumination */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-slate-100 dark:bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 text-amber-700 dark:text-primary text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>Engineering Reference</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Technical Specifications
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base font-normal">
                Dimensions, voltage ratings, and net weight specifications across our battery models.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Model, Ah, Voltage…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-white/15 rounded-2xl pl-10 pr-4 py-3 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-400 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedFilter(opt)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedFilter === opt
                    ? "bg-primary text-black shadow-[0_0_15px_rgba(250,255,0,0.35)] font-bold"
                    : "bg-slate-100 dark:bg-[#161722] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#1E202B]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl overflow-hidden shadow-xl dark:shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-[#161722] border-b border-slate-200 dark:border-white/10 text-[10px] uppercase font-mono tracking-[0.15em] text-slate-600 dark:text-slate-300">
                    <th className="px-6 py-4.5 font-bold">MODEL SERIES</th>
                    <th className="px-6 py-4.5 font-bold">VOLTAGE</th>
                    <th className="px-6 py-4.5 font-bold">CAPACITY</th>
                    <th className="px-6 py-4.5 font-bold text-center">DIMENSIONS L × W × H (CM)</th>
                    <th className="px-6 py-4.5 font-bold text-right">NET WEIGHT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                  {filteredSpecs.length > 0 ? (
                    filteredSpecs.map((spec) => (
                      <tr
                        key={spec.id}
                        className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.04] group"
                      >
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-primary/70 group-hover:bg-amber-600 dark:group-hover:bg-primary transition-colors shadow-sm" />
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-yellow-200 transition-colors tracking-tight">
                              {spec.model}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap font-mono text-slate-600 dark:text-slate-300 text-xs">
                          {spec.volts}
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 text-xs font-mono font-bold text-amber-700 dark:text-primary">
                            {spec.capacity}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap text-slate-600 dark:text-slate-300 text-center font-mono text-xs">
                          {spec.length} × {spec.breadth} × {spec.height}
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap text-slate-900 dark:text-white font-mono font-black text-right">
                          {spec.weight} kg
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-mono text-sm">
                        No specifications found matching "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
