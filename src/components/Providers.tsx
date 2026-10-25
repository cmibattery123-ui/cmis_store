"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/store/cart";
import { WhatsAppSettingsProvider } from "@/store/whatsapp-settings";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      baseUrl={process.env.NEXT_PUBLIC_API_URL || ""}
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <WhatsAppSettingsProvider>
          <CartProvider>{children}</CartProvider>
        </WhatsAppSettingsProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}


