#!/bin/bash
set -e

BUILD_DIR=".lambda-build"
OUTPUT=".lambda-deploy.zip"

echo "🔧 Building Lambda deployment package..."

# Clean previous build
rm -rf "$BUILD_DIR"
rm -f "$OUTPUT"
mkdir -p "$BUILD_DIR"

# Bundle with esbuild
echo "📦 Bundling with esbuild..."
npx esbuild src/lambda/index.ts \
  --bundle \
  --platform=node \
  --target=node20 \
  --format=cjs \
  --outfile="$BUILD_DIR/index.js" \
  --external:sharp \
  --minify \
  --sourcemap

# Copy Prisma schema
echo "🗄️ Copying Prisma files..."
cp prisma/schema.prisma "$BUILD_DIR/"

# Generate Prisma client
echo "⚡ Generating Prisma client..."
PRISMA_CLIENT_OUTPUT="$BUILD_DIR/node_modules/.prisma/client" \
npx prisma generate --schema=prisma/schema.prisma

# Copy Prisma client
mkdir -p "$BUILD_DIR/node_modules/.prisma"
cp -r node_modules/.prisma/client "$BUILD_DIR/node_modules/.prisma/" 2>/dev/null || true
mkdir -p "$BUILD_DIR/node_modules/@prisma"
cp -r node_modules/@prisma/client "$BUILD_DIR/node_modules/@prisma/" 2>/dev/null || true
cp -r node_modules/@prisma/adapter-pg "$BUILD_DIR/node_modules/@prisma/" 2>/dev/null || true

# Copy pg module
mkdir -p "$BUILD_DIR/node_modules"
cp -r node_modules/pg "$BUILD_DIR/node_modules/" 2>/dev/null || true

# Create ZIP
echo "📦 Creating deployment ZIP..."
cd "$BUILD_DIR"
7z a "../$OUTPUT" . -tzip
cd ..

SIZE=$(stat -f%z "$OUTPUT" 2>/dev/null || stat --printf="%s" "$OUTPUT")
echo "✅ Deployment package ready: $((SIZE / 1024 / 1024)) MB ($((SIZE / 1024)) KB)"

# Clean up
rm -rf "$BUILD_DIR"
echo "🧹 Cleaned up build directory"
