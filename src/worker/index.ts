import { Buffer } from "node:buffer";
if (typeof (globalThis as any).Buffer === "undefined") {
  (globalThis as any).Buffer = Buffer;
}

import { NextRequest } from "next/server";
import { GET as productsGet } from "@/app/api/products/route";
import { GET as productSlugGet } from "@/app/api/products/[slug]/route";
import { GET as categoriesGet } from "@/app/api/categories/route";
import { GET as galleryGet } from "@/app/api/gallery/route";
import { GET as cartGet, POST as cartPost } from "@/app/api/cart/route";
import { POST as checkoutRazorpayPost } from "@/app/api/checkout/razorpay/route";
import { POST as paymentsCreatePost } from "@/app/api/payments/create/route";
import { POST as paymentsRazorpayPost } from "@/app/api/payments/razorpay/route";
import { POST as paymentsVerifyPost } from "@/app/api/payments/verify/route";
import { POST as paymentsFailPost } from "@/app/api/payments/fail/route";
import { POST as webhooksRazorpayPost } from "@/app/api/webhooks/razorpay/route";
import { POST as authRegisterPost } from "@/app/api/auth/register/route";
import { POST as authDealerRegisterPost } from "@/app/api/auth/dealer-register/route";
import { GET as nextauthGet, POST as nextauthPost } from "@/app/api/auth/[...nextauth]/route";
import { GET as customerOrdersGet, POST as customerOrdersPost } from "@/app/api/customer/orders/route";
import { GET as customerOrderIdGet } from "@/app/api/customer/orders/[id]/route";
import { GET as customerProfileGet, PATCH as customerProfilePatch } from "@/app/api/customer/profile/route";
import { GET as customerAddressesGet, POST as customerAddressesPost } from "@/app/api/customer/addresses/route";
import { DELETE as customerAddressIdDelete } from "@/app/api/customer/addresses/[id]/route";
import { GET as dealerQuotationsGet, POST as dealerQuotationsPost } from "@/app/api/dealer/quotations/route";
import { GET as dealerDashboardGet } from "@/app/api/dealer/dashboard/route";
import { GET as dealerProductsGet } from "@/app/api/dealer/products/route";
import { GET as dealerOrdersGet } from "@/app/api/dealer/orders/route";
import { GET as dealerProfileGet } from "@/app/api/dealer/profile/route";
import { GET as adminDashboardGet } from "@/app/api/admin/dashboard/route";
import { GET as adminProductsGet, POST as adminProductsPost } from "@/app/api/admin/products/route";
import { GET as adminProductIdGet, PATCH as adminProductIdPatch, DELETE as adminProductIdDelete } from "@/app/api/admin/products/[id]/route";
import { POST as adminProductsReorderPost } from "@/app/api/admin/products/reorder/route";
import { GET as adminCategoriesGet, POST as adminCategoriesPost, PATCH as adminCategoriesPatch, DELETE as adminCategoriesDelete } from "@/app/api/admin/categories/route";
import { GET as adminOrdersGet, PATCH as adminOrdersPatch } from "@/app/api/admin/orders/route";
import { GET as adminDealersGet, PATCH as adminDealersPatch } from "@/app/api/admin/dealers/route";
import { GET as adminDealerIdGet } from "@/app/api/admin/dealers/[id]/route";
import { GET as adminQuotationsGet, PATCH as adminQuotationsPatch } from "@/app/api/admin/quotations/route";
import { GET as adminQuotationIdGet, PATCH as adminQuotationIdPatch } from "@/app/api/admin/quotations/[id]/route";
import { GET as adminInventoryGet, PATCH as adminInventoryPatch } from "@/app/api/admin/inventory/route";
import { GET as adminGalleryGet, POST as adminGalleryPost } from "@/app/api/admin/gallery/route";
import { GET as adminGalleryIdGet, PUT as adminGalleryIdPut, DELETE as adminGalleryIdDelete } from "@/app/api/admin/gallery/[id]/route";
import { GET as adminTechnicalSpecsGet, POST as adminTechnicalSpecsPost, PATCH as adminTechnicalSpecsPatch } from "@/app/api/admin/technical-specs/route";
import { PUT as adminTechnicalSpecIdPut, DELETE as adminTechnicalSpecIdDelete } from "@/app/api/admin/technical-specs/[id]/route";
import { GET as adminAnalyticsGet } from "@/app/api/admin/analytics/route";
import { GET as adminCustomersGet } from "@/app/api/admin/customers/route";
import { GET as adminPaymentsGet } from "@/app/api/admin/payments/route";
import { GET as adminNotificationsGet, POST as adminNotificationsPost } from "@/app/api/admin/notifications/route";
import { GET as adminSettingsPaymentGet, POST as adminSettingsPaymentPost } from "@/app/api/admin/settings/payment/route";
import { PATCH as adminProfilePatch } from "@/app/api/admin/profile/route";
import { POST as uploadPost } from "@/app/api/upload/route";
import { GET as mediaIdGet, HEAD as mediaIdHead } from "@/app/api/media/[id]/route";
import { resetDb } from "@/lib/db";

export interface Env {
  HYPERDRIVE?: { connectionString: string };
  R2_MEDIA?: { get: Function; put: Function; delete: Function; list: Function; head: Function };
  ALLOWED_ORIGINS?: string;
  FRONTEND_SHARED_SECRET?: string;
  DATABASE_URL?: string;
  DIRECT_URL?: string;
  NEXTAUTH_SECRET?: string;
  AUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
  AUTH_URL?: string;
  ADMIN_SECURITY_PIN?: string;
  PAYMENT_PROVIDER?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_SECRET?: string;
  RAZORPAY_KEY_SECRET?: string;
  NEXT_PUBLIC_RAZORPAY_KEY_ID?: string;
  AUTH_GOOGLE_ID?: string;
  AUTH_GOOGLE_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  R2_ENDPOINT?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET?: string;
  R2_PUBLIC_URL?: string;
}

const DEFAULT_ALLOWED_ORIGINS = [
  "https://cmi-batteries.pages.dev",
  "https://cmibattery.com",
  "https://www.cmibattery.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  try {
    const originUrl = new URL(origin);
    return allowedOrigins.some((allowed) => {
      try {
        const allowedUrl = new URL(allowed);
        return originUrl.origin === allowedUrl.origin;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

function verifyRequest(
  request: Request,
  env: Env
): { allowed: boolean; origin: string | null; reason?: string } {
  const originHeader = request.headers.get("Origin");
  const refererHeader = request.headers.get("Referer");
  const frontendToken =
    request.headers.get("x-frontend-token") || request.headers.get("X-Frontend-Token");

  const envOrigins = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowedList = [...DEFAULT_ALLOWED_ORIGINS, ...envOrigins];

  // 1. Authorized via internal shared secret from Pages Proxy
  const expectedSecret = env.FRONTEND_SHARED_SECRET || "cmi-storefront-internal-secure-token";
  if (frontendToken && frontendToken === expectedSecret) {
    const origin = originHeader || (refererHeader ? new URL(refererHeader).origin : allowedList[0]);
    return { allowed: true, origin };
  }

  // 2. Direct browser CORS request with verified Origin
  if (originHeader && isOriginAllowed(originHeader, allowedList)) {
    return { allowed: true, origin: originHeader };
  }

  // 3. Request with verified Referer
  if (refererHeader) {
    try {
      const refOrigin = new URL(refererHeader).origin;
      if (isOriginAllowed(refOrigin, allowedList)) {
        return { allowed: true, origin: refOrigin };
      }
    } catch {
      // Ignore invalid URL
    }
  }

  // Unauthorized direct invocation
  return {
    allowed: false,
    origin: null,
    reason:
      "Forbidden: Direct API access is not permitted. Requests must originate from the authorized CMI frontend storefront.",
  };
}

async function setCorsHeaders(response: Response, origin: string | null): Promise<Response> {
  const headers = new Headers();
  for (const [k, v] of response.headers.entries()) {
    if (k.toLowerCase() !== "set-cookie") {
      headers.set(k, v);
    }
  }

  // Preserve multiple Set-Cookie headers accurately
  if (typeof (response.headers as any).getSetCookie === "function") {
    const cookies: string[] = (response.headers as any).getSetCookie();
    for (const cookie of cookies) {
      headers.append("Set-Cookie", cookie);
    }
  } else {
    const rawCookie = response.headers.get("Set-Cookie");
    if (rawCookie) {
      headers.set("Set-Cookie", rawCookie);
    }
  }

  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, x-frontend-token, Sec-Fetch-Site, Sec-Fetch-Mode"
  );
  headers.set("Access-Control-Max-Age", "86400");

  const isNoBodyStatus = [204, 205, 304].includes(response.status);
  let finalBody: string | null = null;

  if (!isNoBodyStatus) {
    try {
      finalBody = await response.text();
    } catch {
      finalBody = "";
    }
  }

  return new Response(finalBody, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();

    // 1. Verify caller origin and shared credentials
    const { allowed, origin, reason } = verifyRequest(request, env);

    // Handle OPTIONS Preflight
    if (method === "OPTIONS") {
      if (!allowed) {
        return new Response(
          JSON.stringify({ error: "Preflight blocked: Origin not allowed" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      return await setCorsHeaders(new Response(null, { status: 204 }), origin);
    }

    // Block non-frontend / direct requests
    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: reason || "Forbidden: Direct API access denied",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff",
          },
        }
      );
    }

    // Set process.env from Worker env bindings strictly (prioritize Hyperdrive connection pool)
    if ((env as any).HYPERDRIVE?.connectionString) {
      process.env.IS_HYPERDRIVE = "true";
      process.env.DATABASE_URL = (env as any).HYPERDRIVE.connectionString;
      process.env.DIRECT_URL = (env as any).HYPERDRIVE.connectionString;
    } else {
      process.env.IS_HYPERDRIVE = "false";
      if (env.DATABASE_URL) process.env.DATABASE_URL = env.DATABASE_URL as string;
      if (env.DIRECT_URL) process.env.DIRECT_URL = env.DIRECT_URL as string;
    }
    if (env.NEXTAUTH_SECRET) {
      process.env.NEXTAUTH_SECRET = env.NEXTAUTH_SECRET as string;
      process.env.AUTH_SECRET = env.NEXTAUTH_SECRET as string;
    }
    if (env.AUTH_SECRET) {
      process.env.AUTH_SECRET = env.AUTH_SECRET as string;
      process.env.NEXTAUTH_SECRET = env.AUTH_SECRET as string;
    }
    if (env.NEXTAUTH_URL) process.env.NEXTAUTH_URL = env.NEXTAUTH_URL as string;
    if (env.AUTH_URL) process.env.AUTH_URL = env.AUTH_URL as string;
    if (env.ADMIN_SECURITY_PIN) process.env.ADMIN_SECURITY_PIN = env.ADMIN_SECURITY_PIN as string;
    if (env.PAYMENT_PROVIDER) process.env.PAYMENT_PROVIDER = env.PAYMENT_PROVIDER as string;
    if (env.RAZORPAY_KEY_ID) process.env.RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID as string;
    if (env.NEXT_PUBLIC_RAZORPAY_KEY_ID) process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string;
    if (env.RAZORPAY_SECRET) process.env.RAZORPAY_SECRET = env.RAZORPAY_SECRET as string;
    if (env.RAZORPAY_KEY_SECRET) process.env.RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET as string;
    if (env.AUTH_GOOGLE_ID) process.env.AUTH_GOOGLE_ID = env.AUTH_GOOGLE_ID as string;
    if (env.AUTH_GOOGLE_SECRET) process.env.AUTH_GOOGLE_SECRET = env.AUTH_GOOGLE_SECRET as string;
    if (env.GOOGLE_CLIENT_ID) process.env.GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID as string;
    if (env.GOOGLE_CLIENT_SECRET) process.env.GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET as string;
    if (env.R2_ENDPOINT) process.env.R2_ENDPOINT = env.R2_ENDPOINT as string;
    if (env.R2_ACCESS_KEY_ID) process.env.R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID as string;
    if (env.R2_SECRET_ACCESS_KEY) process.env.R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY as string;
    if (env.R2_BUCKET) process.env.R2_BUCKET = env.R2_BUCKET as string;
    if (env.R2_PUBLIC_URL) process.env.R2_PUBLIC_URL = env.R2_PUBLIC_URL as string;

    const asNextReq = request as unknown as NextRequest;
    let res: Response | undefined;

    try {
      // /api/products
      if (pathname === "/api/products") {
        if (method === "GET") res = await productsGet(asNextReq);
      } else if (pathname.startsWith("/api/products/")) {
        const slug = pathname.replace("/api/products/", "");
        if (method === "GET") {
          res = await productSlugGet(request, { params: Promise.resolve({ slug }) });
        }
      }

      // /api/categories
      else if (pathname === "/api/categories") {
        if (method === "GET") res = await categoriesGet();
      }

      // /api/gallery
      else if (pathname === "/api/gallery") {
        if (method === "GET") res = await galleryGet();
      }

      // /api/cart
      else if (pathname === "/api/cart") {
        if (method === "GET") res = await cartGet(request);
        if (method === "POST") res = await cartPost(request);
      }

      // /api/checkout/razorpay
      else if (pathname === "/api/checkout/razorpay" && method === "POST") {
        res = await checkoutRazorpayPost(asNextReq);
      }

      // /api/payments/*
      else if (pathname === "/api/payments/create" && method === "POST") {
        res = await paymentsCreatePost(request);
      } else if (pathname === "/api/payments/razorpay" && method === "POST") {
        res = await paymentsRazorpayPost(asNextReq);
      } else if (pathname === "/api/payments/verify" && method === "POST") {
        res = await paymentsVerifyPost(asNextReq);
      } else if (pathname === "/api/payments/fail" && method === "POST") {
        res = await paymentsFailPost(asNextReq);
      } else if (pathname === "/api/webhooks/razorpay" && method === "POST") {
        res = await webhooksRazorpayPost(asNextReq);
      }

      // /api/auth/*
      else if (pathname === "/api/auth/register" && method === "POST") {
        res = await authRegisterPost(request);
      } else if (pathname === "/api/auth/dealer-register" && method === "POST") {
        res = await authDealerRegisterPost(request);
      } else if (pathname.startsWith("/api/auth/")) {
        const authUrl = new URL(pathname + url.search, origin || "https://cmi-batteries.pages.dev");
        const authHeaders = new Headers(request.headers);
        authHeaders.set("host", authUrl.host);
        authHeaders.set("x-forwarded-host", authUrl.host);
        authHeaders.set("x-forwarded-proto", "https");

        const authNextReq = new NextRequest(authUrl.toString(), {
          method: request.method,
          headers: authHeaders,
          body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        });

        if (method === "GET") res = await nextauthGet(authNextReq as any);
        if (method === "POST") res = await nextauthPost(authNextReq as any);
      }

      // /api/customer/*
      else if (pathname === "/api/customer/orders") {
        if (method === "GET") res = await customerOrdersGet(request);
        if (method === "POST") res = await customerOrdersPost(request);
      } else if (pathname.startsWith("/api/customer/orders/")) {
        const id = pathname.replace("/api/customer/orders/", "");
        if (method === "GET") res = await customerOrderIdGet(request, { params: Promise.resolve({ id }) });
      } else if (pathname === "/api/customer/profile") {
        if (method === "GET") res = await customerProfileGet(request);
        if (method === "PATCH") res = await customerProfilePatch(request);
      } else if (pathname === "/api/customer/addresses") {
        if (method === "GET") res = await customerAddressesGet(request);
        if (method === "POST") res = await customerAddressesPost(request);
      } else if (pathname.startsWith("/api/customer/addresses/")) {
        const id = pathname.replace("/api/customer/addresses/", "");
        if (method === "DELETE") res = await customerAddressIdDelete(request, { params: Promise.resolve({ id }) });
      }

      // /api/dealer/*
      else if (pathname === "/api/dealer/dashboard") {
        if (method === "GET") res = await dealerDashboardGet(request);
      } else if (pathname === "/api/dealer/products") {
        if (method === "GET") res = await dealerProductsGet(request);
      } else if (pathname === "/api/dealer/orders") {
        if (method === "GET") res = await dealerOrdersGet(request);
      } else if (pathname === "/api/dealer/profile") {
        if (method === "GET") res = await dealerProfileGet(request);
      } else if (pathname === "/api/dealer/quotations") {
        if (method === "GET") res = await dealerQuotationsGet(request);
        if (method === "POST") res = await dealerQuotationsPost(request);
      }

      // /api/admin/*
      else if (pathname === "/api/admin/dashboard") {
        if (method === "GET") res = await adminDashboardGet(request);
      } else if (pathname === "/api/admin/products") {
        if (method === "GET") res = await adminProductsGet(request);
        if (method === "POST") res = await adminProductsPost(request);
      } else if (pathname.startsWith("/api/admin/products/")) {
        const id = pathname.replace("/api/admin/products/", "");
        if (method === "GET") res = await adminProductIdGet(request, { params: Promise.resolve({ id }) });
        if (method === "PATCH") res = await adminProductIdPatch(request, { params: Promise.resolve({ id }) });
        if (method === "DELETE") res = await adminProductIdDelete(request, { params: Promise.resolve({ id }) });
      } else if (pathname === "/api/admin/products/reorder" && method === "POST") {
        res = await adminProductsReorderPost(request);
      } else if (pathname === "/api/admin/categories") {
        if (method === "GET") res = await adminCategoriesGet(request);
        if (method === "POST") res = await adminCategoriesPost(request);
        if (method === "PATCH") res = await adminCategoriesPatch(request);
        if (method === "DELETE") res = await adminCategoriesDelete(request);
      } else if (pathname === "/api/admin/orders") {
        if (method === "GET") res = await adminOrdersGet(request);
        if (method === "PATCH") res = await adminOrdersPatch(request);
      } else if (pathname === "/api/admin/dealers") {
        if (method === "GET") res = await adminDealersGet(request);
        if (method === "PATCH") res = await adminDealersPatch(request);
      } else if (pathname.startsWith("/api/admin/dealers/")) {
        const id = pathname.replace("/api/admin/dealers/", "");
        if (method === "GET") res = await adminDealerIdGet(request, { params: Promise.resolve({ id }) });
      } else if (pathname === "/api/admin/quotations") {
        if (method === "GET") res = await adminQuotationsGet(request);
        if (method === "PATCH") res = await adminQuotationsPatch(request);
      } else if (pathname.startsWith("/api/admin/quotations/")) {
        const id = pathname.replace("/api/admin/quotations/", "");
        if (method === "GET") res = await adminQuotationIdGet(request, { params: Promise.resolve({ id }) });
        if (method === "PATCH") res = await adminQuotationIdPatch(request, { params: Promise.resolve({ id }) });
      } else if (pathname === "/api/admin/inventory") {
        if (method === "GET") res = await adminInventoryGet(request);
        if (method === "PATCH") res = await adminInventoryPatch(request);
      } else if (pathname === "/api/admin/gallery") {
        if (method === "GET") res = await adminGalleryGet(request);
        if (method === "POST") res = await adminGalleryPost(request);
      } else if (pathname.startsWith("/api/admin/gallery/")) {
        const id = pathname.replace("/api/admin/gallery/", "");
        if (method === "GET") res = await adminGalleryIdGet(request, { params: Promise.resolve({ id }) });
        if (method === "PUT") res = await adminGalleryIdPut(request, { params: Promise.resolve({ id }) });
        if (method === "DELETE") res = await adminGalleryIdDelete(request, { params: Promise.resolve({ id }) });
      } else if (pathname === "/api/admin/technical-specs") {
        if (method === "GET") res = await adminTechnicalSpecsGet(request);
        if (method === "POST") res = await adminTechnicalSpecsPost(request);
        if (method === "PATCH") res = await adminTechnicalSpecsPatch(request);
      } else if (pathname.startsWith("/api/admin/technical-specs/")) {
        const id = pathname.replace("/api/admin/technical-specs/", "");
        if (method === "PUT") res = await adminTechnicalSpecIdPut(request, { params: Promise.resolve({ id }) });
        if (method === "DELETE") res = await adminTechnicalSpecIdDelete(request, { params: Promise.resolve({ id }) });
      } else if (pathname === "/api/admin/analytics") {
        if (method === "GET") res = await adminAnalyticsGet(request);
      } else if (pathname === "/api/admin/customers") {
        if (method === "GET") res = await adminCustomersGet(request);
      } else if (pathname === "/api/admin/payments") {
        if (method === "GET") res = await adminPaymentsGet(request);
      } else if (pathname === "/api/admin/notifications") {
        if (method === "GET") res = await adminNotificationsGet(request);
        if (method === "POST") res = await adminNotificationsPost(request);
      } else if (pathname === "/api/admin/settings/payment") {
        if (method === "GET") res = await adminSettingsPaymentGet(request);
        if (method === "POST") res = await adminSettingsPaymentPost(request as any);
      } else if (pathname === "/api/admin/profile") {
        if (method === "PATCH") res = await adminProfilePatch(request);
      }

      // /api/upload
      else if (pathname === "/api/upload" && method === "POST") {
        res = await uploadPost(request);
      }

      // /api/media/r2/:key (Cloudflare R2 media serving)
      else if (pathname.startsWith("/api/media/r2/")) {
        const r2Key = decodeURIComponent(pathname.replace("/api/media/r2/", ""));
        if (method === "GET" || method === "HEAD") {
          const r2Bucket = (env as any).R2_MEDIA;
          if (!r2Bucket) {
            res = new Response(JSON.stringify({ error: "R2 storage not configured" }), {
              status: 503,
              headers: { "Content-Type": "application/json" },
            });
          } else {
            try {
              const r2Object = await r2Bucket.get(r2Key);
              if (!r2Object) {
                res = new Response(JSON.stringify({ error: "File not found" }), {
                  status: 404,
                  headers: { "Content-Type": "application/json" },
                });
              } else {
                const headers = new Headers();
                headers.set("Content-Type", r2Object.httpMetadata?.contentType || "application/octet-stream");
                headers.set("Content-Length", String(r2Object.size));
                headers.set("Accept-Ranges", "bytes");
                headers.set("Cache-Control", "public, max-age=31536000, immutable");
                if (r2Object.httpEtag) headers.set("ETag", r2Object.httpEtag);

                // Handle Range requests for video streaming
                const rangeHeader = request.headers.get("Range");
                if (rangeHeader && method === "GET") {
                  const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/);
                  if (rangeMatch) {
                    const start = parseInt(rangeMatch[1], 10);
                    const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : r2Object.size - 1;
                    const contentLength = end - start + 1;

                    const r2Range = await r2Bucket.get(r2Key, { range: { offset: start, length: contentLength } });
                    if (r2Range) {
                      headers.set("Content-Length", String(contentLength));
                      headers.set("Content-Range", `bytes ${start}-${end}/${r2Object.size}`);
                      res = new Response(r2Range.body, { status: 206, headers });
                    }
                  }
                }

                if (!res) {
                  res = new Response(r2Object.body, { status: 200, headers });
                }
              }
            } catch (err: any) {
              if (err.message === "Not Found") {
                res = new Response(JSON.stringify({ error: "File not found" }), {
                  status: 404,
                  headers: { "Content-Type": "application/json" },
                });
              } else {
                throw err;
              }
            }
          }
        }
      }

      // /api/media/:id (legacy PostgreSQL chunked storage)
      else if (pathname.startsWith("/api/media/")) {
        const id = pathname.replace("/api/media/", "");
        if (method === "GET") res = await mediaIdGet(asNextReq, { params: Promise.resolve({ id }) });
        if (method === "HEAD") res = await mediaIdHead(asNextReq, { params: Promise.resolve({ id }) });
      }

      if (!res) {
        return await setCorsHeaders(
          new Response(JSON.stringify({ error: `Not found: ${method} ${pathname}` }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }),
          origin
        );
      }

      return await setCorsHeaders(res, origin);
    } catch (err: unknown) {
      console.error("[Worker API Error]", err);
      const errorMessage = err instanceof Error ? err.message : "Internal server error";
      return await setCorsHeaders(
        new Response(JSON.stringify({ error: errorMessage }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }),
        origin
      );
    }
  },
};
