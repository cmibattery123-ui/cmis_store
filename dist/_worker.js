export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Forward /api/* requests to the Cloudflare Worker Backend API
    if (url.pathname.startsWith("/api/")) {
      const backendUrl = env.BACKEND_API_URL || "https://cmi-batteries-api.cmibatteryaws.workers.dev";
      const targetUrl = new URL(url.pathname + url.search, backendUrl);

      const forwardHeaders = new Headers(request.headers);
      forwardHeaders.delete("host");
      forwardHeaders.delete("content-length");
      forwardHeaders.delete("cf-connecting-ip");
      forwardHeaders.delete("cf-ray");
      forwardHeaders.delete("cf-visitor");
      forwardHeaders.set(
        "x-frontend-token",
        env.FRONTEND_SHARED_SECRET || "cmi-storefront-internal-secure-token"
      );
      forwardHeaders.set("Origin", url.origin);
      forwardHeaders.set("Referer", request.url);
      forwardHeaders.set("x-forwarded-host", url.host);
      forwardHeaders.set("x-forwarded-proto", url.protocol.replace(":", ""));

      try {
        const hasBody = !["GET", "HEAD"].includes(request.method);
        const reqBody = hasBody ? await request.text() : undefined;

        const backendRes = await fetch(targetUrl.toString(), {
          method: request.method,
          headers: forwardHeaders,
          body: reqBody,
          redirect: "manual",
        });

        const resHeaders = new Headers();
        for (const [k, v] of backendRes.headers.entries()) {
          if (k.toLowerCase() !== "set-cookie") {
            resHeaders.set(k, v);
          }
        }

        function rewriteCookieDomain(cookie) {
          return cookie
            .replace(/Domain=[^;]+;?/gi, "")
            .replace(/;\s*$/, "");
        }

        if (typeof backendRes.headers.getSetCookie === "function") {
          for (const c of backendRes.headers.getSetCookie()) {
            resHeaders.append("Set-Cookie", rewriteCookieDomain(c));
          }
        } else {
          const sc = backendRes.headers.get("Set-Cookie");
          if (sc) resHeaders.set("Set-Cookie", rewriteCookieDomain(sc));
        }

        return new Response(backendRes.body, {
          status: backendRes.status,
          statusText: backendRes.statusText,
          headers: resHeaders,
        });
      } catch (err) {
        console.error("Proxy fetch error:", err);
        return new Response(JSON.stringify({ error: "Backend API temporarily unavailable", details: String(err) }), {
          status: 502,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    const isRscRequest =
      request.headers.get("rsc") === "1" ||
      request.headers.get("accept")?.includes("text/x-component") ||
      url.searchParams.has("_rsc") ||
      url.pathname.endsWith(".rsc") ||
      url.pathname.includes(".segment.rsc");

    const cleanPath = url.pathname.replace(/\/$/, "");

    // 2. Handle React Server Component (RSC) requests for smooth client-side transitions
    if (isRscRequest) {
      let rscRes = await env.ASSETS.fetch(request);
      if (rscRes.status !== 404) {
        const h = new Headers(rscRes.headers);
        h.set("Content-Type", "text/x-component");
        return new Response(rscRes.body, { status: rscRes.status, headers: h });
      }

      if (!url.pathname.includes(".")) {
        // Try cleanPath.rsc
        const rscPathReq = new Request(new URL((cleanPath === "" ? "" : cleanPath) + ".rsc", request.url), request);
        rscRes = await env.ASSETS.fetch(rscPathReq);
        if (rscRes.status !== 404) {
          const h = new Headers(rscRes.headers);
          h.set("Content-Type", "text/x-component");
          return new Response(rscRes.body, { status: rscRes.status, headers: h });
        }

        // Try cleanPath/index.rsc
        const indexRscReq = new Request(new URL((cleanPath === "" ? "" : cleanPath) + "/index.rsc", request.url), request);
        rscRes = await env.ASSETS.fetch(indexRscReq);
        if (rscRes.status !== 404) {
          const h = new Headers(rscRes.headers);
          h.set("Content-Type", "text/x-component");
          return new Response(rscRes.body, { status: rscRes.status, headers: h });
        }
      }
    }

    // 3. Try direct asset from Cloudflare Pages edge CDN
    let response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      return response;
    }

    // 4. For clean route paths (e.g. /admin/orders, /customer/profile):
    if (!url.pathname.includes(".")) {
      // Try path/index.html
      const indexReq = new Request(new URL((cleanPath === "" ? "" : cleanPath) + "/index.html", request.url), request);
      response = await env.ASSETS.fetch(indexReq);
      if (response.status !== 404) return response;

      // Try path.html
      const htmlReq = new Request(new URL(cleanPath + ".html", request.url), request);
      response = await env.ASSETS.fetch(htmlReq);
      if (response.status !== 404) return response;

      // Try SPA root fallback only if completely unmatched
      const fallback = await env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
      if (fallback.status === 200) {
        return fallback;
      }
    }

    return response;
  }
};