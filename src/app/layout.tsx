import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

export const metadata: Metadata = {
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
    url: "https://cmibattery.com",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head />
      <body
        className={`${inter.variable} ${orbitron.variable} font-sans bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster position="bottom-right" theme="dark" richColors />
        </Providers>
      </body>
    </html>
  );
}
