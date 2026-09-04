$ErrorActionPreference = "Stop"

# Configuration
$BucketName = "cmibattery-media-$(Get-Random -Minimum 1000 -Maximum 9999)"
$Region = "us-east-1"

Write-Host "Creating S3 Bucket: $BucketName in $Region..." -ForegroundColor Cyan

# 1. Create the bucket
aws s3api create-bucket --bucket $BucketName --region $Region
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create bucket."
    exit 1
}
Write-Host "✅ Bucket Created!" -ForegroundColor Green

# 2. Disable Block Public Access (so images can be viewed publicly)
Write-Host "Configuring Public Access Block..." -ForegroundColor Cyan
aws s3api put-public-access-block --bucket $BucketName --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
Write-Host "✅ Public Access Block removed." -ForegroundColor Green

# 3. Add Bucket Policy to allow public read of images
Write-Host "Applying Public Read Policy..." -ForegroundColor Cyan
$Policy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::$BucketName/*"
            ]
        }
    ]
}
"@
Set-Content -Path policy.json -Value $Policy
aws s3api put-bucket-policy --bucket $BucketName --policy file://policy.json
Remove-Item policy.json
Write-Host "✅ Public Read Policy applied." -ForegroundColor Green

# 4. Add CORS Configuration (so Next.js can upload directly)
Write-Host "Configuring CORS for direct uploads..." -ForegroundColor Cyan
$Cors = @"
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"]
        }
    ]
}
"@
Set-Content -Path cors.json -Value $Cors
aws s3api put-bucket-cors --bucket $BucketName --cors-configuration file://cors.json
Remove-Item cors.json
Write-Host "✅ CORS configured." -ForegroundColor Green

Write-Host ""
Write-Host "=========================================" -ForegroundColor Magenta
Write-Host "🎉 S3 Bucket Setup Complete!" -ForegroundColor Green
Write-Host "Bucket Name: $BucketName" -ForegroundColor Yellow
Write-Host "Region:      $Region" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Magenta
Write-Host "Next Step: Log into your application at the Beanstalk URL,"
Write-Host "go to Admin -> Cloud Settings, and enter these values"
Write-Host "along with your AWS keys into the 'File Uploads (S3)' section."
