#!/usr/bin/env bash
set -euo pipefail

ENV_NAME="cmibattery-prod-env"
REGION="ap-south-1"

# Load local .env if present
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo "⚙️ Setting production environment variables on Elastic Beanstalk..."

aws elasticbeanstalk update-environment \
  --environment-name "$ENV_NAME" \
  --option-settings \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=NODE_ENV,Value=production \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=PORT,Value=3000 \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=NODE_OPTIONS,Value="--max-old-space-size=1024" \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=DATABASE_URL,Value="${DATABASE_URL:-file:/app/data/cmis.db}" \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=NEXTAUTH_SECRET,Value="${NEXTAUTH_SECRET:-7vL9mK2xP5qB4wT8zN1sV6jD3fG9hX2kifsdjfkdsj}" \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=NEXTAUTH_URL,Value="${NEXTAUTH_URL:-http://cmibattery-prod-env.ap-south-1.elasticbeanstalk.com}" \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=NEXT_PUBLIC_S3_STATIC_URL,Value="${NEXT_PUBLIC_S3_STATIC_URL:-https://cmibattery-static-7099.s3.ap-south-1.amazonaws.com}" \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=PAYMENT_PROVIDER,Value="${PAYMENT_PROVIDER:-RAZORPAY}" \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=RAZORPAY_KEY_ID,Value="${RAZORPAY_KEY_ID:-}" \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=NEXT_PUBLIC_RAZORPAY_KEY_ID,Value="${NEXT_PUBLIC_RAZORPAY_KEY_ID:-}" \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=RAZORPAY_SECRET,Value="${RAZORPAY_SECRET:-}" \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=RAZORPAY_KEY_SECRET,Value="${RAZORPAY_KEY_SECRET:-}" \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=ADMIN_SECURITY_PIN,Value="${ADMIN_SECURITY_PIN:-123456}" \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=AUTH_GOOGLE_ID,Value="${AUTH_GOOGLE_ID:-}" \
      Namespace=aws:elasticbeanstalk:application:environment,OptionName=AUTH_GOOGLE_SECRET,Value="${AUTH_GOOGLE_SECRET:-}" \
  --region "$REGION"

echo "✅ Environment variables configured on Elastic Beanstalk!"
