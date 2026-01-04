#!/bin/bash

# Docker Hub push script for epoch-server
# Usage: ./docker-push.sh

set -e  # Exit on error

IMAGE_NAME="actuallyakshat/epoch-server"

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Docker Hub Push Script for ${IMAGE_NAME}${NC}"
echo ""

# Ask for version tag
read -p "Enter version tag (e.g., 0.1.0): " VERSION

if [ -z "$VERSION" ]; then
    echo -e "${RED}Error: Version tag cannot be empty${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Building Docker image for linux/amd64 platform...${NC}"
docker build --platform linux/amd64 -t ${IMAGE_NAME}:${VERSION} -t ${IMAGE_NAME}:latest .

echo ""
echo -e "${GREEN}Pushing version ${VERSION}...${NC}"
docker push ${IMAGE_NAME}:${VERSION}

echo ""
echo -e "${GREEN}Pushing latest tag...${NC}"
docker push ${IMAGE_NAME}:latest

echo ""
echo -e "${GREEN}✓ Successfully pushed:${NC}"
echo -e "  - ${IMAGE_NAME}:${VERSION}"
echo -e "  - ${IMAGE_NAME}:latest"
echo ""
