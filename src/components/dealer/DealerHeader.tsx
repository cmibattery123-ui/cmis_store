"use client";

import { Bell, User, Menu } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface DealerHeaderProps {
  user: { name?: string | null; email?: string | null; role: string; image?: string | null; };
}

export default function DealerHeader({ user }: DealerHeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-[#0C0D14] border-b border-slate-200 dark:border-white/10 px-4 lg:px-6 flex items-center justify-between shrink-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button 
          className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          onClick={() => window.dispatchEvent(new Event("toggle-dealer-sidebar"))}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-xs font-mono font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest hidden sm:block">Dealer Portal</div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-white/10">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-primary/20 flex items-center justify-center relative overflow-hidden shrink-0">
            {user.image ? (
              <Image src={user.image} alt="Avatar" fill className="object-cover" />
            ) : (
              <User className="w-4 h-4 text-amber-600 dark:text-primary" />
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-slate-900 dark:text-white text-xs font-bold leading-none">{user.name}</p>
            <p className="text-slate-500 dark:text-gray-400 text-[10px] font-mono mt-0.5 uppercase">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
