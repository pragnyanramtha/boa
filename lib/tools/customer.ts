import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";

export const segmentCustomers = tool({
  description:
    "Segment customers by value, activity, and demographics",
  inputSchema: z.object({
    segment: z.string().optional(),
    minValue: z.number().optional(),
    limit: z.number().optional().default(50),
  }),
  execute: async ({ segment, minValue, limit = 50 }) => {
    const conditions = [];

    if (segment) {
      conditions.push(eq(schema.customers.segment, segment));
    }
    if (minValue !== undefined) {
      conditions.push(
        gte(schema.customers.lifetimeValue, String(minValue))
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const customersData = await db
      .select({
        id: schema.customers.id,
        name: schema.customers.name,
        email: schema.customers.email,
        phone: schema.customers.phone,
        signupDate: schema.customers.signupDate,
        lifetimeValue: schema.customers.lifetimeValue,
        segment: schema.customers.segment,
        orderCount: sql<number>`coalesce(count(${schema.sales.id}), 0)`,
      })
      .from(schema.customers)
      .leftJoin(
        schema.sales,
        eq(schema.customers.id, schema.sales.customerId)
      )
      .where(where)
      .groupBy(
        schema.customers.id,
        schema.customers.name,
        schema.customers.email,
        schema.customers.phone,
        schema.customers.signupDate,
        schema.customers.lifetimeValue,
        schema.customers.segment
      )
      .orderBy(desc(schema.customers.lifetimeValue))
      .limit(limit);

    // Segment summary
    const segmentSummary = await db
      .select({
        segment: schema.customers.segment,
        count: sql<number>`count(*)`,
        avgValue: sql<string>`avg(${schema.customers.lifetimeValue})`,
        totalValue: sql<string>`sum(${schema.customers.lifetimeValue})`,
      })
      .from(schema.customers)
      .groupBy(schema.customers.segment);

    return {
      segmentSummary: segmentSummary.map((s) => ({
        segment: s.segment,
        count: Number(s.count),
        avgValue: Math.round(Number(s.avgValue) * 100) / 100,
        totalValue: Math.round(Number(s.totalValue) * 100) / 100,
      })),
      topCustomers: customersData.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        signupDate: c.signupDate,
        lifetimeValue: Number(c.lifetimeValue),
        segment: c.segment,
        orderCount: Number(c.orderCount),
      })),
    };
  },
});
