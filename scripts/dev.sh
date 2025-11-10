#!/bin/bash

# FamVenture Local Development Setup Script
# This script sets up and runs the complete development environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

log_success() {
    echo -e "${GREEN}✓ ${NC}$1"
}

log_warning() {
    echo -e "${YELLOW}⚠ ${NC}$1"
}

log_error() {
    echo -e "${RED}✗ ${NC}$1"
}

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║                                           ║"
echo "║         FamVenture Dev Environment        ║"
echo "║                                           ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
log_info "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
log_success "Node.js $NODE_VERSION is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed. Please install npm."
    exit 1
fi
log_success "npm $(npm -v) is installed"

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
    log_warning "Supabase CLI is not installed."
    read -p "Would you like to install it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Installing Supabase CLI..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install supabase/tap/supabase
        else
            npm install -g supabase
        fi
        log_success "Supabase CLI installed"
    else
        log_error "Supabase CLI is required. Please install it manually: https://supabase.com/docs/guides/cli"
        exit 1
    fi
else
    log_success "Supabase CLI $(supabase --version) is installed"
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    log_warning "Docker is not installed. Docker is required to run Supabase locally."
    log_info "Please install Docker from https://www.docker.com/products/docker-desktop"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    log_success "Docker is installed"
fi

# Navigate to project directory
cd "$(dirname "$0")/.."
PROJECT_DIR=$(pwd)
log_info "Project directory: $PROJECT_DIR"

# Install dependencies
if [ ! -d "node_modules" ]; then
    log_info "Installing dependencies..."
    npm install
    log_success "Dependencies installed"
else
    log_info "Dependencies already installed (run 'npm install' to update)"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    log_warning ".env file not found"
    if [ -f ".env.example" ]; then
        log_info "Creating .env from .env.example..."
        cp .env.example .env
        log_success ".env file created"
        log_warning "Please update .env with your Supabase credentials"
    else
        log_error ".env.example not found. Please create .env manually."
    fi
fi

# Start Supabase
log_info "Starting Supabase..."
if supabase status &> /dev/null; then
    log_success "Supabase is already running"
    supabase status
else
    log_info "Starting Supabase services (this may take a minute)..."
    supabase start
    log_success "Supabase started successfully"

    # Display connection info
    echo ""
    log_info "Supabase Connection Details:"
    supabase status
    echo ""
fi

# Apply migrations
log_info "Checking database migrations..."
read -p "Apply/reset database migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Applying migrations..."
    supabase db reset
    log_success "Migrations applied"

    # Ask about seed data
    read -p "Load seed data for testing? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f "supabase/seed.sql" ]; then
            log_info "Loading seed data..."
            supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres
            log_success "Seed data loaded"
            log_warning "Remember to create auth users in Supabase Studio first!"
        else
            log_warning "seed.sql not found"
        fi
    fi
fi

# Update .env with Supabase credentials
log_info "Updating .env with local Supabase credentials..."
ANON_KEY=$(supabase status -o env | grep SUPABASE_ANON_KEY | cut -d '=' -f 2)
SERVICE_KEY=$(supabase status -o env | grep SUPABASE_SERVICE_ROLE_KEY | cut -d '=' -f 2)

if [ -n "$ANON_KEY" ]; then
    # Update .env file
    if grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY" .env; then
        sed -i.bak "s|EXPO_PUBLIC_SUPABASE_ANON_KEY=.*|EXPO_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY|" .env
        sed -i.bak "s|EXPO_PUBLIC_SUPABASE_URL=.*|EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321|" .env
    else
        echo "EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321" >> .env
        echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY" >> .env
    fi
    log_success ".env updated with Supabase credentials"
fi

# Open Supabase Studio
log_info "Opening Supabase Studio in browser..."
sleep 2
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:54323" &> /dev/null &
elif command -v open &> /dev/null; then
    open "http://localhost:54323" &> /dev/null &
fi

# Display final instructions
echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Development Environment Ready! 🚀${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Supabase Studio:${NC}  http://localhost:54323"
echo -e "${BLUE}API Endpoint:${NC}     http://localhost:54321"
echo -e "${BLUE}Database:${NC}         postgresql://postgres:postgres@localhost:54322/postgres"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Create test users in Supabase Studio (Authentication → Users)"
echo "  2. Run seed data if you haven't already"
echo "  3. Start the Expo app (script will start it now)"
echo ""

# Ask if user wants to start Expo
read -p "Start Expo development server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Starting Expo..."
    echo ""
    echo -e "${YELLOW}Press 'i' for iOS simulator, 'a' for Android emulator${NC}"
    echo -e "${YELLOW}Press 'w' for web browser${NC}"
    echo -e "${YELLOW}Scan QR code with Expo Go app on your phone${NC}"
    echo ""
    npm start
else
    echo ""
    log_info "To start Expo later, run: npm start"
    echo ""
fi

# Cleanup
log_info "Development environment is ready!"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  npm start              - Start Expo dev server"
echo "  npm run ios            - Run on iOS simulator"
echo "  npm run android        - Run on Android emulator"
echo "  supabase status        - Check Supabase status"
echo "  supabase stop          - Stop Supabase services"
echo "  supabase db reset      - Reset database with migrations"
echo ""
