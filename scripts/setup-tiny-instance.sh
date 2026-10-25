#!/usr/bin/env bash
# ==============================================================================
# Setup Script for AWS t4g.small / t3.small Instances (2GB RAM + 2 vCPU)
# Hosts both the Next.js Web Application and Local Embedded Database ($0 RDS Cost)
# ==============================================================================

set -euo pipefail

echo "===================================================================="
echo "🚀 Initializing AWS t4.small Single-Instance Environment (Web + DB)"
echo "===================================================================="

# 1. Check & Configure 2GB Swap Memory (Provides 4GB total virtual memory)
CURRENT_SWAP=$(free -m | awk '/^Swap:/ {print $2}')
if [ "$CURRENT_SWAP" -lt 1000 ]; then
  echo "⚙️ Configured swap is only ${CURRENT_SWAP}MB. Creating 2GB swapfile..."
  sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  if ! grep -q "/swapfile" /etc/fstab; then
    echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab
  fi
  echo "vm.swappiness=20" | sudo tee -a /etc/sysctl.conf
  sudo sysctl -p
  echo "✅ 2GB Swapfile successfully active!"
else
  echo "✅ Swap memory is already sufficient: ${CURRENT_SWAP}MB"
fi

# 2. Ensure Docker & Compose are installed
if ! command -v docker &> /dev/null; then
  echo "⚙️ Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER" || true
  sudo systemctl enable --now docker
  echo "✅ Docker installed."
else
  echo "✅ Docker already installed."
fi

# 3. Create persistent directories on disk
echo "⚙️ Creating persistent data directories..."
mkdir -p data data/backups
chmod -R 775 data

# 4. Create .env if not exists
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "⚠️ Copied .env.example to .env. Please update your secrets."
  else
    cat << 'ENVFILE' > .env
PORT=3000
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=1024"
NEXTAUTH_URL="http://localhost"
NEXTAUTH_SECRET="change-this-to-a-secure-random-secret-key"
DATABASE_URL="file:./data/cmis.db"
ENVFILE
    echo "✅ Generated starter .env file configured for t4.small local SQLite database."
  fi
fi

# 5. Start Container Stack
echo "⚙️ Starting Docker containers with t4.small tuned limits..."
docker compose up -d --build

echo "===================================================================="
echo "🎉 SUCCESS: Application and Local Database are Running on t4.small!"
echo "• Web App:      http://<instance-ip> (port 80 / 3000)"
echo "• Database:     Maintained locally in ./data/cmis.db (zero RDS fees)"
echo "• Memory Limit: 1500MB (Web) - Perfectly tuned for 2GB RAM + 2GB swap"
echo "===================================================================="
