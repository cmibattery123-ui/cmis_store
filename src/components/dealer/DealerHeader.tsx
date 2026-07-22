"use client";

import { Bell, User, Menu } from "lucide-react";
import Image from "next/image";

interface DealerHeaderProps {
  user: { name?: string | null; email?: string | null; role: string; image?: string | null; };
}

export default function DealerHeader({ user }: DealerHeaderProps) {
  return (
    <header className="h-14 bg-[#0d0d0d] border-b border-white/5 px-4 lg:px-6 flex items-center justify-between shrink-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          className="lg:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          onClick={() => window.dispatchEvent(new Event("toggle-dealer-sidebar"))}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-xs text-gray-500 uppercase tracking-widest font-medium hidden sm:block">Dealer Portal</div>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center relative overflow-hidden shrink-0">
            {user.image ? (
              <Image src={user.image} alt="Avatar" fill className="object-cover" />
            ) : (
              <User className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-white text-xs font-medium leading-none">{user.name}</p>
            <p className="text-gray-500 text-[10px] mt-0.5">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
