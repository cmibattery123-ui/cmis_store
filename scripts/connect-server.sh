#!/usr/bin/env bash
set -euo pipefail

REGION="ap-south-1"
ENV_NAME="cmibattery-prod-env"

echo "🔍 Discovering active EC2 instance for $ENV_NAME..."
INSTANCE_ID=$(aws elasticbeanstalk describe-environment-resources \
  --environment-name "$ENV_NAME" \
  --region "$REGION" \
  --query "EnvironmentResources.Instances[0].Id" \
  --output text)

if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" = "None" ]; then
  echo "❌ Error: Could not find an active instance for $ENV_NAME"
  exit 1
fi

echo "🚀 Connecting to instance $INSTANCE_ID in $REGION via AWS Systems Manager..."
aws ssm start-session --target "$INSTANCE_ID" --region "$REGION"
