#!/bin/bash
echo "Deploying to Kubernetes..."
kubectl apply -f deployment/kubernetes/
echo ""
echo "Checking status..."
kubectl get pods -n shopsphere
kubectl get svc -n shopsphere
kubectl get ingress -n shopsphere
