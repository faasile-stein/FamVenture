#!/bin/bash

# FamVenture - EAS Build Setup Script
# This script helps you set up Expo Application Services (EAS) for building and publishing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
echo "║       FamVenture EAS Build Setup          ║"
echo "║                                           ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Check if logged in to Expo
log_info "Checking Expo account..."
if ! npx expo whoami &> /dev/null; then
    log_warning "Not logged in to Expo"
    log_info "Please log in to your Expo account:"
    npx expo login
    log_success "Logged in successfully"
else
    EXPO_USER=$(npx expo whoami)
    log_success "Already logged in as: $EXPO_USER"
fi

# Check if EAS CLI is installed
log_info "Checking EAS CLI..."
if ! command -v eas &> /dev/null; then
    log_info "Installing EAS CLI..."
    npm install -g eas-cli
    log_success "EAS CLI installed"
else
    log_success "EAS CLI already installed ($(eas --version))"
fi

# Login to EAS
log_info "Logging in to EAS..."
eas whoami &> /dev/null || eas login
log_success "Logged in to EAS"

# Configure EAS project
log_info "Configuring EAS project..."

if [ -f "eas.json" ]; then
    log_success "eas.json already exists"
else
    log_info "Creating eas.json..."
    eas build:configure
fi

# Get project info
log_info "Fetching project information..."
PROJECT_ID=$(eas project:info 2>/dev/null | grep "ID:" | awk '{print $2}' || echo "")

if [ -z "$PROJECT_ID" ]; then
    log_warning "Project not linked to EAS"
    read -p "Do you want to create a new EAS project? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        eas project:init
        PROJECT_ID=$(eas project:info | grep "ID:" | awk '{print $2}')
        log_success "EAS project created: $PROJECT_ID"
    else
        log_error "EAS project is required for builds"
        exit 1
    fi
else
    log_success "Project ID: $PROJECT_ID"
fi

# Update app.json with project ID
log_info "Updating app.json with project ID..."
if command -v jq &> /dev/null; then
    jq ".expo.extra.eas.projectId = \"$PROJECT_ID\"" app.json > app.json.tmp
    mv app.json.tmp app.json
    log_success "app.json updated with project ID"
else
    log_warning "jq not installed. Please manually add projectId to app.json:"
    echo "  \"extra\": { \"eas\": { \"projectId\": \"$PROJECT_ID\" } }"
fi

# Create Expo access token
log_info "Creating Expo access token for GitHub Actions..."
echo ""
log_warning "IMPORTANT: You'll need this token for GitHub Secrets"
echo ""
read -p "Press Enter to create a new token..."

TOKEN=$(eas auth:token:create)
echo ""
log_success "Token created! Copy this token (you won't see it again):"
echo ""
echo -e "${GREEN}$TOKEN${NC}"
echo ""
echo "Add this to GitHub Secrets as: ${YELLOW}EXPO_TOKEN${NC}"
echo ""
read -p "Press Enter after you've copied the token..."

# Display GitHub Secrets needed
echo ""
log_info "GitHub Secrets Configuration"
echo ""
echo "Go to: ${BLUE}https://github.com/YOUR_USERNAME/FamVenture/settings/secrets/actions${NC}"
echo ""
echo "Add the following secrets:"
echo ""
echo "1. ${YELLOW}EXPO_TOKEN${NC}"
echo "   Value: (the token shown above)"
echo ""
echo "2. For iOS builds (optional):"
echo "   ${YELLOW}EXPO_APPLE_ID${NC} - Your Apple ID email"
echo "   ${YELLOW}EXPO_APPLE_APP_SPECIFIC_PASSWORD${NC} - App-specific password"
echo "   ${YELLOW}EXPO_APPLE_TEAM_ID${NC} - Apple Team ID"
echo "   ${YELLOW}EXPO_ASC_APP_ID${NC} - App Store Connect App ID"
echo ""
echo "3. For Android builds (optional):"
echo "   ${YELLOW}EXPO_ANDROID_SERVICE_ACCOUNT_KEY${NC} - Google Play service account JSON"
echo ""

# Ask if user wants to run a test build
echo ""
read -p "Do you want to run a test build now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Choose platform:"
    echo "1) iOS (simulator)"
    echo "2) Android (APK)"
    echo "3) Both"
    read -p "Enter choice (1-3): " -n 1 -r PLATFORM_CHOICE
    echo ""

    case $PLATFORM_CHOICE in
        1)
            log_info "Building iOS for simulator..."
            eas build --profile development --platform ios
            ;;
        2)
            log_info "Building Android APK..."
            eas build --profile development --platform android
            ;;
        3)
            log_info "Building for both platforms..."
            eas build --profile development --platform all
            ;;
        *)
            log_warning "Invalid choice, skipping test build"
            ;;
    esac
fi

# Summary
echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}   EAS Setup Complete! 🎉${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Add GitHub Secrets (see above)"
echo "2. Push to main/develop to trigger automatic builds"
echo "3. Or manually trigger builds via GitHub Actions"
echo ""
echo "Useful commands:"
echo "  ${BLUE}eas build:list${NC}              - View all builds"
echo "  ${BLUE}eas build --profile preview${NC} - Create preview build"
echo "  ${BLUE}eas submit${NC}                  - Submit to stores"
echo "  ${BLUE}eas project:info${NC}            - View project info"
echo ""
log_success "Ready to build and publish!"
echo ""
