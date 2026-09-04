#!/usr/bin/env node

import { execSync } from "child_process";
import { mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from "fs";
import { join } from "path";

const BUILD_DIR = join(process.cwd(), ".lambda-build");
const OUTPUT_FILE = join(process.cwd(), ".lambda-deploy.zip");

console.log("🔧 Building Lambda deployment package...");

// Clean previous build
if (existsSync(BUILD_DIR)) {
  rmSync(BUILD_DIR, { recursive: true });
}
mkdirSync(BUILD_DIR, { recursive: true });

// Bundle with esbuild
console.log("📦 Bundling with esbuild...");
execSync(
  `npx esbuild src/lambda/index.ts --bundle --platform=node --target=node20 --format=cjs --outfile=${join(BUILD_DIR, "index.js")} --external:sharp --external:@prisma/client --external:prisma --minify --sourcemap`,
  { stdio: "inherit" }
);

// Copy Prisma schema and generate client
console.log("🗄️ Copying Prisma files...");
cpSync("prisma/schema.prisma", join(BUILD_DIR, "schema.prisma"));
mkdirSync(join(BUILD_DIR, "node_modules/.prisma"), { recursive: true });

// Generate Prisma client for Lambda
console.log("⚡ Generating Prisma client for Lambda...");
execSync("npx prisma generate --schema=prisma/schema.prisma", {
  stdio: "inherit",
  env: { ...process.env, PRISMA_CLIENT_OUTPUT: join(BUILD_DIR, "node_modules/.prisma/client") },
});

// Copy generated Prisma client
const prismaClientSrc = join("node_modules/.prisma/client");
if (existsSync(prismaClientSrc)) {
  cpSync(prismaClientSrc, join(BUILD_DIR, "node_modules/.prisma/client"), { recursive: true });
}

// Copy @prisma/client
const prismaClientPkg = join("node_modules/@prisma/client");
if (existsSync(prismaClientPkg)) {
  cpSync(prismaClientPkg, join(BUILD_DIR, "node_modules/@prisma/client"), { recursive: true });
}

// Copy pg native bindings if needed
const pgPkg = join("node_modules/pg");
if (existsSync(pgPkg)) {
  cpSync(pgPkg, join(BUILD_DIR, "node_modules/pg"), { recursive: true });
}

const pgNativePkg = join("node_modules/pg-native");
if (existsSync(pgNativePkg)) {
  cpSync(pgNativePkg, join(BUILD_DIR, "node_modules/pg-native"), { recursive: true });
}

// Copy @prisma/adapter-pg
const prismaAdapterPkg = join("node_modules/@prisma/adapter-pg");
if (existsSync(prismaAdapterPkg)) {
  cpSync(prismaAdapterPkg, join(BUILD_DIR, "node_modules/@prisma/adapter-pg"), { recursive: true });
}

// Create ZIP
console.log("📦 Creating deployment ZIP...");
if (existsSync(OUTPUT_FILE)) {
  rmSync(OUTPUT_FILE);
}
execSync(`cd ${BUILD_DIR} && zip -r ${OUTPUT_FILE} .`, { stdio: "inherit" });

// Get ZIP size
const { statSync } = await import("fs");
const size = statSync(OUTPUT_FILE).size;
console.log(`✅ Deployment package ready: ${(size / 1024 / 1024).toFixed(2)} MB`);

// Clean up
rmSync(BUILD_DIR, { recursive: true });
console.log("🧹 Cleaned up build directory");
