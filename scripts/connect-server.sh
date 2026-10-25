#!/usr/bin/env bash
set -euo pipefail

REGION="ap-south-1"
INSTANCE_TAG="cmis-store-server"
EB_ENV_NAME="cmibattery-prod-env"

echo "🔍 Checking for standalone EC2 instance tagged Name=${INSTANCE_TAG}..."
INSTANCE_ID=$(aws ec2 describe-instances \
  --region "$REGION" \
  --filters "Name=tag:Name,Values=${INSTANCE_TAG}" "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0].InstanceId" \
  --output text 2>/dev/null || true)

if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" = "None" ]; then
  echo "ℹ️ Standalone instance not found. Checking Elastic Beanstalk environment ${EB_ENV_NAME}..."
  INSTANCE_ID=$(aws elasticbeanstalk describe-environment-resources \
    --environment-name "$EB_ENV_NAME" \
    --region "$REGION" \
    --query "EnvironmentResources.Instances[0].Id" \
    --output text 2>/dev/null || true)
fi

if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" = "None" ]; then
  echo "❌ Error: Could not find an active EC2 instance in ${REGION}"
  exit 1
fi

echo "🚀 Connecting to instance ${INSTANCE_ID} in ${REGION} via AWS Systems Manager (SSM)..."
aws ssm start-session --target "$INSTANCE_ID" --region "$REGION"
