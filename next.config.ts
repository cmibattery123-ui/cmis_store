import type { NextConfig } from "next";

const s3StaticUrl = process.env.S3_STATIC_URL || process.env.NEXT_PUBLIC_S3_STATIC_URL;

const nextConfig: NextConfig = {
  assetPrefix: s3StaticUrl ? s3StaticUrl.replace(/\/$/, "") : undefined,
  compress: true,
  images: {
    unoptimized: true,
    formats: ["image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
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
  // Ensure Prisma, pg, and better-sqlite3 native bindings are not bundled into client/edge runtimes
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "@prisma/adapter-better-sqlite3",
    "better-sqlite3",
    "pg",
    "bcryptjs",
  ],
  output: "standalone",
};

export default nextConfig;
