$ErrorActionPreference = "Stop"

$AppName = "cmibattery-production"
$EnvName = "cmibattery-prod-env"
$RoleName = "aws-elasticbeanstalk-ec2-role"
$Region = "us-east-1"

Write-Host "1. Creating IAM Role for Elastic Beanstalk..." -ForegroundColor Cyan
try {
    $RoleExists = aws iam get-role --role-name $RoleName 2>$null
} catch {}

if (-not $RoleExists) {
    $TrustPolicy = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
    aws iam create-role --role-name $RoleName --assume-role-policy-document $TrustPolicy | Out-Null
    aws iam attach-role-policy --role-name $RoleName --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier
    aws iam attach-role-policy --role-name $RoleName --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier
    aws iam attach-role-policy --role-name $RoleName --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker
    
    aws iam create-instance-profile --instance-profile-name $RoleName | Out-Null
    aws iam add-role-to-instance-profile --instance-profile-name $RoleName --role-name $RoleName | Out-Null
    Write-Host "✅ IAM Role created." -ForegroundColor Green
    Start-Sleep -Seconds 10 # Wait for IAM propagation
} else {
    Write-Host "✅ IAM Role already exists." -ForegroundColor Green
}

Write-Host "2. Creating Elastic Beanstalk Application..." -ForegroundColor Cyan
try {
    aws elasticbeanstalk create-application --application-name $AppName --region $Region | Out-Null
    Write-Host "✅ Application created." -ForegroundColor Green
} catch {
    Write-Host "Application might already exist, continuing..." -ForegroundColor Yellow
}

Write-Host "3. Finding latest Docker Solution Stack..." -ForegroundColor Cyan
$Stacks = (aws elasticbeanstalk list-available-solution-stacks --region $Region | ConvertFrom-Json).SolutionStacks
$DockerStack = $Stacks | Where-Object { $_ -match "^64bit Amazon Linux 2023.*running Docker$" } | Select-Object -First 1

if (-not $DockerStack) {
    Write-Error "Could not find a valid Docker solution stack."
    exit 1
}
Write-Host "✅ Found Stack: $DockerStack" -ForegroundColor Green

Write-Host "4. Creating Elastic Beanstalk Environment..." -ForegroundColor Cyan
Write-Host "This will take several minutes. You can monitor the progress in the AWS Console." -ForegroundColor Yellow

# Note: We aren't providing a bundle, so it will deploy the sample application first.
# The GitHub Action will overwrite it with the real application.
$Settings = "Namespace=aws:autoscaling:launchconfiguration,OptionName=IamInstanceProfile,Value=$RoleName Namespace=aws:autoscaling:launchconfiguration,OptionName=InstanceType,Value=t3.small"

aws elasticbeanstalk create-environment `
    --application-name $AppName `
    --environment-name $EnvName `
    --solution-stack-name $DockerStack `
    --option-settings $Settings `
    --region $Region | Out-Null

Write-Host "✅ Environment provisioning started!" -ForegroundColor Green

Write-Host ""
Write-Host "=========================================" -ForegroundColor Magenta
Write-Host "🎉 Elastic Beanstalk Setup Initiated!" -ForegroundColor Green
Write-Host "Wait 5 minutes for the environment to finish starting up in AWS."
Write-Host "Then, go to GitHub -> Actions and click 'Re-run all jobs' on your deployment!"
Write-Host "=========================================" -ForegroundColor Magenta
