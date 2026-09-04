import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const NEXT_DIR = path.join(ROOT, ".next");
const PUBLIC_DIR = path.join(ROOT, "public");

console.log("🚀 Preparing clean Cloudflare Pages deployment directory in /dist...");

// Clean existing dist
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(DIST, { recursive: true });

// 1. Copy Public Assets
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(PUBLIC_DIR, DIST);
console.log("✅ Copied public assets & routing headers");

// 2. Copy Next.js Static JS/CSS Chunks
const nextStaticSrc = path.join(NEXT_DIR, "static");
const nextStaticDest = path.join(DIST, "_next", "static");
copyDir(nextStaticSrc, nextStaticDest);
console.log("✅ Copied _next/static JS/CSS bundles");

// 3. Copy Pre-rendered Static HTML & RSC Files & Generate Clean Directory Indexes
const appServerDir = path.join(NEXT_DIR, "server", "app");
if (fs.existsSync(appServerDir)) {
  function copyAppFiles(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyAppFiles(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);

        if (entry.name.endsWith(".html")) {
          if (entry.name === "page.html") {
            fs.copyFileSync(srcPath, path.join(dest, "index.html"));
          } else if (entry.name !== "index.html") {
            const baseName = entry.name.replace(/\.html$/, "");
            const subDir = path.join(dest, baseName);
            fs.mkdirSync(subDir, { recursive: true });
            fs.copyFileSync(srcPath, path.join(subDir, "index.html"));
          }
        } else if (entry.name.endsWith(".rsc")) {
          if (entry.name === "page.rsc") {
            fs.copyFileSync(srcPath, path.join(dest, "index.rsc"));
          } else if (entry.name !== "index.rsc") {
            const baseName = entry.name.replace(/\.rsc$/, "");
            const subDir = path.join(dest, baseName);
            fs.mkdirSync(subDir, { recursive: true });
            fs.copyFileSync(srcPath, path.join(subDir, "index.rsc"));
          }
        }
      }
    }
  }
  copyAppFiles(appServerDir, DIST);
  console.log("✅ Copied pre-rendered static HTML & RSC payloads with clean route mirrors");
}

// 4. Ensure root index.html is properly placed
const indexHtml = path.join(DIST, "index.html");
const pageHtml = path.join(appServerDir, "page.html");
const rootIndexHtml = path.join(appServerDir, "index.html");

if (!fs.existsSync(indexHtml)) {
  if (fs.existsSync(rootIndexHtml)) {
    fs.copyFileSync(rootIndexHtml, indexHtml);
    console.log("✅ Created dist/index.html from root index.html");
  } else if (fs.existsSync(pageHtml)) {
    fs.copyFileSync(pageHtml, indexHtml);
    console.log("✅ Created dist/index.html from page.html");
  }
}

// 5. Add Cloudflare Worker handler (_worker.js) for edge API forwarding, RSC & SPA routing
const workerScript = `
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
            .replace(/;\\s*$/, "");
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

    const cleanPath = url.pathname.replace(/\\/$/, "");

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
`;

fs.writeFileSync(path.join(DIST, "_worker.js"), workerScript.trim());
console.log("✅ Created Cloudflare Pages Edge Worker (_worker.js) with clean route matching");

// 6. Enforce Cloudflare Pages 25MB file size limit validation across all assets
const MAX_CLOUDFLARE_PAGE_ASSET_BYTES = 25 * 1024 * 1024; // 25 MB
function validateAssetSizes(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      validateAssetSizes(fullPath);
    } else {
      const stats = fs.statSync(fullPath);
      if (stats.size > MAX_CLOUDFLARE_PAGE_ASSET_BYTES) {
        throw new Error(
          `❌ File "${fullPath}" (${(stats.size / 1024 / 1024).toFixed(2)} MB) exceeds Cloudflare Pages 25 MB limit! Large media should be stored in the chunked database media stream (/api/media/:id).`
        );
      }
    }
  }
}

validateAssetSizes(DIST);
console.log("✅ Verified: All static assets and media files in /dist are strictly under 25MB!");

const totalFiles = fs.readdirSync(DIST, { recursive: true }).length;
console.log(`🎉 Cloudflare Pages distribution bundle ready! (${totalFiles} files in /dist)`);
