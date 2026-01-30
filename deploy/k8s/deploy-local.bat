@echo off
echo [1/4] Creating Namespace...
kubectl apply -f namespace.yaml

echo [2/4] Deploying Infrastructure (Postgres & Redis)...
kubectl apply -f base/postgres.yaml
kubectl apply -f base/redis.yaml

echo [3/4] Building Images...
echo Note: This might take a few minutes.
cd ../..
echo Building API...
docker build -t chefos-api:latest -f apps/api/Dockerfile .
echo Building Admin...
docker build -t chefos-admin:latest -f apps/admin/Dockerfile .
echo Building Portal...
docker build -t chefos-portal:latest -f apps/portal/Dockerfile .
cd deploy/k8s

echo [4/4] Deploying Applications...
kubectl apply -f apps/api.yaml
kubectl apply -f apps/admin.yaml
kubectl apply -f apps/portal.yaml

echo Deployment complete! 
echo Check status with: kubectl get pods -n chefos
echo API will be available at: http://localhost:4000
