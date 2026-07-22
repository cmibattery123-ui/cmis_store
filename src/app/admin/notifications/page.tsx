import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDateTime } from "@/lib/utils/api";
import {
  Bell, ShoppingCart, CreditCard, FileText,
  Users, Warehouse, Settings, CheckCircle, XCircle
} from "lucide-react";

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login?callbackUrl=/admin/notifications");
  }

  // Admin sees all notifications directed to them (we assume admin user id)
  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER": return <ShoppingCart className="w-4 h-4 text-blue-400" />;
      case "PAYMENT": return <CreditCard className="w-4 h-4 text-green-400" />;
      case "QUOTATION": return <FileText className="w-4 h-4 text-yellow-400" />;
      case "DEALER": return <Users className="w-4 h-4 text-purple-400" />;
      case "INVENTORY": return <Warehouse className="w-4 h-4 text-orange-400" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case "ORDER": return "bg-blue-400/10";
      case "PAYMENT": return "bg-green-400/10";
      case "QUOTATION": return "bg-yellow-400/10";
      case "DEALER": return "bg-purple-400/10";
      case "INVENTORY": return "bg-orange-400/10";
      default: return "bg-gray-400/10";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Notifications</h1>
          <p className="text-gray-400 text-sm mt-1">
            Stay updated on system alerts, dealer requests, and stock warnings.
          </p>
        </div>
        
        {/* We would typically have a "Mark all as read" button here via a Client Component */}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>You have no notifications at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-5 transition-colors hover:bg-white/[0.02] flex gap-4 ${n.read ? 'opacity-60' : 'bg-primary/5'}`}
              >
                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center mt-1 ${getBg(n.type)}`}>
                  {getIcon(n.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="font-heading font-bold text-white text-base">
                      {n.title}
                    </h3>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap uppercase tracking-widest mt-1 shrink-0">
                      {formatDateTime(new Date(n.createdAt))}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed mb-3">
                    {n.message}
                  </p>
                  
                  {n.link && (
                    <a 
                      href={n.link}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View Details →
                    </a>
                  )}
                </div>
                
                {!n.read && (
                  <div className="shrink-0 flex items-center justify-center self-start mt-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
