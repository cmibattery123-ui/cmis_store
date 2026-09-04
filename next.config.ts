import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
    ],
  },
  experimental: {
    proxyClientMaxBodySize: "256gb",
    serverActions: {
      bodySizeLimit: "256gb",
      allowedOrigins: [
        "localhost:3000",
        process.env.NEXTAUTH_URL ?? "https://cmibattery.com",
      ],
    },
  },
  // Ensure Prisma & pg are not bundled into edge runtimes
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "bcryptjs"],
  output: "standalone",
};

export default nextConfig;
