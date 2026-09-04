"use client";

import React, { useState, useEffect } from "react";
import TechnicalSpecsClient from "./TechnicalSpecsClient";
import { Loader2 } from "lucide-react";

export default function TechnicalSpecsPage() {
  const [specs, setSpecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSpecs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/technical-specs");
      const json = await res.json();
      if (res.ok && json.data) {
        setSpecs(json.data);
      }
    } catch (err) {
      console.error("Failed to load tech specs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSpecs();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-gray-400">
        <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
        <span className="text-xs font-mono">Loading technical specifications...</span>
      </div>
    );
  }

  return <TechnicalSpecsClient initialSpecs={specs} />;
}
