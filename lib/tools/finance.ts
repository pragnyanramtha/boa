import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export const trackExpenses = tool({
  description:
    "Track and query business expenses by category and date range",
  inputSchema: z.object({
    category: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.number().optional().default(50),
  }),
  execute: async ({ category, startDate, endDate, limit = 50 }) => {
    const conditions = [];

    if (category) {
      conditions.push(eq(schema.expenses.category, category));
    }
    if (startDate) {
      conditions.push(gte(schema.expenses.expenseDate, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(schema.expenses.expenseDate, new Date(endDate)));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const expensesData = await db
      .select()
      .from(schema.expenses)
      .where(where)
      .orderBy(desc(schema.expenses.expenseDate))
      .limit(limit);

    // Summary per category
    const allExpenses = expensesData;
    const categoryMap: Record<string, { count: number; total: number }> = {};

    for (const exp of allExpenses) {
      if (!categoryMap[exp.category]) {
        categoryMap[exp.category] = { count: 0, total: 0 };
      }
      categoryMap[exp.category].count += 1;
      categoryMap[exp.category].total += Number(exp.amount);
    }

    const summary = Object.entries(categoryMap).map(([cat, stats]) => ({
      category: cat,
      count: stats.count,
      total: Math.round(stats.total * 100) / 100,
    }));

    return {
      expenses: expensesData.map((e) => ({
        id: e.id,
        category: e.category,
        amount: Number(e.amount),
        description: e.description,
        expenseDate: e.expenseDate,
        type: e.type,
      })),
      summary,
      totalExpenses: Math.round(
        allExpenses.reduce((acc, e) => acc + Number(e.amount), 0) * 100
      ) / 100,
    };
  },
});
