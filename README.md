# 🛍️ ShopSphere - MERN E-Commerce Application

Full Stack **3 Tier** E-Commerce application built with MERN stack (MongoDB, Express.js, React.js, Node.js). Supports multiple deployment options including local development, Docker Compose, and production-grade AWS EKS.

## 🖼️ Application Preview

![ShopSphere UI](diagrams/1.jpg)

## 🏗️ Architecture Diagram

![Architecture Diagram](diagrams/2.png)

## 📋 Table of Contents
- [Application Preview](#️-application-preview)
- [Architecture Diagram](#️-architecture-diagram)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Deployment Options](#-deployment-options)
  - [Option 1: Local Development](#option-1-local-development)
  - [Option 2: Docker Compose](#option-2-docker-compose)
  - [Option 3: AWS EKS (Production)](#option-3-aws-eks-production)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Monitoring & Logs](#-monitoring--logs)
- [Troubleshooting](#-troubleshooting)
- [Cleanup](#-cleanup)
- [Conclusion](#-conclusion)

## ✨ Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 🛒 **Shopping Cart** - Add/remove products, update quantities
- 📦 **Product Catalog** - Browse products with categories and search
- ⭐ **Product Reviews** - Rate and review products
- 📋 **Order Management** - Place orders and track status
- 🎨 **Responsive Design** - Works on desktop, tablet, and mobile
- 🚀 **Multiple Deployments** - Local, Docker, and Kubernetes
- 📊 **Auto-scaling** - Horizontal Pod Autoscaler on EKS

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js 18, React Router, Axios, React Hot Toast |
| **Backend** | Node.js, Express.js, JWT, Bcrypt |
| **Database** | MongoDB 6 |
| **Container** | Docker, Docker Compose |
| **Orchestration** | Kubernetes, AWS EKS |
| **Cloud** | AWS (ECR, EKS, ALB, EBS) |

## 📁 Project Structure

```
shopsphere/
├── backend/                 # Node.js + Express API
│   ├── models/              # MongoDB models (User, Product, Order)
│   ├── routes/              # API routes
│   ├── middleware/          # Auth middleware
│   ├── controllers/         # Business logic
│   ├── server.js            # Entry point
│   └── package.json
│
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Auth & Cart contexts
│   │   ├── utils/           # API utilities
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
│
├── deployment/
│   ├── docker/              # Docker configuration
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   ├── nginx.conf
│   │   └── docker-compose.yml
│   ├── kubernetes/          # Kubernetes manifests
│       ├── 01-namespace.yaml
│       ├── 02-configmap.yaml
│       ├── 03-secret.yaml
│       ├── 04-storage.yaml
│       ├── 05-mongodb.yaml
│       ├── 06-backend.yaml
│       ├── 07-frontend.yaml
│       ├── 08-ingress.yaml
│       └── 09-hpa.yaml
└── README.md        
```

## 📦 Prerequisites

#### For Local Development
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

#### For Docker Deployment
- Docker Desktop 20+
- Docker Compose

#### For AWS EKS Deployment
- AWS CLI configured
- kubectl
- eksctl
- Docker
- Helm

## 🚀 Deployment Options

### Option 1: Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/shopsphere.git
cd shopsphere

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install --legacy-peer-deps

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI

# Run backend (Terminal 1)
cd backend
npm run dev
# Backend runs on http://localhost:5000

# Run frontend (Terminal 2)
cd frontend
npm start
# Frontend runs on http://localhost:3000

# Seed products
curl http://localhost:5000/api/products/seed
```

### Option 2: Docker Compose

```bash
# Run all services with Docker Compose
docker-compose -f deployment/docker/docker-compose.yml up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: mongodb://localhost:27017

# Seed products
curl http://localhost:3000/api/products/seed

# Stop all services
docker-compose -f deployment/docker/docker-compose.yml down
```

### Option 3: AWS EKS (Production)

### ✅ Prerequisites (Check These First)

```bash
# Check if all tools are installed
aws --version
kubectl version --client
eksctl version
docker --version
helm version
```


### Phase 1: AWS Setup (5 minutes)

#### Step 1: Configure AWS CLI
```bash
aws configure

# Enter:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: us-east-2
# Default output format: json

# Verify
aws sts get-caller-identity
# Should show your account details
```

### Phase 2: ECR Setup (Push Docker Images) - 10 minutes

#### Step 2: Create ECR Repositories
```bash
# Set variables
export AWS_REGION=us-east-2
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create repositories
aws ecr create-repository --repository-name shopsphere-backend --region $AWS_REGION
aws ecr create-repository --repository-name shopsphere-frontend --region $AWS_REGION
```

#### Step 3: Login to ECR
```bash
# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

#### Step 4: Build and Push Backend Image
```bash
# Build backend image
docker build -t shopsphere-backend:latest -f deployment/docker/Dockerfile.backend .

# Tag backend image
docker tag shopsphere-backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopsphere-backend:latest

# Push backend image
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopsphere-backend:latest
```

#### Step 5: Build and Push Frontend Image
```bash
# Build frontend image
docker build -t shopsphere-frontend:latest -f deployment/docker/Dockerfile.frontend .

# Tag frontend image
docker tag shopsphere-frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopsphere-frontend:latest

# Push frontend image
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopsphere-frontend:latest
```

#### Step 6: Verify Images in ECR
```bash
# Check images
aws ecr list-images --repository-name shopsphere-backend --region $AWS_REGION
aws ecr list-images --repository-name shopsphere-frontend --region $AWS_REGION
```

### Phase 3: EKS Cluster Creation (15-20 minutes)

#### Step 7: Create EKS Cluster
```bash
# Create cluster (this takes 15-20 minutes)
eksctl create cluster \
    --name shopsphere-cluster \
    --region $AWS_REGION \
    --nodegroup-name workers \
    --node-type t3.medium \
    --nodes 2 \
    --managed \
    --with-oidc

# Wait for completion... you'll see "EKS cluster ready" message
```

#### Step 8: Update kubeconfig
```bash
# Update kubeconfig to connect to cluster
aws eks update-kubeconfig --region $AWS_REGION --name shopsphere-cluster

# Verify cluster connection
kubectl get nodes
# Should show 2 nodes
```

### Phase 4: Install Required Add-ons (10 minutes)

#### Step 9: Install EBS CSI Driver (For MongoDB Persistence)
```bash
# Install EBS CSI driver
eksctl create addon \
    --name aws-ebs-csi-driver \
    --cluster shopsphere-cluster \
    --region $AWS_REGION \
    --force

# Verify
kubectl get pods -n kube-system | grep ebs-csi
```

#### Step 10: Install ALB Ingress Controller (For Internet Access)
```bash
# Download IAM policy
curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.5.0/docs/install/iam_policy.json

# Create IAM policy
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam-policy.json

# Create service account
eksctl create iamserviceaccount \
    --cluster=shopsphere-cluster \
    --namespace=kube-system \
    --name=aws-load-balancer-controller \
    --attach-policy-arn=arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy \
    --region=$AWS_REGION \
    --approve

# Install Helm (if not installed)
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh

# Add EKS Helm repo
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install ALB controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
    --namespace kube-system \
    --set clusterName=shopsphere-cluster \
    --set serviceAccount.create=false \
    --set serviceAccount.name=aws-load-balancer-controller

# Verify
kubectl get deployment -n kube-system aws-load-balancer-controller
```

### Phase 5: Update Kubernetes Manifests (2 minutes)

#### Step 11: Update Manifests with Your ECR URLs
```bash
# Update backend manifest
sed -i "s|YOUR_AWS_ACCOUNT_ID|${AWS_ACCOUNT_ID}|g" deployment/kubernetes/06-backend.yaml
sed -i "s|YOUR_AWS_REGION|${AWS_REGION}|g" deployment/kubernetes/06-backend.yaml

# Update frontend manifest
sed -i "s|YOUR_AWS_ACCOUNT_ID|${AWS_ACCOUNT_ID}|g" deployment/kubernetes/07-frontend.yaml
sed -i "s|YOUR_AWS_REGION|${AWS_REGION}|g" deployment/kubernetes/07-frontend.yaml

# Verify
grep "image:" deployment/kubernetes/06-backend.yaml
grep "image:" deployment/kubernetes/07-frontend.yaml
```

### Phase 6: Deploy Application (5 minutes)

#### Step 12: Deploy All Kubernetes Resources
```bash
# Deploy everything
kubectl apply -f deployment/kubernetes/

# Check namespace created
kubectl get namespaces | grep shopsphere

# Check all resources
kubectl get all -n shopsphere
```

#### Step 13: Watch Pods Starting
```bash
# Watch pods come up (press Ctrl+C when all are Running)
kubectl get pods -n shopsphere -w

# You should see:
# mongodb-xxx         Running
# backend-xxx-xxx     Running
# frontend-xxx-xxx    Running
```

### Phase 7: Get Application URL (2-3 minutes)

#### Step 14: Wait for ALB to Create
```bash
# Wait 2-3 minutes for ALB to be created
sleep 120

# Check ingress
kubectl get ingress -n shopsphere

# Get ALB URL
ALB_URL=$(kubectl get ingress shopsphere-ingress -n shopsphere -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Application URL: http://$ALB_URL"
```

### Phase 8: Test Application (2 minutes)

#### Step 15: Test API and Seed Products
```bash
# Test health endpoint
curl http://$ALB_URL/api/health

# Seed products
curl http://$ALB_URL/api/products/seed

# Check products
curl http://$ALB_URL/api/products | jq '.total'
# Should show 12

# Open in browser
echo "Open in browser: http://$ALB_URL"
```

### 📊 Quick Commands Reference

```bash
# Check everything
kubectl get all -n shopsphere

# Check pod logs
kubectl logs -f -n shopsphere deployment/backend
kubectl logs -f -n shopsphere deployment/frontend

# Scale application
kubectl scale deployment backend -n shopsphere --replicas=3
kubectl scale deployment frontend -n shopsphere --replicas=3

# Check HPA
kubectl get hpa -n shopsphere

# Restart deployments
kubectl rollout restart deployment backend -n shopsphere
kubectl rollout restart deployment frontend -n shopsphere
```

### 🎯 One-Liner to Run Everything (After Cluster Created)

```bash
# After cluster is created, run this:
kubectl apply -f deployment/kubernetes/ && \
sleep 30 && \
kubectl get pods -n shopsphere && \
ALB_URL=$(kubectl get ingress shopsphere-ingress -n shopsphere -o jsonpath='{.status.loadBalancer.ingress[0].hostname}') && \
echo "Application URL: http://$ALB_URL" && \
curl http://$ALB_URL/api/health
```

### 📋 Summary - All Steps at a Glance

| Step | Task | Time |
|------|------|------|
| 1 | Configure AWS CLI | 2 min |
| 2 | Create ECR repos | 2 min |
| 3 | Login to ECR | 1 min |
| 4 | Build & push backend image | 3 min |
| 5 | Build & push frontend image | 3 min |
| 6 | Create EKS cluster | 15-20 min |
| 7 | Install EBS CSI driver | 2 min |
| 8 | Install ALB controller | 5 min |
| 9 | Update K8s manifests | 2 min |
| 10 | Deploy to EKS | 3 min |
| 11 | Get ALB URL | 2-3 min |
| 12 | Test application | 2 min |

**Total: ~45-50 minutes**

### 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login user |
| GET | `/api/auth/me` | ✅ | Get user profile |
| GET | `/api/products` | ❌ | Get all products |
| GET | `/api/products/featured` | ❌ | Get featured products |
| GET | `/api/products/categories` | ❌ | Get product categories |
| GET | `/api/products/:id` | ❌ | Get single product |
| POST | `/api/products/:id/reviews` | ✅ | Add product review |
| GET | `/api/products/seed` | ❌ | Seed sample products |
| POST | `/api/orders` | ✅ | Create order |
| GET | `/api/orders/my` | ✅ | Get user orders |
| GET | `/api/orders/:id` | ✅ | Get order details |
| GET | `/api/health` | ❌ | Health check |

### 🔧 Environment Variables

#### Backend (backend/.env)
```env
MONGO_URI=mongodb://localhost:27017/shopsphere
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

#### Frontend (frontend/.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 📊 Monitoring & Logs

#### Local/Docker
```bash
# View Docker logs
docker logs shopsphere-backend -f
docker logs shopsphere-frontend -f
docker logs shopsphere-mongodb -f

# Check container status
docker ps
```

#### EKS
```bash
# Check all resources
kubectl get all -n shopsphere

# View pod logs
kubectl logs -f -n shopsphere deployment/backend
kubectl logs -f -n shopsphere deployment/frontend

# Check events
kubectl get events -n shopsphere --sort-by='.lastTimestamp'

# Scale application
kubectl scale deployment backend -n shopsphere --replicas=3
kubectl scale deployment frontend -n shopsphere --replicas=3

# Check HPA
kubectl get hpa -n shopsphere

# Port forward for testing
kubectl port-forward -n shopsphere service/backend-service 5000:5000
```

### 🔍 Troubleshooting

#### Common Issues

#### 1. MongoDB Connection Failed
```bash
# Check if MongoDB is running
docker ps | grep mongodb
kubectl get pods -n shopsphere | grep mongodb

# Check MongoDB logs
docker logs shopsphere-mongodb
kubectl logs -n shopsphere deployment/mongodb
```

#### 2. CORS Errors
- Backend CORS is configured to allow localhost and EC2 IP
- For production, update the origin list in `backend/server.js`

#### 3. Images Not Pulling in EKS
```bash
# Check pod status
kubectl describe pod -n shopsphere <pod-name>

# Check image pull secrets
kubectl get secrets -n shopsphere

# Verify ECR access
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-2.amazonaws.com
```

#### 4. ALB Not Creating
```bash
# Check ingress status
kubectl describe ingress shopsphere-ingress -n shopsphere

# Check ALB controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller
```

### 🧹 Cleanup

#### Docker Compose Cleanup
```bash
# Stop and remove containers
docker-compose -f deployment/docker/docker-compose.yml down -v

# Remove volumes (optional)
docker volume prune
```

#### EKS Cleanup
```bash
# Delete application
kubectl delete namespace shopsphere

# Delete EKS cluster
eksctl delete cluster --name shopsphere-cluster --region us-east-2

# Delete ECR repositories
aws ecr delete-repository --repository-name shopsphere-backend --force --region us-east-2
aws ecr delete-repository --repository-name shopsphere-frontend --force --region us-east-2
```

## 🎓 Conclusion

This project demonstrates a cloud-native MERN e-commerce application deployed on AWS EKS using modern DevOps practices. It highlights end to end expertise from application development and containerization to Kubernetes orchestration and cloud deployment. Showcasing a scalable, production-ready architecture and real-world DevOps skills.


*Built with ❤️ by **Naman Pandey** | DevOps Engineer | Cloud-Native Architecture 🚀*
