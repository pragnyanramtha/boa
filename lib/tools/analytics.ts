import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { eq, gte, desc, sum, sql } from "drizzle-orm";

export const analyzeProfitability = tool({
  description:
    "Analyze business profitability with revenue vs expenses breakdown",
  inputSchema: z.object({
    period: z.enum(["month", "quarter", "year"]).optional().default("month"),
    months: z.number().optional().default(12),
  }),
  execute: async ({ period = "month", months = 12 }) => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startDateStr = startDate.toISOString();

    const dateFilter = gte(schema.sales.saleDate, new Date(startDateStr));

    // Total revenue from sales
    const [revenueResult] = await db
      .select({
        totalRevenue: sql<string>`coalesce(sum(${schema.sales.total}), '0')`,
      })
      .from(schema.sales)
      .where(dateFilter);

    // Total expenses
    const expenseDateFilter = gte(
      schema.expenses.expenseDate,
      new Date(startDateStr)
    );
    const [expenseResult] = await db
      .select({
        totalExpenses: sql<string>`coalesce(sum(${schema.expenses.amount}), '0')`,
      })
      .from(schema.expenses)
      .where(expenseDateFilter);

    const totalRevenue = Number(revenueResult?.totalRevenue ?? 0);
    const totalExpenses = Number(expenseResult?.totalExpenses ?? 0);
    const profit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    // Top 10 products by revenue
    const topProducts = await db
      .select({
        productId: schema.sales.productId,
        productName: schema.products.name,
        category: schema.products.category,
        revenue: sql<string>`sum(${schema.sales.total})`,
        unitsSold: sql<number>`sum(${schema.sales.quantity})`,
      })
      .from(schema.sales)
      .innerJoin(
        schema.products,
        eq(schema.sales.productId, schema.products.id)
      )
      .where(dateFilter)
      .groupBy(schema.sales.productId, schema.products.name, schema.products.category)
      .orderBy(desc(sql`sum(${schema.sales.total})`))
      .limit(10);

    return {
      period,
      months,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      profitMargin: Math.round(margin * 100) / 100,
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        category: p.category,
        revenue: Number(p.revenue),
        unitsSold: Number(p.unitsSold),
      })),
    };
  },
});
