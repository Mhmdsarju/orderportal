# OrderPortal

TypeScript-first Micro Frontend + Microservices reference application.

## Stack
- React + TypeScript + Webpack 5 Module Federation
- Host + Auth + Dashboard + Profile + Settings MFEs
- Shared Redux Toolkit store
- Express + TypeScript API Gateway, User Service and Order Service
- MongoDB + Mongoose; PostgreSQL + Prisma
- gRPC between Order Service and User Service
- Docker Compose, Kubernetes manifests, GitHub Actions CI/CD

## Prerequisites
Node.js 18.12+ (Node 20+ recommended), npm 9+, Docker Desktop, and (for Kubernetes) Docker Desktop Kubernetes or Minikube with kubectl. Docker Hub account is needed only for image publishing; the Kubernetes image repositories must be public unless you configure an imagePullSecret.

## 1. Configure environment
Copy `.env.example` to `.env`, then set a strong unique `JWT_SECRET` (at least 32 random characters). Never commit `.env` or real Kubernetes secrets.

## 2. Install dependencies
From repository root:

```bash
npm install
```

## 3. Run backend locally
Start MongoDB and PostgreSQL locally or with Compose. For local development, easiest is:

```bash
docker compose up -d mongodb postgres
```

Then in separate terminals:

```bash
npm run dev --workspace=@orderportal/user-service
npm run dev --workspace=@orderportal/order-service
npm run dev --workspace=@orderportal/api-gateway
```

The Order Service runs Prisma migrations automatically only when explicitly requested. Export the root `.env` values before running Prisma CLI, then apply the migration:

```bash
set -a; source .env; set +a
npm run prisma:migrate --workspace=@orderportal/order-service
```

## 4. Run the frontend
Open separate terminals:

```bash
npm run dev --workspace=@orderportal/auth
npm run dev --workspace=@orderportal/dashboard
npm run dev --workspace=@orderportal/profile
npm run dev --workspace=@orderportal/settings
npm run dev --workspace=@orderportal/host
```

Host: http://localhost:3098. Gateway: http://localhost:3000. MFE dev ports: 4101–4104. Set `API_BASE_URL` before starting/building the MFEs to override the default gateway URL. For a deployed Host, set `AUTH_REMOTE_URL`, `DASHBOARD_REMOTE_URL`, `PROFILE_REMOTE_URL`, and `SETTINGS_REMOTE_URL` to each remote’s production `remoteEntry.js` URL before building Host.

## 5. API flow
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `GET /api/users/:id` (admin only)
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id` (owner only)
- `PATCH /api/orders/:id` (owner or admin; role is verified through gRPC)

Send `Authorization: Bearer <JWT>` on protected requests. To create an admin, register a normal user then run the one-time admin promotion script with that user's email:

```bash
npm run promote-admin --workspace=@orderportal/user-service -- user@example.com
```

## 6. Docker Compose
Set values in `.env`, especially `JWT_SECRET`, then:

```bash
docker compose up --build
```

Frontend dev servers are not part of the backend Compose stack; run them with the commands above. The gateway is exposed on port 3000, and MongoDB/PostgreSQL are exposed on 27017/5432 for local development. MongoDB and PostgreSQL use named volumes.

## 7. Kubernetes (local cluster)
Enable Kubernetes in Docker Desktop or start Minikube. Load your `.env` values into the shell, then create a namespace and Secret (do not apply the example Secret with placeholder credentials):

```bash
set -a; source .env; set +a
```


```bash
kubectl apply -f infrastructure/kubernetes/namespace.yaml
kubectl -n orderportal create secret generic orderportal-secrets \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=MONGO_URI='mongodb://mongodb:27017/orderportal_users' \
  --from-literal=DATABASE_URL="postgresql://orderportal:${POSTGRES_PASSWORD}@postgres:5432/orderportal_orders?schema=public" \
  --from-literal=POSTGRES_PASSWORD='YOUR_PASSWORD' \
  --dry-run=client -o yaml | kubectl apply -f -
```

Build images for the local cluster and tag them as referenced in the manifests (`orderportal/gateway:local`, `orderportal/user-service:local`, `orderportal/order-service:local`). With Minikube use `eval $(minikube docker-env)` before building. Then:

```bash
docker build -t orderportal/gateway:local ./backend/api-gateway
docker build -t orderportal/user-service:local ./backend/user-service
docker build -t orderportal/order-service:local ./backend/order-service
kubectl apply -f infrastructure/kubernetes/databases/
kubectl apply -f infrastructure/kubernetes/user-service/
kubectl apply -f infrastructure/kubernetes/order-service/
kubectl apply -f infrastructure/kubernetes/gateway/
kubectl -n orderportal get pods -w
# In another terminal, expose the gateway locally:
kubectl -n orderportal port-forward svc/gateway 3000:3000
```

Database manifests use single-replica StatefulSets and PVCs for local learning. They are not a highly available production database design. Configure StorageClass for your cluster if required.

## 8. CI/CD
Set GitHub repository secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `KUBE_CONFIG` (base64 kubeconfig for a cluster reachable by GitHub-hosted runners), `JWT_SECRET`, `MONGO_URI`, `DATABASE_URL`, and `POSTGRES_PASSWORD`. The workflow builds and pushes all three backend images in parallel, then deploys and waits for rollouts. Rollback is attempted on failure. A local-only Minikube cluster is not reachable from GitHub-hosted runners; use a self-hosted runner on the machine hosting the cluster.

## Security notes
- JWT is verified at gateway and service level.
- Passwords are bcrypt-hashed; password field is excluded by default from Mongoose queries.
- CORS is configurable; do not use wildcard origins in production.
- Kubernetes secret manifests are examples only. Prefer `kubectl create secret` or a secret manager; never commit real credentials.
- For production, use TLS for gRPC, rotate secrets, add observability, and use immutable image tags.

## Validation
Run `npm run typecheck` after installing dependencies. This repository is a learning/development baseline; test it in your target Docker/Kubernetes environment before treating it as production-ready.
