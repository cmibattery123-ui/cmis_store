#!/usr/bin/env bash
# ==============================================================================
# Sync Next.js Static Pages & Assets to AWS S3
# Offloads static traffic (CSS, JS chunks, images, fonts) from the t4.small instance
# ==============================================================================

set -euo pipefail

BUCKET="${1:-${S3_STATIC_BUCKET:-${AWS_S3_BUCKET:-}}}"
REGION="${AWS_REGION:-ap-south-1}"

if [ -z "$BUCKET" ]; then
  echo "❌ Error: S3 Bucket Name is required."
  echo "Usage: ./scripts/sync-static-to-s3.sh <bucket-name>"
  echo "Or set S3_STATIC_BUCKET in your environment."
  exit 1
fi

echo "===================================================================="
echo "🚀 Syncing Next.js Static Pages & Assets to s3://${BUCKET}"
echo "===================================================================="

# 1. Build Next.js application if .next doesn't exist
if [ ! -d ".next/static" ]; then
  echo "⚙️ Building Next.js application..."
  npm run build
fi

# 2. Configure CORS on S3 Bucket so browsers can fetch fonts and chunks cross-origin
echo "⚙️ Configuring S3 CORS policy for static assets..."
CORS_CONFIG='{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}'
aws s3api put-bucket-cors --bucket "$BUCKET" --cors-configuration "$CORS_CONFIG" --region "$REGION" || true

# 3. Upload Next.js hashed static assets (.next/static -> s3://bucket/_next/static)
# Immutable cache: 1 year (files are content-hashed)
echo "📦 Uploading immutable Next.js chunks (.next/static)..."
aws s3 sync .next/static "s3://${BUCKET}/_next/static" \
  --region "$REGION" \
  --cache-control "public, max-age=31536000, immutable" \
  --delete

# 4. Upload public assets (public/ -> s3://bucket/)
# Normal cache: 1 day
if [ -d "public" ]; then
  echo "📦 Uploading public assets (public/)..."
  aws s3 sync public "s3://${BUCKET}" \
    --region "$REGION" \
    --cache-control "public, max-age=86400"
fi

# 5. Upload pre-rendered static HTML pages (.next/server/app/*.html)
if [ -d ".next/server/app" ]; then
  echo "📦 Uploading pre-rendered static HTML pages..."
  aws s3 cp .next/server/app/ "s3://${BUCKET}/" \
    --exclude "*" \
    --include "*.html" \
    --recursive \
    --content-type "text/html" \
    --cache-control "public, max-age=3600" \
    --region "$REGION"
fi

# 5. Output environment variable for next.config.ts
S3_URL="https://${BUCKET}.s3.${REGION}.amazonaws.com"
echo "===================================================================="
echo "🎉 Static assets successfully synced to S3!"
echo "S3 Asset URL: ${S3_URL}"
echo ""
echo "To serve all static assets directly from S3, add this to your .env:"
echo "NEXT_PUBLIC_S3_STATIC_URL=\"${S3_URL}\""
echo "===================================================================="
