"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname || "/admin")}`);
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.replace("/");
    }
  }, [status, session, router, pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white overflow-hidden transition-colors duration-200">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#07080C] transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
