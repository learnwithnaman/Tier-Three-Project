#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Cleaning up resources...${NC}"

# Delete Kubernetes resources
kubectl delete namespace shopsphere

# Delete ECR images (optional)
read -p "Delete ECR images? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    AWS_REGION=${AWS_REGION:-ap-south-1}
    
    aws ecr batch-delete-image \
        --repository-name shopsphere-backend \
        --image-ids imageTag=latest \
        --region $AWS_REGION || true
    
    aws ecr batch-delete-image \
        --repository-name shopsphere-frontend \
        --image-ids imageTag=latest \
        --region $AWS_REGION || true
fi

echo -e "${GREEN}✅ Cleanup complete!${NC}"
