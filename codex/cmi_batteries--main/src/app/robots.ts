import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://cmibattery.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/about", "/contact", "/warranty"],
        disallow: ["/admin", "/dealer", "/customer", "/api", "/checkout", "/cart"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
