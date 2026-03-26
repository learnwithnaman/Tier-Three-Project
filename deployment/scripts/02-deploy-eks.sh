#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Deploying to EKS cluster...${NC}"

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-ap-south-1}
CLUSTER_NAME=${CLUSTER_NAME:-shopsphere-cluster}

# Update kubeconfig
aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME

# Replace placeholders in manifests
sed -i "s/\${AWS_ACCOUNT_ID}/$AWS_ACCOUNT_ID/g" deployment/kubernetes/04-backend.yaml
sed -i "s/\${AWS_REGION}/$AWS_REGION/g" deployment/kubernetes/04-backend.yaml
sed -i "s/\${AWS_ACCOUNT_ID}/$AWS_ACCOUNT_ID/g" deployment/kubernetes/05-frontend.yaml
sed -i "s/\${AWS_REGION}/$AWS_REGION/g" deployment/kubernetes/05-frontend.yaml

# Apply all manifests
echo -e "${GREEN}Applying Kubernetes manifests...${NC}"
kubectl apply -f deployment/kubernetes/

# Wait for deployments
echo -e "${YELLOW}Waiting for deployments to be ready...${NC}"
kubectl wait --namespace shopsphere --for=condition=ready pod --selector=app=backend --timeout=300s
kubectl wait --namespace shopsphere --for=condition=ready pod --selector=app=frontend --timeout=300s

# Get service URLs
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}Get the Ingress URL:${NC}"
kubectl get ingress -n shopsphere

echo ""
echo -e "${YELLOW}Get services:${NC}"
kubectl get svc -n shopsphere

echo ""
echo -e "${YELLOW}Get pods:${NC}"
kubectl get pods -n shopsphere
