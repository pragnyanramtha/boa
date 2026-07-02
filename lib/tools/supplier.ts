import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export const evaluateSupplier = tool({
  description:
    "Evaluate supplier performance, reliability, and lead times",
  inputSchema: z.object({
    supplierId: z.number().optional(),
    minReliability: z.number().optional(),
  }),
  execute: async ({ supplierId, minReliability }) => {
    const conditions = [];

    if (supplierId) {
      conditions.push(eq(schema.suppliers.id, supplierId));
    }
    if (minReliability !== undefined) {
      conditions.push(
        gte(schema.suppliers.reliabilityScore, String(minReliability))
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const suppliersData = await db
      .select({
        id: schema.suppliers.id,
        name: schema.suppliers.name,
        contactName: schema.suppliers.contactName,
        email: schema.suppliers.email,
        phone: schema.suppliers.phone,
        leadTimeDays: schema.suppliers.leadTimeDays,
        reliabilityScore: schema.suppliers.reliabilityScore,
      })
      .from(schema.suppliers)
      .where(where);

    // For each supplier, fetch order stats
    const result = await Promise.all(
      suppliersData.map(async (supplier) => {
        const [orderStats] = await db
          .select({
            totalOrders: sql<number>`count(*)`,
            receivedOrders: sql<number>`sum(case when ${schema.purchaseOrders.status} = 'received' then 1 else 0 end)`,
          })
          .from(schema.purchaseOrders)
          .where(eq(schema.purchaseOrders.supplierId, supplier.id));

        return {
          id: supplier.id,
          name: supplier.name,
          contactName: supplier.contactName,
          email: supplier.email,
          phone: supplier.phone,
          leadTimeDays: supplier.leadTimeDays,
          reliabilityScore: Number(supplier.reliabilityScore),
          totalOrders: Number(orderStats?.totalOrders ?? 0),
          receivedOrders: Number(orderStats?.receivedOrders ?? 0),
          fulfillmentRate:
            Number(orderStats?.totalOrders ?? 0) > 0
              ? Math.round(
                  (Number(orderStats?.receivedOrders ?? 0) /
                    Number(orderStats?.totalOrders ?? 0)) *
                    100 *
                    100
                ) / 100
              : 0,
        };
      })
    );

    return {
      suppliers: result,
      totalSuppliers: result.length,
    };
  },
});
