## OpsFlow AI

OpsFlow AI is a serious internal operations control center for transaction-heavy ecommerce systems. Milestone 1 establishes the project foundation: Next.js app setup, dashboard shell, premium internal-tool UX base, initial routes, PostgreSQL schema design, and seed/demo data scaffolding.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- PostgreSQL schema foundation with Drizzle ORM
- Modular monolith architecture

## Getting started

Install dependencies and run the app:

```bash
npm install
copy .env.example .env.local
npm run dev
```

Optional database foundation commands:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## Milestone 1

Working now:
- command center shell and navigation
- route structure for dashboard, orders, order detail, issues, customer detail, actions, and settings
- premium internal-tool visual foundation
- realistic demo order data
- PostgreSQL schema and seed scaffolding

Still placeholder by design:
- AI behavior
- authentication
- live database persistence in the UI
- external ecommerce integrations
- executable recovery actions
