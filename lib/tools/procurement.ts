import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { eq, and, gte, avg, sum, sql } from "drizzle-orm";

export const forecastDemand = tool({
  description:
    "Analyze sales history to forecast demand for a specific product category",
  inputSchema: z.object({
    category: z.string().optional(),
    months: z.number().optional().default(3),
  }),
  execute: async ({ category, months = 3 }) => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startDateStr = startDate.toISOString();

    const conditions = [gte(schema.sales.saleDate, new Date(startDateStr))];

    if (category) {
      conditions.push(eq(schema.products.category, category));
    }

    const where = and(...conditions);

    const salesData = await db
      .select({
        productId: schema.sales.productId,
        productName: schema.products.name,
        productCategory: schema.products.category,
        stockQuantity: schema.products.stockQuantity,
        reorderLevel: schema.products.reorderLevel,
        totalSold: sql<number>`sum(${schema.sales.quantity})`,
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
        schema.products.category,
        schema.products.stockQuantity,
        schema.products.reorderLevel
      );

    const result = salesData.map((item) => {
      const avgMonthlySales = Number(item.totalSold) / months;
      const stock = item.stockQuantity;
      const needsReorder = avgMonthlySales > stock * 0.5;

      return {
        productId: item.productId,
        productName: item.productName,
        category: item.productCategory,
        currentStock: stock,
        reorderLevel: item.reorderLevel,
        avgMonthlySales: Math.round(avgMonthlySales * 100) / 100,
        recommendation: needsReorder
          ? "Reorder recommended - average monthly sales may exceed 50% of current stock"
          : "Stock level adequate",
      };
    });

    return {
      forecastPeriod: `${months} months`,
      category: category ?? "all categories",
      products: result,
    };
  },
});
