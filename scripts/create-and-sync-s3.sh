#!/usr/bin/env bash
# ==============================================================================
# Create S3 Bucket and Sync Next.js Static Pages/Assets
# ==============================================================================

set -euo pipefail

REGION="${AWS_REGION:-ap-south-1}"
RANDOM_SUFFIX=$((1000 + RANDOM % 9000))
DEFAULT_BUCKET="cmibattery-static-${RANDOM_SUFFIX}"
BUCKET="${1:-$DEFAULT_BUCKET}"

echo "===================================================================="
echo "🚀 Setting up S3 Bucket: ${BUCKET} in ${REGION}"
echo "===================================================================="

# 1. Create S3 Bucket if it doesn't already exist
echo "⚙️ Creating S3 bucket ${BUCKET}..."
if [ "$REGION" = "us-east-1" ]; then
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" || true
else
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" || true
fi

# 2. Disable Public Access Block so static web assets can be downloaded by browsers
echo "⚙️ Configuring public read access for web assets..."
aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
  --region "$REGION"

# 3. Add Public Read Policy
POLICY='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForStaticAssets",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::'"$BUCKET"'/*"]
    }
  ]
}'
aws s3api put-bucket-policy --bucket "$BUCKET" --policy "$POLICY" --region "$REGION"

# 4. Configure CORS
CORS='{
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
aws s3api put-bucket-cors --bucket "$BUCKET" --cors-configuration "$CORS" --region "$REGION"
echo "✅ Bucket created and configured."

# 5. Sync static assets
./scripts/sync-static-to-s3.sh "$BUCKET"

# 6. Update .env with the exact URL
S3_URL="https://${BUCKET}.s3.${REGION}.amazonaws.com"
if [ -f ".env" ]; then
  if grep -q "NEXT_PUBLIC_S3_STATIC_URL=" .env; then
    sed -i "s|^NEXT_PUBLIC_S3_STATIC_URL=.*|NEXT_PUBLIC_S3_STATIC_URL=\"${S3_URL}\"|" .env
  else
    echo "NEXT_PUBLIC_S3_STATIC_URL=\"${S3_URL}\"" >> .env
  fi
  echo "✅ Updated .env with NEXT_PUBLIC_S3_STATIC_URL=\"${S3_URL}\""
fi

echo "===================================================================="
echo "🎉 S3 Static Hosting is LIVE!"
echo "URL: ${S3_URL}"
echo "===================================================================="
