import { Buffer } from "node:buffer";
if (typeof (globalThis as any).Buffer === "undefined") {
  (globalThis as any).Buffer = Buffer;
}

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { NextRequest } from "next/server";
import { resetDb } from "@/lib/db";

// Import all route handlers
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

const DEFAULT_ALLOWED_ORIGINS = [
  "https://cmi-batteries.pages.dev",
  "https://cmibattery.com",
  "https://www.cmibattery.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function isOriginAllowed(origin: string): boolean {
  try {
    const originUrl = new URL(origin);
    return DEFAULT_ALLOWED_ORIGINS.some((allowed) => {
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

function apiGatewayToRequest(event: APIGatewayProxyEvent): Request {
  const baseUrl = `https://${event.requestContext.domainName}`;
  const path = event.path || "/";
  const queryString = event.queryStringParameters
    ? "?" + new URLSearchParams(event.queryStringParameters as Record<string, string>).toString()
    : "";
  const url = `${path}${queryString}`;

  const headers = new Headers();
  if (event.headers) {
    for (const [key, value] of Object.entries(event.headers)) {
      if (value) headers.set(key, value);
    }
  }

  let body: BodyInit | undefined;
  if (event.body) {
    body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64")
      : event.body;
  }

  return new Request(`${baseUrl}${url}`, {
    method: event.httpMethod,
    headers,
    body: ["GET", "HEAD"].includes(event.httpMethod) ? undefined : body,
  });
}

function responseToApiGateway(response: Response, corsOrigin: string): Promise<APIGatewayProxyResult> {
  const headers: Record<string, string> = {};

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      headers[key] = value;
    }
  });

  // Handle Set-Cookie (multiple possible)
  if (typeof (response.headers as any).getSetCookie === "function") {
    const cookies: string[] = (response.headers as any).getSetCookie();
    if (cookies.length > 0) {
      headers["Set-Cookie"] = cookies.join(", ");
    }
  } else {
    const cookie = response.headers.get("Set-Cookie");
    if (cookie) headers["Set-Cookie"] = cookie;
  }

  // CORS headers
  if (corsOrigin) {
    headers["Access-Control-Allow-Origin"] = corsOrigin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, x-frontend-token";
  headers["Access-Control-Max-Age"] = "86400";

  return response.text().then((body) => ({
    statusCode: response.status,
    headers,
    body: body || "",
    isBase64Encoded: false,
  }));
}

async function routeRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method.toUpperCase();

  // /api/products
  if (pathname === "/api/products") {
    if (method === "GET") return productsGet(request as NextRequest);
  } else if (pathname.startsWith("/api/products/")) {
    const slug = pathname.replace("/api/products/", "");
    if (method === "GET") {
      return productSlugGet(request, { params: Promise.resolve({ slug }) });
    }
  }

  // /api/categories
  else if (pathname === "/api/categories") {
    if (method === "GET") return categoriesGet();
  }

  // /api/gallery
  else if (pathname === "/api/gallery") {
    if (method === "GET") return galleryGet();
  }

  // /api/cart
  else if (pathname === "/api/cart") {
    if (method === "GET") return cartGet(request);
    if (method === "POST") return cartPost(request);
  }

  // /api/checkout/razorpay
  else if (pathname === "/api/checkout/razorpay" && method === "POST") {
    return checkoutRazorpayPost(request as NextRequest);
  }

  // /api/payments/*
  else if (pathname === "/api/payments/create" && method === "POST") {
    return paymentsCreatePost(request);
  } else if (pathname === "/api/payments/razorpay" && method === "POST") {
    return paymentsRazorpayPost(request as NextRequest);
  } else if (pathname === "/api/payments/verify" && method === "POST") {
    return paymentsVerifyPost(request as NextRequest);
  } else if (pathname === "/api/payments/fail" && method === "POST") {
    return paymentsFailPost(request as NextRequest);
  } else if (pathname === "/api/webhooks/razorpay" && method === "POST") {
    return webhooksRazorpayPost(request as NextRequest);
  }

  // /api/auth/*
  else if (pathname === "/api/auth/register" && method === "POST") {
    return authRegisterPost(request);
  } else if (pathname === "/api/auth/dealer-register" && method === "POST") {
    return authDealerRegisterPost(request);
  } else if (pathname.startsWith("/api/auth/")) {
    const authUrl = new URL(pathname + url.search, "https://cmi-batteries-api.cmibatteryaws.workers.dev");
    const authHeaders = new Headers(request.headers);
    authHeaders.set("host", authUrl.host);
    authHeaders.set("x-forwarded-host", authUrl.host);
    authHeaders.set("x-forwarded-proto", "https");

    const authNextReq = new NextRequest(authUrl.toString(), {
      method: request.method,
      headers: authHeaders,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    });

    if (method === "GET") return nextauthGet(authNextReq as any);
    if (method === "POST") return nextauthPost(authNextReq as any);
  }

  // /api/customer/*
  else if (pathname === "/api/customer/orders") {
    if (method === "GET") return customerOrdersGet(request);
    if (method === "POST") return customerOrdersPost(request);
  } else if (pathname.startsWith("/api/customer/orders/")) {
    const id = pathname.replace("/api/customer/orders/", "");
    if (method === "GET") return customerOrderIdGet(request, { params: Promise.resolve({ id }) });
  } else if (pathname === "/api/customer/profile") {
    if (method === "GET") return customerProfileGet(request);
    if (method === "PATCH") return customerProfilePatch(request);
  } else if (pathname === "/api/customer/addresses") {
    if (method === "GET") return customerAddressesGet(request);
    if (method === "POST") return customerAddressesPost(request);
  } else if (pathname.startsWith("/api/customer/addresses/")) {
    const id = pathname.replace("/api/customer/addresses/", "");
    if (method === "DELETE") return customerAddressIdDelete(request, { params: Promise.resolve({ id }) });
  }

  // /api/dealer/*
  else if (pathname === "/api/dealer/dashboard") {
    if (method === "GET") return dealerDashboardGet(request);
  } else if (pathname === "/api/dealer/products") {
    if (method === "GET") return dealerProductsGet(request);
  } else if (pathname === "/api/dealer/orders") {
    if (method === "GET") return dealerOrdersGet(request);
  } else if (pathname === "/api/dealer/profile") {
    if (method === "GET") return dealerProfileGet(request);
  } else if (pathname === "/api/dealer/quotations") {
    if (method === "GET") return dealerQuotationsGet(request);
    if (method === "POST") return dealerQuotationsPost(request);
  }

  // /api/admin/*
  else if (pathname === "/api/admin/dashboard") {
    if (method === "GET") return adminDashboardGet(request);
  } else if (pathname === "/api/admin/products") {
    if (method === "GET") return adminProductsGet(request);
    if (method === "POST") return adminProductsPost(request);
  } else if (pathname.startsWith("/api/admin/products/")) {
    const id = pathname.replace("/api/admin/products/", "");
    if (method === "GET") return adminProductIdGet(request, { params: Promise.resolve({ id }) });
    if (method === "PATCH") return adminProductIdPatch(request, { params: Promise.resolve({ id }) });
    if (method === "DELETE") return adminProductIdDelete(request, { params: Promise.resolve({ id }) });
  } else if (pathname === "/api/admin/products/reorder" && method === "POST") {
    return adminProductsReorderPost(request);
  } else if (pathname === "/api/admin/categories") {
    if (method === "GET") return adminCategoriesGet(request);
    if (method === "POST") return adminCategoriesPost(request);
    if (method === "PATCH") return adminCategoriesPatch(request);
    if (method === "DELETE") return adminCategoriesDelete(request);
  } else if (pathname === "/api/admin/orders") {
    if (method === "GET") return adminOrdersGet(request);
    if (method === "PATCH") return adminOrdersPatch(request);
  } else if (pathname === "/api/admin/dealers") {
    if (method === "GET") return adminDealersGet(request);
    if (method === "PATCH") return adminDealersPatch(request);
  } else if (pathname.startsWith("/api/admin/dealers/")) {
    const id = pathname.replace("/api/admin/dealers/", "");
    if (method === "GET") return adminDealerIdGet(request, { params: Promise.resolve({ id }) });
  } else if (pathname === "/api/admin/quotations") {
    if (method === "GET") return adminQuotationsGet(request);
    if (method === "PATCH") return adminQuotationsPatch(request);
  } else if (pathname.startsWith("/api/admin/quotations/")) {
    const id = pathname.replace("/api/admin/quotations/", "");
    if (method === "GET") return adminQuotationIdGet(request, { params: Promise.resolve({ id }) });
    if (method === "PATCH") return adminQuotationIdPatch(request, { params: Promise.resolve({ id }) });
  } else if (pathname === "/api/admin/inventory") {
    if (method === "GET") return adminInventoryGet(request);
    if (method === "PATCH") return adminInventoryPatch(request);
  } else if (pathname === "/api/admin/gallery") {
    if (method === "GET") return adminGalleryGet(request);
    if (method === "POST") return adminGalleryPost(request);
  } else if (pathname.startsWith("/api/admin/gallery/")) {
    const id = pathname.replace("/api/admin/gallery/", "");
    if (method === "GET") return adminGalleryIdGet(request, { params: Promise.resolve({ id }) });
    if (method === "PUT") return adminGalleryIdPut(request, { params: Promise.resolve({ id }) });
    if (method === "DELETE") return adminGalleryIdDelete(request, { params: Promise.resolve({ id }) });
  } else if (pathname === "/api/admin/technical-specs") {
    if (method === "GET") return adminTechnicalSpecsGet(request);
    if (method === "POST") return adminTechnicalSpecsPost(request);
    if (method === "PATCH") return adminTechnicalSpecsPatch(request);
  } else if (pathname.startsWith("/api/admin/technical-specs/")) {
    const id = pathname.replace("/api/admin/technical-specs/", "");
    if (method === "PUT") return adminTechnicalSpecIdPut(request, { params: Promise.resolve({ id }) });
    if (method === "DELETE") return adminTechnicalSpecIdDelete(request, { params: Promise.resolve({ id }) });
  } else if (pathname === "/api/admin/analytics") {
    if (method === "GET") return adminAnalyticsGet(request);
  } else if (pathname === "/api/admin/customers") {
    if (method === "GET") return adminCustomersGet(request);
  } else if (pathname === "/api/admin/payments") {
    if (method === "GET") return adminPaymentsGet(request);
  } else if (pathname === "/api/admin/notifications") {
    if (method === "GET") return adminNotificationsGet(request);
    if (method === "POST") return adminNotificationsPost(request);
  } else if (pathname === "/api/admin/settings/payment") {
    if (method === "GET") return adminSettingsPaymentGet(request);
    if (method === "POST") return adminSettingsPaymentPost(request as any);
  } else if (pathname === "/api/admin/profile") {
    if (method === "PATCH") return adminProfilePatch(request);
  }

  // /api/upload
  else if (pathname === "/api/upload" && method === "POST") {
    return uploadPost(request);
  }

  // /api/media/:id
  else if (pathname.startsWith("/api/media/")) {
    const id = pathname.replace("/api/media/", "");
    if (method === "GET") return mediaIdGet(request as NextRequest, { params: Promise.resolve({ id }) });
    if (method === "HEAD") return mediaIdHead(request as NextRequest, { params: Promise.resolve({ id }) });
  }

  return null;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    const origin = event.headers?.Origin || event.headers?.origin || "";
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": isOriginAllowed(origin) ? origin : "",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, x-frontend-token",
        "Access-Control-Max-Age": "86400",
      },
      body: "",
    };
  }

  // Set environment variables
  process.env.DATABASE_URL = process.env.DATABASE_URL || "";
  process.env.DIRECT_URL = process.env.DIRECT_URL || "";
  process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET || "";
  process.env.AUTH_SECRET = process.env.AUTH_SECRET || "";
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "https://cmi-batteries.pages.dev";
  process.env.AUTH_URL = process.env.AUTH_URL || "https://cmi-batteries.pages.dev";
  process.env.ADMIN_SECURITY_PIN = process.env.ADMIN_SECURITY_PIN || "";
  process.env.PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || "RAZORPAY";
  process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  process.env.RAZORPAY_SECRET = process.env.RAZORPAY_SECRET || "";
  process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
  process.env.AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID || "";
  process.env.AUTH_GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET || "";
  process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
  process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

  const request = apiGatewayToRequest(event);
  const origin = event.headers?.Origin || event.headers?.origin || "";
  const corsOrigin = isOriginAllowed(origin) ? origin : DEFAULT_ALLOWED_ORIGINS[0];

  try {
    const response = await routeRequest(request);

    if (!response) {
      return responseToApiGateway(
        new Response(JSON.stringify({ error: `Not found: ${event.httpMethod} ${event.path}` }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }),
        corsOrigin
      );
    }

    return responseToApiGateway(response, corsOrigin);
  } catch (err: unknown) {
    console.error("[Lambda API Error]", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return responseToApiGateway(
      new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
      corsOrigin
    );
  }
};
