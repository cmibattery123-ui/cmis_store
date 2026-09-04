"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session?.user) {
      router.replace("/auth/login?callbackUrl=/customer");
      return;
    }

    const role = (session.user as any)?.role;
    if (role === "ADMIN") {
      router.replace("/admin");
    } else if (role === "DEALER") {
      router.replace("/dealer");
    } else {
      router.replace("/customer");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-200">
      <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
    </div>
  );
}
