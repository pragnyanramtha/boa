# AI COO — Business Operations Agent

An AI-powered business operations assistant that orchestrates multi-tool queries across inventory, sales, finance, procurement, and customer data.

Built with Next.js 16, AI SDK v7, Drizzle ORM + Neon, and Gemini API (Gemma 4 31B).

## Stack

- **Framework:** Next.js 16 (App Router, TypeScript, Tailwind v4)
- **AI:** Vercel AI SDK v7 (`streamText`, `tool()`, `useChat`)
- **LLM:** Gemma 4 31B via `@ai-sdk/google` (Gemini API)
- **Database:** Neon (serverless Postgres) + Drizzle ORM
- **Data:** Faker-generated seed data

## Tools

| Tool | Description |
|------|-------------|
| `checkInventory` | Query stock by category, warehouse, low-stock threshold |
| `forecastDemand` | ML-based demand forecast for any product |
| `analyzeProfitability` | Product-level profit margin analysis |
| `trackExpenses` | Expense overview by category, date range, department |
| `evaluateSupplier` | Supplier reliability scores with on-time rate, quality, lead time |
| `analyzeSales` | Revenue trends, top SKUs, category breakdowns |
| `segmentCustomers` | Customer segmentation by total spent, order count, tenure |
| `sendNotification` | Create or list system notifications |
| `createWorkflow` | Create or list approval workflows |

The AI supervisor chains tools together autonomously with up to 5 sequential steps.

## Setup

```bash
pnpm install
```

Create `.env.local`:

```
DATABASE_URL=postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

Push schema and seed data:

```bash
pnpm db:push
pnpm tsx db/seed.ts
```

Run:

```bash
pnpm dev
```
