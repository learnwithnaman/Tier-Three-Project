# 🛍️ ShopSphere - MERN E-Commerce Application

A full-stack 3-tier e-commerce application built with MERN stack (MongoDB, Express.js, React.js, Node.js). Supports multiple deployment options including local development, Docker Compose, and production-grade AWS EKS.

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
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
│   │   ├── 01-namespace.yaml
│   │   ├── 02-configmap.yaml
│   │   ├── 03-secret.yaml
│   │   ├── 04-storage.yaml
│   │   ├── 05-mongodb.yaml
│   │   ├── 06-backend.yaml
│   │   ├── 07-frontend.yaml
│   │   ├── 08-ingress.yaml
│   │   └── 09-hpa.yaml
│   └── scripts/             # Helper scripts
│       ├── local-test.sh
│       ├── update-images.sh
│       └── cleanup.sh
│
├── .gitignore
├── README.md
└── deploy-to-eks.sh         # One-click EKS deployment script
```

## 📦 Prerequisites

### For Local Development
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### For Docker Deployment
- Docker Desktop 20+
- Docker Compose

### For AWS EKS Deployment
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

#### Step 1: Prerequisites
```bash
# Configure AWS CLI
aws configure
# Enter: Access Key, Secret Key, Region: us-east-2, Format: json

# Verify AWS credentials
aws sts get-caller-identity
```

#### Step 2: Build and Push Images to ECR
```bash
# Set variables
export AWS_REGION=us-east-2
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create ECR repositories
aws ecr create-repository --repository-name shopsphere-backend --region $AWS_REGION
aws ecr create-repository --repository-name shopsphere-frontend --region $AWS_REGION

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build images
docker build -t shopsphere-backend:latest -f deployment/docker/Dockerfile.backend .
docker build -t shopsphere-frontend:latest -f deployment/docker/Dockerfile.frontend .

# Tag and push
docker tag shopsphere-backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopsphere-backend:latest
docker tag shopsphere-frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopsphere-frontend:latest

docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopsphere-backend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopsphere-frontend:latest
```

#### Step 3: Create EKS Cluster
```bash
# Create EKS cluster (15-20 minutes)
eksctl create cluster \
    --name shopsphere-cluster \
    --region $AWS_REGION \
    --nodegroup-name workers \
    --node-type t3.medium \
    --nodes 2 \
    --managed \
    --with-oidc

# Update kubeconfig
aws eks update-kubeconfig --region $AWS_REGION --name shopsphere-cluster

# Verify cluster
kubectl get nodes
```

#### Step 4: Install Add-ons
```bash
# Install EBS CSI driver (for MongoDB persistence)
eksctl create addon \
    --name aws-ebs-csi-driver \
    --cluster shopsphere-cluster \
    --region $AWS_REGION \
    --force

# Install ALB Ingress Controller
curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.5.0/docs/install/iam_policy.json

aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam-policy.json

eksctl create iamserviceaccount \
    --cluster=shopsphere-cluster \
    --namespace=kube-system \
    --name=aws-load-balancer-controller \
    --attach-policy-arn=arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy \
    --region=$AWS_REGION \
    --approve

# Install Helm
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh && ./get_helm.sh

helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
    --namespace kube-system \
    --set clusterName=shopsphere-cluster \
    --set serviceAccount.create=false \
    --set serviceAccount.name=aws-load-balancer-controller
```

#### Step 5: Deploy Application
```bash
# Update Kubernetes manifests with your ECR URLs
sed -i "s|YOUR_AWS_ACCOUNT_ID|${AWS_ACCOUNT_ID}|g" deployment/kubernetes/06-backend.yaml
sed -i "s|YOUR_AWS_REGION|${AWS_REGION}|g" deployment/kubernetes/06-backend.yaml
sed -i "s|YOUR_AWS_ACCOUNT_ID|${AWS_ACCOUNT_ID}|g" deployment/kubernetes/07-frontend.yaml
sed -i "s|YOUR_AWS_REGION|${AWS_REGION}|g" deployment/kubernetes/07-frontend.yaml

# Deploy to EKS
kubectl apply -f deployment/kubernetes/

# Watch pods come up
kubectl get pods -n shopsphere -w
```

#### Step 6: Get Application URL
```bash
# Wait for ALB to be created (2-3 minutes)
sleep 120

# Get ALB URL
ALB_URL=$(kubectl get ingress shopsphere-ingress -n shopsphere -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Application URL: http://$ALB_URL"

# Seed products
curl http://$ALB_URL/api/products/seed

# Test the application
curl http://$ALB_URL/api/health
```

## 🔌 API Endpoints

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

## 🔧 Environment Variables

### Backend (backend/.env)
```env
MONGO_URI=mongodb://localhost:27017/shopsphere
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

### Frontend (frontend/.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📊 Monitoring & Logs

### Local/Docker
```bash
# View Docker logs
docker logs shopsphere-backend -f
docker logs shopsphere-frontend -f
docker logs shopsphere-mongodb -f

# Check container status
docker ps
```

### EKS
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

## 🔍 Troubleshooting

### Common Issues

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

## 🧹 Cleanup

### Docker Compose Cleanup
```bash
# Stop and remove containers
docker-compose -f deployment/docker/docker-compose.yml down -v

# Remove volumes (optional)
docker volume prune
```

### EKS Cleanup
```bash
# Delete application
kubectl delete namespace shopsphere

# Delete EKS cluster
eksctl delete cluster --name shopsphere-cluster --region us-east-2

# Delete ECR repositories
aws ecr delete-repository --repository-name shopsphere-backend --force --region us-east-2
aws ecr delete-repository --repository-name shopsphere-frontend --force --region us-east-2
```

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Unsplash for product images
- MongoDB Atlas for database hosting
- AWS for cloud infrastructure

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ using MERN Stack**

