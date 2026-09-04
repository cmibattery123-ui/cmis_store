#!/bin/bash
set -e

REGION="ap-south-1"
FUNCTION_NAME="cmi-batteries-api"
API_NAME="cmi-batteries-api"
RDS_ENDPOINT="database-1-instance-1.cteo02w0ywrp.ap-south-1.rds.amazonaws.com"

echo "🚀 Deploying CMI Batteries API to AWS Lambda..."

# Step 1: Build the deployment package
echo "📦 Step 1: Building deployment package..."
node scripts/build-lambda.mjs

# Step 2: Create IAM role for Lambda
echo "🔐 Step 2: Creating IAM role..."
ROLE_NAME="cmi-lambda-role"
ROLE_ARN=$(aws iam create-role \
  --role-name "$ROLE_NAME" \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }' \
  --query 'Role.Arn' \
  --output text 2>/dev/null || aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)

echo "  Role ARN: $ROLE_ARN"

# Attach policies
aws iam attach-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" 2>/dev/null || true

aws iam attach-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-arn "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess" 2>/dev/null || true

aws iam attach-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-arn "arn:aws:iam::aws:policy/AmazonS3FullAccess" 2>/dev/null || true

# Wait for role to propagate
echo "⏳ Waiting for IAM role to propagate..."
sleep 10

# Step 3: Get Aurora credentials
echo "🗄️ Step 3: Configuring database connection..."
AURORA_PORT=5432
AURORA_DB="postgres"
AURORA_USER="postgres"

# You'll need to set the password via AWS Secrets Manager or parameter store
# For now, we'll use the same password as Supabase
echo "  Aurora Endpoint: $RDS_ENDPOINT"
echo "  Database: $AURORA_DB"
echo "  User: $AURORA_USER"

# Step 4: Create Lambda function
echo "⚡ Step 4: Creating Lambda function..."
LAMBDA_ARN=$(aws lambda create-function \
  --function-name "$FUNCTION_NAME" \
  --runtime nodejs20.x \
  --handler index.handler \
  --role "$ROLE_ARN" \
  --zip-file "fileb://.lambda-deploy.zip" \
  --timeout 30 \
  --memory-size 1024 \
  --region "$REGION" \
  --environment "Variables={
    DATABASE_URL=postgresql://${AURORA_USER}:${AURORA_PASSWORD:-postgres}@${RDS_ENDPOINT}:${AURORA_PORT}/${AURORA_DB},
    DIRECT_URL=postgresql://${AURORA_USER}:${AURORA_PASSWORD:-postgres}@${RDS_ENDPOINT}:${AURORA_PORT}/${AURORA_DB},
    AUTH_SECRET=${AUTH_SECRET:-7vL9mK2xP5qB4wT8zN1sV6jD3fG9hX2kifsdjfkdsj},
    NEXTAUTH_SECRET=${AUTH_SECRET:-7vL9mK2xP5qB4wT8zN1sV6jD3fG9hX2kifsdjfkdsj},
    NEXTAUTH_URL=https://cmi-batteries.pages.dev,
    AUTH_URL=https://cmi-batteries.pages.dev,
    ADMIN_SECURITY_PIN=${ADMIN_SECURITY_PIN:-123456},
    PAYMENT_PROVIDER=RAZORPAY,
    RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID:-rzp_live_TG4GgJzoUI9TWj},
    NEXT_PUBLIC_RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID:-rzp_live_TG4GgJzoUI9TWj},
    RAZORPAY_SECRET=${RAZORPAY_SECRET:-px52KBqL6neNg00YA3CuZvdr},
    RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET:-px52KBqL6neNg00YA3CuZvdr},
    AUTH_GOOGLE_ID=${AUTH_GOOGLE_ID:-67175878203-vbq1kfmms7gablekvp3hccmf5gttr1pm.apps.googleusercontent.com},
    AUTH_GOOGLE_SECRET=${AUTH_GOOGLE_SECRET:-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},
    GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-67175878203-vbq1kfmms7gablekvp3hccmf5gttr1pm.apps.googleusercontent.com},
    GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-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},
    R2_ENDPOINT=${R2_ENDPOINT:-},
    R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID:-},
    R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY:-},
    R2_BUCKET=${R2_BUCKET:-cmi-media},
    R2_PUBLIC_URL=${R2_PUBLIC_URL:-}
  }" \
  --query 'FunctionArn' \
  --output text 2>/dev/null)

echo "  Lambda ARN: $LAMBDA_ARN"

# Step 5: Create API Gateway (HTTP API)
echo "🌐 Step 5: Creating API Gateway..."
API_ID=$(aws apigatewayv2 create-api \
  --name "$API_NAME" \
  --protocol-type HTTP \
  --query 'ApiId' \
  --output text 2>/dev/null)

API_ENDPOINT=$(aws apigatewayv2 get-api \
  --api-id "$API_ID" \
  --query 'ApiEndpoint' \
  --output text)

echo "  API ID: $API_ID"
echo "  API Endpoint: $API_ENDPOINT"

# Step 6: Create Lambda integration
echo "🔗 Step 6: Creating Lambda integration..."
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id "$API_ID" \
  --integration-type AWS_PROXY \
  --integration-uri "$LAMBDA_ARN" \
  --payload-format-version 2.0 \
  --query 'IntegrationId' \
  --output text)

# Step 7: Create catch-all route
echo "🛣️ Step 7: Creating catch-all route..."
aws apigatewayv2 create-route \
  --api-id "$API_ID" \
  --route-key "ANY /{proxy+}" \
  --target "integrations/$INTEGRATION_ID" 2>/dev/null

aws apigatewayv2 create-route \
  --api-id "$API_ID" \
  --route-key "ANY /" \
  --target "integrations/$INTEGRATION_ID" 2>/dev/null

# Step 8: Grant API Gateway permission to invoke Lambda
echo "🔑 Step 8: Granting API Gateway permissions..."
aws lambda add-permission \
  --function-name "$FUNCTION_NAME" \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:$(aws sts get-caller-identity --query Account --output text):${API_ID}/*" \
  --region "$REGION" 2>/dev/null || true

# Step 9: Create stages
echo "📌 Step 9: Creating API stages..."
aws apigatewayv2 create-stage \
  --api-id "$API_ID" \
  --stage-name "\$default" \
  --auto-deploy \
  --region "$REGION" 2>/dev/null || true

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Summary:"
echo "  Lambda Function: $FUNCTION_NAME"
echo "  API Gateway URL: $API_ENDPOINT"
echo "  Region: $REGION"
echo ""
echo "🔗 Next steps:"
echo "  1. Enable R2 in Cloudflare Dashboard"
echo "  2. Create R2 bucket: npx wrangler r2 bucket create cmi-media"
echo "  3. Create R2 API token with R2:Edit permissions"
echo "  4. Set R2 secrets on Lambda:"
echo "     aws lambda update-function-configuration --function-name $FUNCTION_NAME --region $REGION"
echo "  5. Update FRONTEND_SHARED_SECRET in Cloudflare Worker to match"
echo "  6. Update the frontend _worker.js to proxy to $API_ENDPOINT"
echo ""
echo "🧪 Test the API:"
echo "  curl -H 'Origin: https://cmi-batteries.pages.dev' $API_ENDPOINT/api/products"
