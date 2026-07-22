"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

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

  const filteredSpecs = initialSpecs.filter(
    (spec) =>
      spec.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec.capacity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-24 bg-[#0A0A0A] border-t border-white/5 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                Technical Specifications
              </h2>
              <p className="text-gray-400 text-sm">
                Detailed metrics for our CMIP Series Lithium Batteries.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search by Model or Capacity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/50 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-6 py-4 font-medium">Model Type</th>
                    <th className="px-6 py-4 font-medium">Voltage</th>
                    <th className="px-6 py-4 font-medium">Capacity</th>
                    <th className="px-6 py-4 font-medium text-center">L × B × H (cm)</th>
                    <th className="px-6 py-4 font-medium text-right">Weight (Kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSpecs.length > 0 ? (
                    filteredSpecs.map((spec) => (
                      <tr
                        key={spec.id}
                        className="transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-white">
                              {spec.model}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-gray-300">
                          {spec.volts}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-gray-300 font-medium">
                          {spec.capacity}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-gray-400 text-center font-mono text-sm">
                          {spec.length} × {spec.breadth} × {spec.height}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-white font-bold text-right">
                          {spec.weight}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
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
