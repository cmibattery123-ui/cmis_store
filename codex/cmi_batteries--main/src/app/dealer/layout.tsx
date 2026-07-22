import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DealerSidebar from "@/components/dealer/DealerSidebar";
import DealerHeader from "@/components/dealer/DealerHeader";

export default async function DealerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Ensure user is logged in
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/dealer");
  }

  // Ensure user is a DEALER or ADMIN
  if (session.user.role !== "DEALER" && session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <DealerSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DealerHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
