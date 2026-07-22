import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, ShoppingCart, MapPin, Bell, LogOut, Home } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

const navItems = [
  { href: "/customer", label: "Overview", icon: Home },
  { href: "/customer/orders", label: "My Orders", icon: ShoppingCart },
  { href: "/customer/profile", label: "Profile", icon: User },
  { href: "/customer/addresses", label: "Addresses", icon: MapPin },
];

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0D0D0D] border-r border-white/5 p-4 shrink-0">
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="font-heading font-bold text-black text-xs">PB</span>
          </div>
          <span className="font-heading font-bold text-white">{COMPANY_INFO.brand}</span>
        </Link>

        <div className="px-2 mb-6">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-2">
            <User className="w-5 h-5 text-primary" />
          </div>
          <p className="text-white font-medium text-sm">{session.user.name}</p>
          <p className="text-gray-500 text-xs">{session.user.email}</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden bg-[#0D0D0D] border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <span className="font-heading font-bold text-white">{COMPANY_INFO.brand}</span>
          <span className="text-gray-400 text-sm">My Account</span>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
