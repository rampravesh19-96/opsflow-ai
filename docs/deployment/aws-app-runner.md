# AWS App Runner Deployment

This is the recommended first deployment path for OpsFlow AI:

- App: AWS App Runner
- Artifact type: container image
- Image registry: Amazon ECR
- Database: external PostgreSQL via `DATABASE_URL`

This path is the most reliable fit for the current codebase because:
- the app already builds with Next.js standalone output
- we control the Node runtime exactly inside the image
- App Runner only has to run the container, not infer a Next.js build/runtime setup
- the deployment flow stays simple and interview-friendly

## 1. Required AWS Services

- Amazon ECR
- AWS App Runner
- an external PostgreSQL database reachable from App Runner

## 2. Required Environment Variables

Configure these in App Runner:

- `DATABASE_URL`
- `DATABASE_SSL`
- `APP_URL`
- `NODE_ENV=production`

Recommended values:

```env
DATABASE_URL=postgres://USERNAME:PASSWORD@HOSTNAME:5432/opsflow_ai
DATABASE_SSL=require
APP_URL=https://YOUR-APP-RUNNER-URL
NODE_ENV=production
```

Notes:
- Use `DATABASE_SSL=require` for managed production PostgreSQL unless your provider explicitly says not to.
- `APP_URL` should be set after the App Runner service URL is known. You can update it after first deploy.

## 3. Prepare The Database

Before the first deployment, apply the schema to the target database from your local machine:

```bash
copy .env.example .env.local
```

Update `.env.local` with the production/staging database values, then run:

```bash
npm install
npm run db:push
```

If you want demo data in the deployed environment too:

```bash
npm run db:seed
```

Do not run `db:seed` against a real production dataset.

## 4. Build And Push The Container

Create an ECR repository named `opsflow-ai`, then build and push:

```bash
aws ecr get-login-password --region <AWS_REGION> | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com
docker build -t opsflow-ai .
docker tag opsflow-ai:latest <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/opsflow-ai:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/opsflow-ai:latest
```

## 5. Create The App Runner Service

In AWS App Runner:

1. Choose `Create service`
2. Choose `Container registry`
3. Choose `Amazon ECR`
4. Select repository: `opsflow-ai`
5. Select image tag: `latest`
6. Set service port to `3000`
7. Set health check protocol to `HTTP`
8. Set health check path to `/api/health`
9. Add runtime environment variables:
   - `DATABASE_URL`
   - `DATABASE_SSL`
   - `APP_URL`
   - `NODE_ENV`
10. Deploy

## 6. After The Service Is Live

Update `APP_URL` in App Runner to the generated service URL if you did not know it in advance:

```env
APP_URL=https://<service-id>.<region>.awsapprunner.com
```

Trigger a redeploy after updating the variable.

## 7. Verify The Deployment

Check these paths:

- `/api/health`
- `/`
- `/orders`
- `/issues`
- `/actions`
- `/orders/ord_1001`
- `/customers/cus_1001`

You should confirm:
- the health endpoint returns JSON with `"status": "ok"`
- the app loads without server errors
- orders and action history render from the configured database
- order detail pages still support write-side workflows

## 8. First-Version Limitations

- no auth or access control yet
- no private networking/VPC connector setup yet
- no managed secret store wiring yet beyond App Runner env vars
- no CI/CD automation yet for image build/push/deploy
- database migrations are still run manually via `db:push`
