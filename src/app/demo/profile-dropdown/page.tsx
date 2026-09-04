"use client";

import React from "react";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";

export default function ProfileDropdownDemoPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#0d0d0e] border border-zinc-800/80 rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col items-center gap-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold font-heading tracking-tight text-white">
            User Profile Dropdown
          </h1>
          <p className="text-xs text-zinc-400">
            Pixel-inspired Next.js + Tailwind CSS + NextAuth.js component
          </p>
        </div>

        {/* Top Header Mock Bar showing the trigger and dropdown placement */}
        <div className="w-full bg-[#18181b]/70 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-300">Header Preview</span>
          {/* Component Render */}
          <UserProfileDropdown dashboardHref="/dashboard" />
        </div>

        <div className="w-full text-xs text-zinc-500 space-y-2 pt-2 border-t border-zinc-800/60">
          <p className="font-semibold text-zinc-400">Component Features:</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400">
            <li>Circular trigger button (<code className="text-yellow-400">bg-[#27272a]/60</code>)</li>
            <li>Dark menu panel (<code className="text-yellow-400">bg-[#141415]</code>, <code className="text-yellow-400">rounded-2xl</code>)</li>
            <li>Click-outside & Escape key auto-close detection</li>
            <li>Integrated with NextAuth <code className="text-yellow-400">useSession()</code> & <code className="text-yellow-400">signOut()</code></li>
            <li>Horizontal section borders (<code className="text-yellow-400">border-b border-zinc-800/80</code>)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
