import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export const createWorkflow = tool({
  description: "Create or list approval workflows",
  inputSchema: z.object({
    action: z.enum(["list", "create"]),
    status: z.string().optional(),
    name: z.string().optional(),
    steps: z.string().optional(),
  }),
  execute: async ({ action, status, name, steps }) => {
    if (action === "list") {
      const conditions = [];
      if (status) {
        conditions.push(eq(schema.workflows.status, status));
      }

      const workflows = await db
        .select()
        .from(schema.workflows)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(schema.workflows.createdAt));

      return {
        workflows: workflows.map((w) => ({
          id: w.id,
          name: w.name,
          steps: w.steps,
          status: w.status,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        })),
        total: workflows.length,
      };
    }

    // Create action
    if (!name || !steps) {
      throw new Error("Name and steps are required to create a workflow");
    }

    // Validate steps is valid JSON
    try {
      JSON.parse(steps);
    } catch {
      throw new Error("Steps must be a valid JSON string");
    }

    const [created] = await db
      .insert(schema.workflows)
      .values({
        name,
        steps,
        status: "active",
      })
      .returning();

    return {
      workflow: {
        id: created.id,
        name: created.name,
        steps: created.steps,
        status: created.status,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    };
  },
});
