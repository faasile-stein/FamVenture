#!/bin/bash

# Quick start script - assumes environment is already set up

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting FamVenture...${NC}"

# Start Supabase if not running
if ! supabase status &> /dev/null; then
    echo -e "${BLUE}Starting Supabase...${NC}"
    supabase start
fi

echo -e "${GREEN}✓ Supabase running${NC}"

# Start Expo
echo -e "${BLUE}Starting Expo...${NC}"
npm start
