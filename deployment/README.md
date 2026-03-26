# ShopSphere Deployment Files

## Files Created
- Dockerfiles for backend and frontend
- Kubernetes manifests (9 files)
- Helper scripts for deployment

## Quick Start
1. Local testing: ./deployment/scripts/local-test.sh
2. Update images: ./deployment/scripts/update-images.sh ACCOUNT_ID REGION
3. Deploy to EKS: ./deployment/scripts/deploy.sh
4. Cleanup: ./deployment/scripts/cleanup.sh

## Notes
- Update image URLs after pushing to ECR
- Change JWT_SECRET for production
- MongoDB data persists via PVC
