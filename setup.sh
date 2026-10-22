#!/usr/bin/env bash
# ==============================================================================
# Chinna Mayil Industries Store (CMIS Store) — Ubuntu Automated Setup Script
# Automatically installs dependencies, sets up uncommitted files (.env, data/cmis.db),
# pushes the Prisma database schema, and prepares the app to run.
# ==============================================================================

set -euo pipefail

# Visual formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
NC="\033[0m"

log_info() {
  echo -e "${CYAN}ℹ️  [INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}✅ [SUCCESS]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}⚠️  [WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}❌ [ERROR]${NC} $1"
}

echo -e "${BOLD}${CYAN}"
echo "===================================================================="
echo "   Chinna Mayil Industries Store (CMIS) — Ubuntu Environment Setup  "
echo "===================================================================="
echo -e "${NC}"

# ------------------------------------------------------------------------------
# 1. Verify OS (Ubuntu / Debian)
# ------------------------------------------------------------------------------
if [ -f /etc/os-release ]; then
  . /etc/os-release
  log_info "Detected OS: ${NAME:-Linux} ${VERSION_ID:-}"
else
  log_warn "Could not verify /etc/os-release. Continuing assuming Ubuntu-compatible Linux."
fi

# Determine if sudo is needed
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo &>/dev/null; then
    SUDO="sudo"
  else
    log_warn "Running as non-root user and 'sudo' is not found. Some system packages may fail to install if missing."
  fi
fi

# ------------------------------------------------------------------------------
# 2. Check & Install Essential System Utilities
# ------------------------------------------------------------------------------
log_info "Checking essential build & network packages..."
PACKAGES_TO_INSTALL=()
for pkg in curl wget git build-essential openssl unzip; do
  if ! dpkg -s "$pkg" &>/dev/null 2>&1; then
    PACKAGES_TO_INSTALL+=("$pkg")
  fi
done

if [ ${#PACKAGES_TO_INSTALL[@]} -gt 0 ]; then
  log_info "Installing missing system utilities: ${PACKAGES_TO_INSTALL[*]}..."
  $SUDO apt-get update -y
  $SUDO apt-get install -y "${PACKAGES_TO_INSTALL[@]}"
  log_success "System utilities installed."
else
  log_success "All essential system utilities are present."
fi

# ------------------------------------------------------------------------------
# 3. Check & Install Node.js (v20+ LTS required)
# ------------------------------------------------------------------------------
log_info "Checking Node.js version..."
NODE_OK=false
if command -v node &>/dev/null; then
  NODE_VER=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 20 ]; then
    NODE_OK=true
    log_success "Node.js v${NODE_VER} detected (compatible)."
  else
    log_warn "Found Node.js v${NODE_VER}, but v20 LTS or higher is required."
  fi
fi

if [ "$NODE_OK" = false ]; then
  log_info "Installing Node.js 20.x LTS from NodeSource repository..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
  $SUDO apt-get install -y nodejs
  log_success "Node.js $(node -v) successfully installed."
fi

# ------------------------------------------------------------------------------
# 4. Check & Install pnpm Package Manager
# ------------------------------------------------------------------------------
log_info "Checking pnpm package manager..."
if ! command -v pnpm &>/dev/null; then
  log_info "Installing pnpm globally..."
  if command -v corepack &>/dev/null; then
    corepack enable || true
    corepack prepare pnpm@latest --activate || true
  fi
  if ! command -v pnpm &>/dev/null; then
    $SUDO npm install -g pnpm
  fi
  log_success "pnpm $(pnpm -v) installed."
else
  log_success "pnpm $(pnpm -v) detected."
fi

# ------------------------------------------------------------------------------
# 5. Setup Uncommitted Files (.env & data/ directory)
# ------------------------------------------------------------------------------
log_info "Setting up uncommitted runtime files and directories..."

# Create local SQLite data directory
mkdir -p data
chmod 775 data
log_success "Persistent 'data/' directory verified."

# Handle .env file
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    log_info "Creating '.env' from '.env.example'..."
    cp .env.example .env
  else
    log_info "Creating default '.env' file..."
    cat << 'EOF' > .env
DATABASE_URL="file:./data/cmis.db"
NEXTAUTH_URL="http://localhost:3000"
PAYMENT_PROVIDER="RAZORPAY"
NEXT_PUBLIC_WHATSAPP_PHONE="917339670396"
ADMIN_SECURITY_PIN="123456"
EOF
  fi

  # Generate random cryptographic keys for NEXTAUTH_SECRET and ENCRYPTION_KEY
  AUTH_SECRET=$(openssl rand -hex 32)
  ENC_KEY=$(openssl rand -hex 32)

  # Replace placeholders if present or append
  if grep -q "NEXTAUTH_SECRET=" .env; then
    sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"${AUTH_SECRET}\"|" .env
  else
    echo "NEXTAUTH_SECRET=\"${AUTH_SECRET}\"" >> .env
  fi

  if grep -q "ENCRYPTION_KEY=" .env; then
    sed -i "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=\"${ENC_KEY}\"|" .env
  else
    echo "ENCRYPTION_KEY=\"${ENC_KEY}\"" >> .env
  fi

  log_success "Generated secure .env with fresh NEXTAUTH_SECRET and ENCRYPTION_KEY."
else
  log_success "Existing '.env' file preserved."
fi

# ------------------------------------------------------------------------------
# 6. Install Node Modules (Dependencies)
# ------------------------------------------------------------------------------
log_info "Installing project dependencies with pnpm..."
pnpm install --frozen-lockfile || pnpm install
log_success "Dependencies installed."

# ------------------------------------------------------------------------------
# 7. Prisma Client & SQLite Database Initialization
# ------------------------------------------------------------------------------
log_info "Generating Prisma Client..."
pnpm prisma generate
log_success "Prisma Client generated."

log_info "Synchronizing database schema with 'data/cmis.db'..."
pnpm prisma db push --skip-generate
log_success "SQLite database schema synchronized."

# If database is freshly initialized and empty, offer seeding
if [ -f prisma/seed.ts ] && [ ! -s "data/cmis.db" ]; then
  log_info "Database appears newly initialized. Seeding initial categories & catalog..."
  pnpm run db:seed || log_warn "Seed script exited. Continuing setup."
fi

# ------------------------------------------------------------------------------
# 8. Setup Completion Summary
# ------------------------------------------------------------------------------
echo ""
echo -e "${BOLD}${GREEN}====================================================================${NC}"
echo -e "${BOLD}${GREEN}🎉 CMIS Store setup completed successfully!${NC}"
echo -e "${BOLD}${GREEN}====================================================================${NC}"
echo ""
echo -e "You can now run the application:"
echo -e "  ${BOLD}Development Mode:${NC}  pnpm dev"
echo -e "  ${BOLD}Production Build:${NC}  pnpm run build && pnpm start"
echo -e "  ${BOLD}Prisma Studio DB:${NC}  pnpm prisma studio"
echo ""
echo -e "Files created locally outside of Git:"
echo -e "  • ${CYAN}.env${NC}          (Environment configuration and secrets)"
echo -e "  • ${CYAN}data/cmis.db${NC}  (SQLite persistent database)"
echo -e "  • ${CYAN}node_modules/${NC} (Installed dependencies)"
echo ""
echo -e "To configure live payment gateway keys or WhatsApp phone number:"
echo -e "  Edit ${BOLD}.env${NC} or use the web dashboard at ${CYAN}http://localhost:3000/admin/settings${NC}"
echo ""
