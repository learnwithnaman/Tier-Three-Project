#!/bin/bash
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./update-images.sh AWS_ACCOUNT_ID AWS_REGION"
    echo "Example: ./update-images.sh 123456789012 us-east-2"
    exit 1
fi
ACCOUNT_ID=$1
REGION=$2
sed -i "s|YOUR_AWS_ACCOUNT_ID|$ACCOUNT_ID|g" deployment/kubernetes/06-backend.yaml
sed -i "s|YOUR_AWS_REGION|$REGION|g" deployment/kubernetes/06-backend.yaml
sed -i "s|YOUR_AWS_ACCOUNT_ID|$ACCOUNT_ID|g" deployment/kubernetes/07-frontend.yaml
sed -i "s|YOUR_AWS_REGION|$REGION|g" deployment/kubernetes/07-frontend.yaml
echo "✅ Image URLs updated"
echo "Run: kubectl apply -f deployment/kubernetes/"
