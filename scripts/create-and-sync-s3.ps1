param (
    [string]$Bucket,
    [string]$Region = $env:AWS_REGION
)

if (-not $Region) { $Region = "ap-south-1" }
if (-not $Bucket) {
    $RandomSuffix = Get-Random -Minimum 1000 -Maximum 9999
    $Bucket = "cmibattery-static-$RandomSuffix"
}

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "🚀 Creating and Configuring S3 Bucket: $Bucket in $Region" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

# 1. Create Bucket
if ($Region -eq "us-east-1") {
    aws s3api create-bucket --bucket $Bucket --region $Region
} else {
    aws s3api create-bucket --bucket $Bucket --region $Region --create-bucket-configuration LocationConstraint=$Region
}

# 2. Disable Block Public Access
aws s3api put-public-access-block --bucket $Bucket --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" --region $Region

# 3. Add Public Read Policy
$Policy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForStaticAssets",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::$Bucket/*"]
    }
  ]
}
"@
Set-Content -Path /tmp/policy.json -Value $Policy
aws s3api put-bucket-policy --bucket $Bucket --policy file:///tmp/policy.json --region $Region
Remove-Item /tmp/policy.json -ErrorAction SilentlyContinue

# 4. Sync Assets
& .\scripts\sync-static-to-s3.ps1 -Bucket $Bucket -Region $Region

# 5. Output
$S3Url = "https://$Bucket.s3.$Region.amazonaws.com"
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "🎉 Bucket Created & Synced!" -ForegroundColor Green
Write-Host "Bucket Name: $Bucket" -ForegroundColor Yellow
Write-Host "S3 URL:      $S3Url" -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Green
