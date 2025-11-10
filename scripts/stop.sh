#!/bin/bash

# Stop all development services

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Stopping FamVenture development services...${NC}"

# Stop Supabase
if supabase status &> /dev/null; then
    echo -e "${BLUE}Stopping Supabase...${NC}"
    supabase stop
    echo -e "${GREEN}✓ Supabase stopped${NC}"
else
    echo -e "${GREEN}✓ Supabase was not running${NC}"
fi

# Kill any running Expo processes
if pgrep -f "expo start" > /dev/null; then
    echo -e "${BLUE}Stopping Expo...${NC}"
    pkill -f "expo start"
    echo -e "${GREEN}✓ Expo stopped${NC}"
else
    echo -e "${GREEN}✓ Expo was not running${NC}"
fi

echo -e "${GREEN}All services stopped${NC}"
