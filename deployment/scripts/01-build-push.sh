#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Building and pushing Docker images to ECR...${NC}"

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-ap-south-1}

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Create ECR repositories if they don't exist
aws ecr describe-repositories --repository-names shopsphere-backend --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name shopsphere-backend --region $AWS_REGION

aws ecr describe-repositories --repository-names shopsphere-frontend --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name shopsphere-frontend --region $AWS_REGION

# Build backend image
echo -e "${GREEN}Building backend image...${NC}"
docker build -t shopsphere-backend:latest -f deployment/docker/Dockerfile.backend .
docker tag shopsphere-backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopsphere-backend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopsphere-backend:latest

# Build frontend image
echo -e "${GREEN}Building frontend image...${NC}"
docker build -t shopsphere-frontend:latest -f deployment/docker/Dockerfile.frontend .
docker tag shopsphere-frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopsphere-frontend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopsphere-frontend:latest

echo -e "${GREEN}✅ Images built and pushed successfully!${NC}"
