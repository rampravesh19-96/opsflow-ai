## OpsFlow AI

OpsFlow AI is a premium internal operations control center for transaction-heavy ecommerce systems. It is built as a modular monolith in Next.js with PostgreSQL and is designed to feel like a serious ops/support tool rather than a generic admin dashboard.

The current codebase includes:
- command-center dashboard and queue views
- PostgreSQL-backed order, issue, customer, and action history reads
- write-side operator workflows for notes, assignment, priority, case status, and recovery actions
- practical AI case guidance on order detail pages
- seeded local data for demos and interviews

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- PostgreSQL
- Drizzle ORM

## Environment Setup

1. Copy the example env file:

```bash
copy .env.example .env.local
```

2. Update the values:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/opsflow_ai
DATABASE_SSL=disable
APP_URL=http://localhost:3000
```

Notes:
- `DATABASE_SSL=disable` is the right default for local development.
- Set `DATABASE_SSL=require` for managed production databases that require TLS.
- Scripts and Drizzle now read from `.env.local` or `.env`, so local app runtime and database tooling use the same configuration flow.

## Local Development

Install dependencies:

```bash
npm install
```

Create the schema and seed demo data:

```bash
npm run db:push
npm run db:seed
```

Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production Verification

Run the full verification pass:

```bash
npm run check
```

Start a production server locally:

```bash
npm run build
npm run start
```

This is the best way to judge route speed, loading states, and deployment readiness because `next dev` is intentionally slower than production.

## Database Workflow

- `npm run db:push` applies the current schema directly to the target database.
- `npm run db:seed` resets seeded tables and reloads demo users, customers, orders, payments, fulfillment records, notes, action runs, and AI insights.
- `npm run db:generate` is available if you want Drizzle migration files for future tracked schema changes.

The seed script is intended for local/demo environments only.

## Deployment Notes

The app is configured with production-friendly defaults:
- standalone Next.js output
- compressed responses
- no `X-Powered-By` header
- pooled PostgreSQL connections with production-safe limits

Recommended near-term deployment target:
- Next.js app on AWS App Runner or ECS Fargate
- PostgreSQL on RDS or Aurora PostgreSQL

## Current Scope

Working now:
- command center dashboard
- orders queue and issues queue
- order detail workspace with timeline, notes, recovery actions, and AI guidance
- customer context page
- action history page
- PostgreSQL-backed reads and writes

Still intentionally placeholder:
- authentication and permissions
- external ecommerce, payment, or warehouse integrations
- travel support
- generalized AI chat
- production observability/integration plumbing beyond local deployability
