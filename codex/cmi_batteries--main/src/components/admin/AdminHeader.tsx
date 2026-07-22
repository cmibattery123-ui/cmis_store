"use client";

import { logoutUser } from "@/actions/auth";
import { Bell, LogOut, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
    <header className="h-14 bg-[#0d0d0d] border-b border-white/5 flex items-center justify-between px-4 lg:px-6 shrink-0 z-30">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-gray-400 hover:text-white"
          onClick={() => window.dispatchEvent(new Event("toggle-admin-sidebar"))}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="text-sm text-gray-400 hidden sm:block">
          Perfect Batteries{" "}
          <span className="text-white font-medium">Administration</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white w-8 h-8">
          <Bell className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 text-sm text-white">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center relative overflow-hidden shrink-0">
            {user.image ? (
              <Image src={user.image} alt="Avatar" fill className="object-cover" />
            ) : (
              <User className="w-3.5 h-3.5 text-primary" />
            )}
          </div>
          <span className="text-gray-300">{user.name ?? user.email}</span>
        </div>

        <form action={logoutUser}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-400 w-8 h-8"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
