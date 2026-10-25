#!/usr/bin/env bash
# ==============================================================================
# CMIS Store - Sync Production Config & Secrets to Standalone EC2
# Pushes .env (with Static IP) and docker-compose.yml (port 80) via AWS SSM
# ==============================================================================

set -euo pipefail

REGION="ap-south-1"
INSTANCE_TAG="cmis-store-server"

BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
NC="\033[0m"

echo -e "${BOLD}${CYAN}🔍 Finding standalone EC2 instance...${NC}"
INSTANCE_ID=$(aws ec2 describe-instances \
  --region "$REGION" \
  --filters "Name=tag:Name,Values=${INSTANCE_TAG}" "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0].InstanceId" \
  --output text)

if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" = "None" ]; then
  echo "❌ Error: Could not find active instance tagged ${INSTANCE_TAG}"
  exit 1
fi

STATIC_IP=$(aws ec2 describe-instances \
  --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text)

echo -e "• Instance ID: ${CYAN}${INSTANCE_ID}${NC}"
echo -e "• Static IP:   ${CYAN}${STATIC_IP}${NC}"

# Prepare .env with production static IP
TMP_ENV=$(mktemp)
sed "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=\"http://${STATIC_IP}\"|" .env > "$TMP_ENV"

ENV_B64=$(base64 -w 0 "$TMP_ENV")
COMPOSE_B64=$(base64 -w 0 docker-compose.yml)
rm -f "$TMP_ENV"

echo -e "${CYAN}🚀 Pushing configuration (.env + docker-compose.yml) to EC2 via SSM...${NC}"

COMMAND_ID=$(aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[
    \"echo '${ENV_B64}' | base64 -d > /opt/cmis_store/.env\",
    \"echo '${COMPOSE_B64}' | base64 -d > /opt/cmis_store/docker-compose.yml\",
    \"chown ubuntu:ubuntu /opt/cmis_store/.env /opt/cmis_store/docker-compose.yml\",
    \"cd /opt/cmis_store && docker compose up -d\"
  ]" \
  --region "$REGION" \
  --query "Command.CommandId" \
  --output text)

echo -e "SSM Command: ${COMMAND_ID}. Waiting for completion..."
aws ssm wait command-executed \
  --command-id "$COMMAND_ID" \
  --instance-id "$INSTANCE_ID" \
  --region "$REGION"

echo -e "${GREEN}✅ Configuration synced and application updated on EC2!${NC}"
echo -e "🌐 Site is live at: ${BOLD}${CYAN}http://${STATIC_IP}${NC}"
