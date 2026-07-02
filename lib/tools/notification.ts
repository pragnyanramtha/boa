import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export const sendNotification = tool({
  description: "Create or list system notifications",
  inputSchema: z.object({
    action: z.enum(["list", "create"]),
    type: z.string().optional(),
    limit: z.number().optional().default(20),
    title: z.string().optional(),
    message: z.string().optional(),
  }),
  execute: async ({ action, type, limit = 20, title, message }) => {
    if (action === "list") {
      const conditions = [];
      if (type) {
        conditions.push(eq(schema.notifications.type, type));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const notifications = await db
        .select()
        .from(schema.notifications)
        .where(where)
        .orderBy(
          desc(schema.notifications.read),
          desc(schema.notifications.createdAt)
        )
        .limit(limit);

      const unreadCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.notifications)
        .where(eq(schema.notifications.read, 0));

      return {
        notifications: notifications.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          read: n.read,
          createdAt: n.createdAt,
        })),
        unreadCount: Number(unreadCount[0]?.count ?? 0),
      };
    }

    // Create action
    if (!title || !message) {
      throw new Error("Title and message are required to create a notification");
    }

    const [created] = await db
      .insert(schema.notifications)
      .values({
        title,
        message,
        type: type ?? "info",
      })
      .returning();

    return {
      notification: {
        id: created.id,
        title: created.title,
        message: created.message,
        type: created.type,
        read: created.read,
        createdAt: created.createdAt,
      },
    };
  },
});
