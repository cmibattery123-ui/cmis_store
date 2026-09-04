$ErrorActionPreference = "Stop"

$InstanceId = "database-1-instance-1"
$Region = "ap-south-1"

# Generate a random password (alphanumeric to avoid special char parsing issues in connection strings)
$Password = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | % {[char]$_})
Write-Host "Generated new secure DB password." -ForegroundColor Cyan

Write-Host "Modifying RDS instance to be temporarily public and setting new password..." -ForegroundColor Yellow
aws rds modify-db-instance --db-instance-identifier $InstanceId --publicly-accessible --master-user-password $Password --apply-immediately --region $Region | Out-Null

Write-Host "Waiting for RDS instance to apply changes (this may take up to 5 minutes)..." -ForegroundColor Cyan
do {
    Start-Sleep -Seconds 15
    $Status = (aws rds describe-db-instances --db-instance-identifier $InstanceId --region $Region | ConvertFrom-Json).DBInstances[0].DBInstanceStatus
    Write-Host "Current Status: $Status"
} while ($Status -ne "available")

# Get Endpoint
$Endpoint = (aws rds describe-db-instances --db-instance-identifier $InstanceId --region $Region | ConvertFrom-Json).DBInstances[0].Endpoint.Address
$DatabaseUrl = "postgresql://postgres:${Password}@${Endpoint}:5432/postgres?schema=public"

Write-Host "✅ RDS is available at $Endpoint" -ForegroundColor Green

# Write to .env
$EnvPath = Join-Path $PWD ".env"
if (Test-Path $EnvPath) {
    (Get-Content $EnvPath) -replace '^DATABASE_URL=.*', "DATABASE_URL=`"$DatabaseUrl`"" | Set-Content $EnvPath
    Write-Host "Updated .env with remote DATABASE_URL." -ForegroundColor Green
} else {
    Set-Content $EnvPath "DATABASE_URL=`"$DatabaseUrl`""
    Write-Host "Created .env with remote DATABASE_URL." -ForegroundColor Green
}

# Run Prisma Push and Seed
Write-Host "Pushing schema to remote database..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss
Write-Host "Seeding database with Admin account..." -ForegroundColor Yellow
npm run db:seed

Write-Host "✅ Database successfully seeded!" -ForegroundColor Green

# Secure the database again
Write-Host "Reverting RDS instance back to Private mode for security..." -ForegroundColor Yellow
aws rds modify-db-instance --db-instance-identifier $InstanceId --no-publicly-accessible --apply-immediately --region $Region | Out-Null

Write-Host ""
Write-Host "=========================================" -ForegroundColor Magenta
Write-Host "🎉 Database Setup Complete!" -ForegroundColor Green
Write-Host "Admin Account created successfully."
Write-Host "IMPORTANT: Your new DATABASE_URL is in your local .env file."
Write-Host "You must copy this DATABASE_URL into your Elastic Beanstalk configuration later!"
Write-Host "=========================================" -ForegroundColor Magenta
