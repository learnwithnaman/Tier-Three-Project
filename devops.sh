#!/bin/bash

# ============================================================
#  ShopSphere - Update Deployment Files Only
#  Creates Dockerfiles and Kubernetes manifests
#  No AWS credentials needed
# ============================================================

set -e
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════╗"
echo "║   ShopSphere - Update Deployment Files   ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Create deployment directory
mkdir -p deployment/{docker,kubernetes,scripts}

echo -e "${YELLOW}📦 Creating Dockerfiles...${NC}"

# DOCKER FILES
cat > deployment/docker/Dockerfile.backend << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
EXPOSE 5000
CMD ["node", "server.js"]
EOF

cat > deployment/docker/Dockerfile.frontend << 'EOF'
FROM node:18-alpine as builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ .
RUN npm run build
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

cat > deployment/docker/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        location / {
            try_files $uri $uri/ /index.html;
        }
        location /api {
            proxy_pass http://backend-service:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF

cat > deployment/docker/docker-compose.yml << 'EOF'
version: '3.8'
services:
  mongodb:
    image: mongo:6
    container_name: shopsphere-mongodb
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - shopsphere-network
  backend:
    build:
      context: ../..
      dockerfile: deployment/docker/Dockerfile.backend
    container_name: shopsphere-backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/shopsphere
      - JWT_SECRET=shopsphere_super_secret_key_2024
      - NODE_ENV=development
      - PORT=5000
    depends_on:
      - mongodb
    networks:
      - shopsphere-network
  frontend:
    build:
      context: ../..
      dockerfile: deployment/docker/Dockerfile.frontend
    container_name: shopsphere-frontend
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - shopsphere-network
volumes:
  mongodb_data:
networks:
  shopsphere-network:
    driver: bridge
EOF

echo -e "${GREEN}✅ Dockerfiles created${NC}"

# KUBERNETES MANIFESTS
echo -e "${YELLOW}☸️  Creating Kubernetes manifests...${NC}"

cat > deployment/kubernetes/01-namespace.yaml << 'EOF'
apiVersion: v1
kind: Namespace
metadata:
  name: shopsphere
EOF

cat > deployment/kubernetes/02-configmap.yaml << 'EOF'
apiVersion: v1
kind: ConfigMap
metadata:
  name: shopsphere-config
  namespace: shopsphere
data:
  MONGO_URI: "mongodb://mongodb-service:27017/shopsphere"
  NODE_ENV: "production"
  PORT: "5000"
EOF

cat > deployment/kubernetes/03-secret.yaml << 'EOF'
apiVersion: v1
kind: Secret
metadata:
  name: shopsphere-secret
  namespace: shopsphere
type: Opaque
stringData:
  JWT_SECRET: "shopsphere_production_secret_key_2024"
EOF

cat > deployment/kubernetes/04-storage.yaml << 'EOF'
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  encrypted: "true"
reclaimPolicy: Retain
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
  namespace: shopsphere
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp3
  resources:
    requests:
      storage: 10Gi
EOF

cat > deployment/kubernetes/05-mongodb.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: shopsphere
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:6
        ports:
        - containerPort: 27017
        volumeMounts:
        - name: mongodb-storage
          mountPath: /data/db
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
      volumes:
      - name: mongodb-storage
        persistentVolumeClaim:
          claimName: mongodb-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb-service
  namespace: shopsphere
spec:
  selector:
    app: mongodb
  ports:
  - port: 27017
    targetPort: 27017
EOF

cat > deployment/kubernetes/06-backend.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: shopsphere
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: YOUR_AWS_ACCOUNT_ID.dkr.ecr.YOUR_AWS_REGION.amazonaws.com/shopsphere-backend:latest
        ports:
        - containerPort: 5000
        envFrom:
        - configMapRef:
            name: shopsphere-config
        - secretRef:
            name: shopsphere-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: shopsphere
spec:
  selector:
    app: backend
  ports:
  - port: 5000
    targetPort: 5000
EOF

cat > deployment/kubernetes/07-frontend.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: shopsphere
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: YOUR_AWS_ACCOUNT_ID.dkr.ecr.YOUR_AWS_REGION.amazonaws.com/shopsphere-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: shopsphere
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
EOF

cat > deployment/kubernetes/08-ingress.yaml << 'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shopsphere-ingress
  namespace: shopsphere
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/healthcheck-path: /
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 5000
EOF

cat > deployment/kubernetes/09-hpa.yaml << 'EOF'
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: shopsphere
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
  namespace: shopsphere
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
EOF

echo -e "${GREEN}✅ Kubernetes manifests created${NC}"

# HELPER SCRIPTS
echo -e "${YELLOW}📝 Creating helper scripts...${NC}"

cat > deployment/scripts/local-test.sh << 'EOF'
#!/bin/bash
echo "Starting local test with docker-compose..."
cd deployment/docker
docker-compose up --build
EOF

cat > deployment/scripts/update-images.sh << 'EOF'
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
EOF

cat > deployment/scripts/deploy.sh << 'EOF'
#!/bin/bash
echo "Deploying to Kubernetes..."
kubectl apply -f deployment/kubernetes/
echo ""
echo "Checking status..."
kubectl get pods -n shopsphere
kubectl get svc -n shopsphere
kubectl get ingress -n shopsphere
EOF

cat > deployment/scripts/cleanup.sh << 'EOF'
#!/bin/bash
echo "Cleaning up..."
kubectl delete namespace shopsphere
echo "✅ Cleanup complete!"
EOF

chmod +x deployment/scripts/*.sh

echo -e "${GREEN}✅ Helper scripts created${NC}"

# README
echo -e "${YELLOW}📖 Creating README...${NC}"

cat > deployment/README.md << 'EOF'
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
EOF

echo -e "${GREEN}✅ README created${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅  Deployment files updated!         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Files created in: ./deployment/${NC}"
echo ""
echo "  📁 deployment/docker/"
echo "     ├── Dockerfile.backend"
echo "     ├── Dockerfile.frontend"
echo "     ├── nginx.conf"
echo "     └── docker-compose.yml"
echo ""
echo "  📁 deployment/kubernetes/"
echo "     ├── 01-namespace.yaml"
echo "     ├── 02-configmap.yaml"
echo "     ├── 03-secret.yaml"
echo "     ├── 04-storage.yaml"
echo "     ├── 05-mongodb.yaml"
echo "     ├── 06-backend.yaml"
echo "     ├── 07-frontend.yaml"
echo "     ├── 08-ingress.yaml"
echo "     └── 09-hpa.yaml"
echo ""
echo "  📁 deployment/scripts/"
echo "     ├── local-test.sh"
echo "     ├── update-images.sh"
echo "     ├── deploy.sh"
echo "     └── cleanup.sh"
echo ""
echo -e "${YELLOW}Next steps when ready:${NC}"
echo "  1. Build images: docker build -f deployment/docker/Dockerfile.backend ."
echo "  2. Push to ECR"
echo "  3. Update images: ./deployment/scripts/update-images.sh YOUR_ACCOUNT_ID us-east-2"
echo "  4. Deploy: ./deployment/scripts/deploy.sh"
echo ""
echo -e "${CYAN}Local testing: ./deployment/scripts/local-test.sh${NC}"