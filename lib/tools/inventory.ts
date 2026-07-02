import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { eq, lt, and, like, sql } from "drizzle-orm";

export const checkInventory = tool({
  description:
    "Check current inventory levels, filter by category, warehouse, or low stock threshold",
  inputSchema: z.object({
    category: z.string().optional(),
    warehouse: z.string().optional(),
    lowStockOnly: z.boolean().optional(),
    page: z.number().optional().default(1),
    pageSize: z.number().optional().default(20),
  }),
  execute: async ({ category, warehouse, lowStockOnly, page = 1, pageSize = 20 }) => {
    const conditions = [];

    if (category) {
      conditions.push(eq(schema.products.category, category));
    }
    if (warehouse) {
      conditions.push(eq(schema.products.warehouseLocation, warehouse));
    }
    if (lowStockOnly) {
      conditions.push(
        lt(schema.products.stockQuantity, schema.products.reorderLevel)
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const offset = (page - 1) * pageSize;

    const [productsData, [{ count: total }]] = await Promise.all([
      db
        .select({
          id: schema.products.id,
          sku: schema.products.sku,
          name: schema.products.name,
          category: schema.products.category,
          stockQuantity: schema.products.stockQuantity,
          reorderLevel: schema.products.reorderLevel,
          reorderQuantity: schema.products.reorderQuantity,
          unitPrice: schema.products.unitPrice,
          warehouseLocation: schema.products.warehouseLocation,
          status: schema.products.status,
          supplierName: schema.suppliers.name,
        })
        .from(schema.products)
        .leftJoin(
          schema.suppliers,
          eq(schema.products.supplierId, schema.suppliers.id)
        )
        .where(where)
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.products)
        .where(where),
    ]);

    return {
      products: productsData,
      total: Number(total),
      page,
      pageSize,
    };
  },
});
