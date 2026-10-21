param (
    [string]$Bucket = $env:S3_STATIC_BUCKET,
    [string]$Region = $env:AWS_REGION
)

if (-not $Region) { $Region = "ap-south-1" }

if (-not $Bucket) {
    Write-Error "Bucket name is required. Usage: .\scripts\sync-static-to-s3.ps1 -Bucket <bucket-name>"
    exit 1
}

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "🚀 Syncing Next.js Static Pages & Assets to s3://$Bucket" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

# 1. Build if not already built
if (-not (Test-Path ".next/static")) {
    Write-Host "⚙️ Building Next.js application..." -ForegroundColor Yellow
    npm run build
}

# 2. Configure CORS
Write-Host "⚙️ Configuring S3 CORS policy for static assets..." -ForegroundColor Yellow
$Cors = @"
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}
"@
Set-Content -Path /tmp/cors.json -Value $Cors
aws s3api put-bucket-cors --bucket $Bucket --cors-configuration file:///tmp/cors.json --region $Region
Remove-Item /tmp/cors.json -ErrorAction SilentlyContinue

# 3. Sync .next/static
Write-Host "📦 Uploading immutable Next.js chunks (.next/static)..." -ForegroundColor Yellow
aws s3 sync .next/static "s3://$Bucket/_next/static" --region $Region --cache-control "public, max-age=31536000, immutable" --delete

# 4. Sync public
if (Test-Path "public") {
    Write-Host "📦 Uploading public assets (public/)..." -ForegroundColor Yellow
    aws s3 sync public "s3://$Bucket" --region $Region --cache-control "public, max-age=86400"
}

$S3Url = "https://$Bucket.s3.$Region.amazonaws.com"
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "🎉 Static assets successfully synced to S3!" -ForegroundColor Green
Write-Host "S3 Asset URL: $S3Url" -ForegroundColor Yellow
Write-Host ""
Write-Host "To serve all static assets directly from S3, add this to your .env:" -ForegroundColor Cyan
Write-Host "NEXT_PUBLIC_S3_STATIC_URL=`"$S3Url`"" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Green
