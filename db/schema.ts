import {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Suppliers ──────────────────────────────────────────
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  leadTimeDays: integer("lead_time_days").default(7),
  reliabilityScore: numeric("reliability_score", { precision: 3, scale: 2 }).default("5.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Products ───────────────────────────────────────────
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 50 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  reorderLevel: integer("reorder_level").notNull().default(10),
  reorderQuantity: integer("reorder_quantity").notNull().default(50),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  warehouseLocation: varchar("warehouse_location", { length: 100 }),
  salesVolume: integer("sales_volume").default(0),
  inventoryTurnoverRate: numeric("inventory_turnover_rate", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Customers ──────────────────────────────────────────
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  signupDate: timestamp("signup_date").defaultNow(),
  lifetimeValue: numeric("lifetime_value", { precision: 10, scale: 2 }).default("0"),
  segment: varchar("segment", { length: 50 }).default("standard"),
});

// ── Sales ──────────────────────────────────────────────
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  customerId: integer("customer_id").references(() => customers.id),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  saleDate: timestamp("sale_date").defaultNow(),
});

// ── Purchase Orders ────────────────────────────────────
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  supplierId: integer("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  quantity: integer("quantity").notNull(),
  unitCost: numeric("unit_cost", { precision: 10, scale: 2 }).notNull(),
  totalCost: numeric("total_cost", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  orderDate: timestamp("order_date").defaultNow(),
  receivedDate: timestamp("received_date"),
});

// ── Expenses ───────────────────────────────────────────
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  expenseDate: timestamp("expense_date").defaultNow(),
  type: varchar("type", { length: 50 }).default("operational"),
});

// ── Notifications ──────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("info"),
  read: integer("read").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Workflows ──────────────────────────────────────────
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  steps: text("steps").notNull(), // JSON array of steps
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Relations ──────────────────────────────────────────
export const productsRelations = relations(products, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  sales: many(sales),
  purchaseOrders: many(purchaseOrders),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
  purchaseOrders: many(purchaseOrders),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  sales: many(sales),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  product: one(products, {
    fields: [sales.productId],
    references: [products.id],
  }),
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one }) => ({
  product: one(products, {
    fields: [purchaseOrders.productId],
    references: [products.id],
  }),
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
}));
