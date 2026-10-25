#!/usr/bin/env bash
# ==============================================================================
# CMIS Store - 1-Click Standalone EC2 Deployment Script
# Provisions a low-cost EC2 instance (t4g.small or t3.small) with a Static Elastic IP.
# No Elastic Beanstalk, No Auto-Scaling Groups, Zero ALB overhead fees.
# ==============================================================================

set -euo pipefail

REGION="ap-south-1"
STACK_NAME="cmis-ec2-stack"
INSTANCE_TYPE="${1:-t4g.small}"
EXISTING_EIP_ID="${2:-}"

BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
NC="\033[0m"

echo -e "${BOLD}${CYAN}"
echo "===================================================================="
echo "🚀 CMIS Store - Deploying Standalone EC2 with Static IP"
echo "===================================================================="
echo -e "${NC}"
echo "• Region:        ${REGION}"
echo "• Instance Type: ${INSTANCE_TYPE}"
echo "• Stack Name:    ${STACK_NAME}"
if [ -n "$EXISTING_EIP_ID" ]; then
  echo "• Existing EIP:  ${EXISTING_EIP_ID}"
else
  echo "• Elastic IP:    Allocating New Static Elastic IP"
fi
echo ""

# Deploy CloudFormation Stack
echo -e "${CYAN}⏳ Creating/Updating CloudFormation stack... (takes ~2-3 minutes)${NC}"

PARAMS="InstanceType=${INSTANCE_TYPE}"
if [ -n "$EXISTING_EIP_ID" ]; then
  PARAMS="${PARAMS} ExistingElasticIpAllocationId=${EXISTING_EIP_ID}"
fi

aws cloudformation deploy \
  --stack-name "$STACK_NAME" \
  --template-file infrastructure/ec2-standalone.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides $PARAMS \
  --region "$REGION"

echo -e "${GREEN}✅ CloudFormation stack deployment completed!${NC}"

# Retrieve outputs
INSTANCE_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='InstanceId'].OutputValue" \
  --output text)

STATIC_IP=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='StaticIpAddress'].OutputValue" \
  --output text)

WEB_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='WebUrl'].OutputValue" \
  --output text)

echo ""
echo -e "${BOLD}${GREEN}====================================================================${NC}"
echo -e "${BOLD}${GREEN}🎉 Standalone EC2 Instance is Ready!${NC}"
echo -e "${BOLD}${GREEN}====================================================================${NC}"
echo -e "• Instance ID:   ${CYAN}${INSTANCE_ID}${NC}"
echo -e "• Static IP:     ${CYAN}${STATIC_IP}${NC}"
echo -e "• Web URL:       ${CYAN}${WEB_URL}${NC} (or http://${STATIC_IP})"
echo -e "• SSM Terminal:  ${CYAN}aws ssm start-session --target ${INSTANCE_ID} --region ${REGION}${NC}"
echo -e "• Connect Cmd:   ${CYAN}pnpm run connect:server${NC}"
echo ""
echo -e "${YELLOW}ℹ️  The application container is initializing via cloud-init.${NC}"
echo -e "   Run 'pnpm run connect:server' to view logs: 'docker logs -f cmis-web'"
echo ""
