import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/Providers";
import Navbar from "@/components/shared/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://cmi-batteries.pages.dev"),
  title: {
    default: "Perfect Batteries | Next-Generation Lithium Technology",
    template: "%s | Perfect Batteries",
  },
  description:
    "Power Your Ride with High-Performance Non-Maintenance Lithium Batteries Built by Chinna Mayil Industries, Coimbatore.",
  keywords: [
    "Lithium Battery",
    "Coimbatore",
    "Electric Vehicle Battery",
    "Perfect Batteries",
    "Chinna Mayil Industries",
    "Inverter Battery",
    "Non-Maintenance Battery",
    "Tamil Nadu Battery Manufacturer",
  ],
  authors: [{ name: "Chinna Mayil Industries" }],
  creator: "Chinna Mayil Industries",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://cmi-batteries.pages.dev",
    siteName: "Perfect Batteries",
    title: "Perfect Batteries | Next-Generation Lithium Technology",
    description:
      "High-performance non-maintenance lithium batteries from Chinna Mayil Industries.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Perfect Batteries",
    description: "Next-generation lithium battery technology from Coimbatore.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden selection:bg-primary selection:text-black">
        <Providers>
          <Navbar />
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                borderRadius: "1rem",
                fontFamily: "var(--font-sans)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
