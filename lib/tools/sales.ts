import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { eq, and, gte, lte, desc, sum, sql } from "drizzle-orm";

export const analyzeSales = tool({
  description:
    "Analyze sales trends, top products, and category breakdown",
  inputSchema: z.object({
    category: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.number().optional().default(20),
  }),
  execute: async ({ category, startDate, endDate, limit = 20 }) => {
    const conditions = [];

    if (category) {
      conditions.push(eq(schema.products.category, category));
    }
    if (startDate) {
      conditions.push(gte(schema.sales.saleDate, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(schema.sales.saleDate, new Date(endDate)));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Top products by revenue
    const topProducts = await db
      .select({
        productId: schema.sales.productId,
        productName: schema.products.name,
        category: schema.products.category,
        revenue: sql<string>`sum(${schema.sales.total})`,
        unitsSold: sql<number>`sum(${schema.sales.quantity})`,
        avgPrice: sql<string>`avg(${schema.sales.unitPrice})`,
      })
      .from(schema.sales)
      .innerJoin(
        schema.products,
        eq(schema.sales.productId, schema.products.id)
      )
      .where(where)
      .groupBy(
        schema.sales.productId,
        schema.products.name,
        schema.products.category
      )
      .orderBy(desc(sql`sum(${schema.sales.total})`))
      .limit(limit);

    // Daily totals
    const dailyTotals = await db
      .select({
        date: sql<string>`${schema.sales.saleDate}::date`,
        revenue: sql<string>`sum(${schema.sales.total})`,
        orders: sql<number>`count(*)`,
        items: sql<number>`sum(${schema.sales.quantity})`,
      })
      .from(schema.sales)
      .where(where)
      .groupBy(sql`${schema.sales.saleDate}::date`)
      .orderBy(desc(sql`${schema.sales.saleDate}::date`))
      .limit(90);

    // Category breakdown
    const categoryBreakdown = await db
      .select({
        category: schema.products.category,
        revenue: sql<string>`sum(${schema.sales.total})`,
        unitsSold: sql<number>`sum(${schema.sales.quantity})`,
        transactionCount: sql<number>`count(*)`,
      })
      .from(schema.sales)
      .innerJoin(
        schema.products,
        eq(schema.sales.productId, schema.products.id)
      )
      .where(where)
      .groupBy(schema.products.category)
      .orderBy(desc(sql`sum(${schema.sales.total})`));

    // Grand total
    const [grandTotal] = await db
      .select({
        totalRevenue: sql<string>`coalesce(sum(${schema.sales.total}), '0')`,
        totalUnits: sql<number>`coalesce(sum(${schema.sales.quantity}), 0)`,
        totalTransactions: sql<number>`coalesce(count(*), 0)`,
      })
      .from(schema.sales)
      .where(where);

    return {
      summary: {
        totalRevenue: Number(grandTotal?.totalRevenue ?? 0),
        totalUnitsSold: Number(grandTotal?.totalUnits ?? 0),
        totalTransactions: Number(grandTotal?.totalTransactions ?? 0),
      },
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        category: p.category,
        revenue: Number(p.revenue),
        unitsSold: Number(p.unitsSold),
        avgPrice: Number(p.avgPrice),
      })),
      dailyTotals: dailyTotals.map((d) => ({
        date: d.date,
        revenue: Number(d.revenue),
        orders: Number(d.orders),
        items: Number(d.items),
      })),
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c.category,
        revenue: Number(c.revenue),
        unitsSold: Number(c.unitsSold),
        transactionCount: Number(c.transactionCount),
      })),
    };
  },
});
