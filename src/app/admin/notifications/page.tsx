"use client";

import React, { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils/api";
import {
  Bell, ShoppingCart, CreditCard, FileText,
  Users, Warehouse, Loader2, RefreshCw
} from "lucide-react";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications?limit=50");
      const json = await res.json();
      if (res.ok && json.data) {
        setNotifications(json.data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER": return <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "PAYMENT": return <CreditCard className="w-4 h-4 text-emerald-600 dark:text-green-400" />;
      case "QUOTATION": return <FileText className="w-4 h-4 text-amber-600 dark:text-yellow-400" />;
      case "DEALER": return <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case "INVENTORY": return <Warehouse className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      default: return <Bell className="w-4 h-4 text-slate-500 dark:text-gray-400" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case "ORDER": return "bg-blue-500/10";
      case "PAYMENT": return "bg-emerald-500/10";
      case "QUOTATION": return "bg-amber-500/10";
      case "DEALER": return "bg-purple-500/10";
      case "INVENTORY": return "bg-orange-500/10";
      default: return "bg-slate-500/10";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            Stay updated on system alerts, dealer requests, and stock warnings.
          </p>
        </div>
        <button
          onClick={() => loadNotifications()}
          className="p-2 rounded-xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-700 dark:text-gray-300"
          title="Refresh notifications"
          aria-label="Refresh notifications"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600 dark:text-primary" />
            <span className="text-xs font-mono">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notifications found.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
              <div className={`p-2.5 rounded-xl ${getBg(n.type)} shrink-0 mt-0.5`}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{n.title}</h3>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-gray-500 shrink-0">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
