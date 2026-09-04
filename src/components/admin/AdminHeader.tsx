"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-[#0C0D14] border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4 lg:px-6 shrink-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
          onClick={() => window.dispatchEvent(new Event("toggle-admin-sidebar"))}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="text-xs font-mono font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest hidden sm:block">
          Perfect Batteries{" "}
          <span className="text-slate-900 dark:text-white font-bold">Admin Panel</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href="/admin/notifications">
          <Button variant="ghost" size="icon" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white w-9 h-9 rounded-xl cursor-pointer">
            <Bell className="w-4 h-4" />
          </Button>
        </Link>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-primary/20 flex items-center justify-center relative overflow-hidden shrink-0">
            {user.image ? (
              <Image src={user.image} alt="Avatar" fill className="object-cover" />
            ) : (
              <User className="w-4 h-4 text-amber-600 dark:text-primary" />
            )}
          </div>
          <span className="text-slate-700 dark:text-gray-300 font-bold text-xs">{user.name ?? user.email}</span>
        </div>

        <Button
          type="button"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          variant="ghost"
          size="icon"
          className="text-slate-400 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 w-9 h-9 rounded-xl"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
