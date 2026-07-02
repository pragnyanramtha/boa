# AI COO — Business Operations Agent

An AI-powered Chief Operating Officer that answers questions about inventory, sales, expenses, suppliers, and more — all through a natural language chat interface.

Built with Next.js 16, Vercel AI SDK v7, Drizzle ORM + Neon Postgres, and Google Gemma 4 31B.

## Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, TypeScript, Tailwind v4) |
| **AI Runtime** | Vercel AI SDK v7 (`streamText`, `tool()`, Google provider) |
| **LLM** | Gemma 4 31B via `@ai-sdk/google` (Gemini API) |
| **Chat UI** | [assistant-ui](https://www.assistant-ui.com) (React, Lexical composer, sidebar, thread management) |
| **Database** | Neon (serverless Postgres) + Drizzle ORM |
| **Data** | Faker-generated seed data (30 suppliers, 990 products, 200 customers, 5K+ transactions) |

## Tools

The AI supervisor can chain up to 5 tool calls autonomously:

| Tool | What it does |
|------|-------------|
| `checkInventory` | Query stock by category, warehouse, low-stock alert |
| `forecastDemand` | Product-level demand forecast with reorder recommendations |
| `analyzeProfitability` | Profit margin analysis per product/category |
| `trackExpenses` | Expense breakdown by category, date range, department |
| `evaluateSupplier` | Supplier reliability scores, on-time rate, lead time |
| `analyzeSales` | Revenue trends, top SKUs, category performance |
| `segmentCustomers` | Customer segments by spend, order count, tenure |
| `sendNotification` | Create or list system notifications |
| `createWorkflow` | Create or list approval workflows |

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/pragnyanramtha/boa.git
cd boa
pnpm install
```

### 2. Database — Neon (serverless Postgres)

Create a free database at [neon.tech](https://neon.tech):

1. Sign up / log in
2. Create a new project (any region)
3. Copy the connection string from the dashboard — it looks like:
   ```
   postgres://alex:AbC123…@ep-xyz-123.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 3. Gemini API Key

Get a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (Gemini tier includes Gemma 4 31B).

### 4. Environment Variables

Create `.env.local` in the project root:

```env
DATABASE_URL=postgres://alex:AbC123…@ep-xyz-123.us-east-2.aws.neon.tech/neondb?sslmode=require
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy…
```

### 5. Push Schema & Seed Data

```bash
# Creates all 8 tables in your Neon database
pnpm db:push

# Fills them with realistic demo data (30 suppliers, 990 products, 200 customers, 5K+ sales)
pnpm tsx db/seed.ts
```

### 6. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and start asking questions like:

> *"Check inventory levels across all warehouses"*  
> *"What are our current operating expenses?"*  
> *"Which suppliers have the best reliability scores?"*

## Database Schema

Eight tables with full Drizzle relations:

| Table | Contents |
|-------|----------|
| `suppliers` | 30 suppliers with lead times, reliability scores |
| `products` | 990 products across categories, linked to suppliers |
| `customers` | 200 customers with contact info |
| `sales` | 5,000+ transactions with product, qty, price |
| `purchase_orders` | 200 POs with status, fulfillment tracking |
| `expenses` | 300 expense records by category |
| `notifications` | Sample system notifications |
| `workflows` | Approval workflow templates |

## Database Scripts

| Command | Description |
|---------|-------------|
| `pnpm db:push` | Push Drizzle schema to Neon |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:seed` | Seed with Faker demo data |
| `pnpm db:studio` | Launch Drizzle Studio |

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pragnyanramtha/boa)

Set `DATABASE_URL` and `GOOGLE_GENERATIVE_AI_API_KEY` as Vercel environment variables. No build steps needed beyond the default Vercel Next.js configuration.
