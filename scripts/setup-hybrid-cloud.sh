#!/bin/bash
set -e

echo "=========================================="
echo "  CMI Batteries - Hybrid Cloud Setup"
echo "=========================================="
echo ""
echo "Architecture:"
echo "  Frontend:  Cloudflare Pages"
echo "  Backend:   Cloudflare Workers"
echo "  Database:  AWS Aurora PostgreSQL"
echo "  Media:     Cloudflare R2"
echo "  Videos:    YouTube (embedded)"
echo ""

# Step 1: R2 Setup Instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Enable Cloudflare R2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to: https://dash.cloudflare.com/r2"
echo "2. Click 'Enable R2' (one-time setup, free)"
echo "3. Create a bucket named: cmi-media"
echo "4. Go to R2 > Manage R2 API Tokens"
echo "5. Create API Token with permissions:"
echo "   - Object Read & Write"
echo "   - Bucket: cmi-media"
echo "6. Copy the Access Key ID and Secret Access Key"
echo ""
read -p "Press Enter when R2 is enabled and bucket is created..."
echo ""

# Step 2: Get R2 credentials
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Configure R2 Credentials"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "R2 Access Key ID: " R2_ACCESS_KEY
read -s -p "R2 Secret Access Key: " R2_SECRET
echo ""
R2_BUCKET="cmi-media"
R2_ACCOUNT_ID=$(curl -s -H "Authorization: Bearer $(cat ~/.config/.wrangler/config/default.toml | grep oauth_token | cut -d'=' -f2 | tr -d ' ')" "https://api.cloudflare.com/client/v4/accounts" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
R2_PUBLIC_URL="https://pub-${R2_BUCKET}.${R2_ACCOUNT_ID}.r2.dev"
echo ""
echo "  Account ID: $R2_ACCOUNT_ID"
echo "  Endpoint: $R2_ENDPOINT"
echo "  Public URL: $R2_PUBLIC_URL"
echo ""

# Step 3: Set R2 secrets on Cloudflare Worker
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Configure Cloudflare Worker Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Add R2 secrets to the worker
echo "$R2_ENDPOINT" | npx wrangler secret put R2_ENDPOINT --config wrangler.backend.toml 2>&1 | tail -2
echo "$R2_ACCESS_KEY" | npx wrangler secret put R2_ACCESS_KEY_ID --config wrangler.backend.toml 2>&1 | tail -2
echo "$R2_SECRET" | npx wrangler secret put R2_SECRET_ACCESS_KEY --config wrangler.backend.toml 2>&1 | tail -2
echo "$R2_BUCKET" | npx wrangler secret put R2_BUCKET --config wrangler.backend.toml 2>&1 | tail -2
echo "$R2_PUBLIC_URL" | npx wrangler secret put R2_PUBLIC_URL --config wrangler.backend.toml 2>&1 | tail -2

echo ""
echo "✅ R2 secrets configured on Cloudflare Worker"
echo ""

# Step 4: Set Aurora connection on Cloudflare Worker
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Configure Aurora Database Connection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Note: Aurora is not publicly accessible yet."
echo "For now, the worker continues using Supabase."
echo "To migrate to Aurora later:"
echo "  1. Enable Public Access on Aurora instance"
echo "  2. Or enable Data API on Aurora cluster"
echo "  3. Then run: echo 'postgresql://...' | npx wrangler secret put DATABASE_URL"
echo ""

# Step 5: Deploy backend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Redeploy Cloudflare Worker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
npx wrangler deploy --config wrangler.backend.toml 2>&1 | tail -5
echo ""

# Step 6: Rebuild and deploy frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: Rebuild and Deploy Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
pnpm run pages:build 2>&1 | tail -5
pnpm run pages:deploy 2>&1 | tail -5

echo ""
echo "=========================================="
echo "  ✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Live URLs:"
echo "  Frontend: https://cmi-batteries.pages.dev"
echo "  Domain:   https://cmibattery.com"
echo "  Backend:  https://cmi-batteries-api.cmibatteryaws.workers.dev"
echo ""
echo "Media Storage:"
echo "  R2 Bucket: $R2_BUCKET"
echo "  Upload:    POST /api/upload (admin only)"
echo "  Serve:     /api/media/r2/{key}"
echo ""
echo "Cost Estimate (monthly):"
echo "  Cloudflare Pages:  Free (unlimited bandwidth)"
echo "  Cloudflare Worker: ~\$5/mo (10M requests)"
echo "  Cloudflare R2:     ~\$0.015/GB stored + free egress"
echo "  AWS Aurora:        ~\$0 (scales to 0 ACUs when idle)"
echo "  YouTube:           Free"
echo "  Total:             ~\$5-10/month"
echo ""
