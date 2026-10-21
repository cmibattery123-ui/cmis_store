#!/usr/bin/env bash
# ==============================================================================
# Setup & Update Script for AWS Elastic Beanstalk (ap-south-1)
# ==============================================================================

set -euo pipefail

APP_NAME="cmibattery-production"
ENV_NAME="cmibattery-prod-env"
REGION="ap-south-1"
INSTANCE_TYPE="t3.small"

echo "===================================================================="
echo "🚀 Managing AWS Elastic Beanstalk ($ENV_NAME in $REGION)"
echo "===================================================================="

# Check if application exists
if ! aws elasticbeanstalk describe-applications --application-names "$APP_NAME" --region "$REGION" --query "Applications[0].ApplicationName" --output text 2>/dev/null | grep -q "$APP_NAME"; then
  echo "⚙️ Creating Elastic Beanstalk application $APP_NAME..."
  aws elasticbeanstalk create-application --application-name "$APP_NAME" --region "$REGION"
fi

# Check available Docker solution stack
DOCKER_STACK=$(aws elasticbeanstalk list-available-solution-stacks --region "$REGION" \
  --query "SolutionStacks[?contains(@, 'Docker')]" --output text | awk '{print $1}')

echo "✅ Selected solution stack: $DOCKER_STACK"

# Check environment status
ENV_STATUS=$(aws elasticbeanstalk describe-environments --application-name "$APP_NAME" --environment-names "$ENV_NAME" --region "$REGION" \
  --query "Environments[0].Status" --output text 2>/dev/null || echo "NotFound")

if [ "$ENV_STATUS" = "NotFound" ] || [ "$ENV_STATUS" = "Terminated" ] || [ -z "$ENV_STATUS" ]; then
  echo "⚙️ Provisioning new environment $ENV_NAME..."
  aws elasticbeanstalk create-environment \
    --application-name "$APP_NAME" \
    --environment-name "$ENV_NAME" \
    --cname-prefix "$ENV_NAME" \
    --solution-stack-name "$DOCKER_STACK" \
    --option-settings \
        Namespace=aws:autoscaling:launchconfiguration,OptionName=IamInstanceProfile,Value=cmi-eb-ec2-role \
        Namespace=aws:autoscaling:launchconfiguration,OptionName=InstanceType,Value="$INSTANCE_TYPE" \
        Namespace=aws:elasticbeanstalk:environment,OptionName=ServiceRole,Value=cmi-eb-service-role \
        Namespace=aws:elasticbeanstalk:environment,OptionName=EnvironmentType,Value=SingleInstance \
    --region "$REGION"
  echo "✅ Environment creation requested!"
else
  echo "✅ Environment $ENV_NAME exists (Status: $ENV_STATUS)"
fi
