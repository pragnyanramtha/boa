import { db } from "./db";
import {
  suppliers,
  products,
  customers,
  sales,
  purchaseOrders,
  expenses,
  notifications,
  workflows,
} from "./schema";
import { faker } from "@faker-js/faker";

// ── Helpers ──────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return faker.number.int({ min, max });
}

function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function weightedPick<T>(items: readonly T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomPrice(min = 1.99, max = 99.99): string {
  return faker.commerce.price({ min, max, dec: 2 });
}

function padSku(n: number): string {
  return `SKU-${String(n).padStart(3, "0")}`;
}

function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

// ── Categories & Realistic Product Names ────────────────

const CATEGORIES = [
  "Grains & Pulses",
  "Beverages",
  "Fruits & Vegetables",
  "Dairy",
  "Snacks",
  "Cleaning Supplies",
  "Personal Care",
  "Meat & Seafood",
  "Frozen Foods",
  "Condiments",
] as const;

const PRODUCT_NAMES: Record<string, string[]> = {
  "Grains & Pulses": [
    "Organic Basmati Rice",
    "Whole Wheat Flour",
    "Red Lentils",
    "Chickpeas",
    "Quinoa",
    "Rolled Oats",
    "Jasmine Rice",
    "Black Beans",
    "Pearl Barley",
    "Couscous",
    "Brown Rice",
    "Green Split Peas",
    "Buckwheat Groats",
    "Bulgur Wheat",
    "Arborio Rice",
    "Mung Beans",
    "Puy Lentils",
    "Farro",
    "Amaranth",
    "White Corn Grits",
    "Soba Noodles",
    "Penne Rigate Pasta",
    "Spaghetti",
    "Fusilli",
    "Farfalle",
    "Rigatoni",
    "Linguine",
    "Orzo",
    "Israeli Couscous",
    "Wild Rice Blend",
    "Yellow Cornmeal",
    "Semolina Flour",
    "Chickpea Flour",
    "Rice Flour",
    "Almond Flour",
    "Coconut Flour",
    "Tortilla Wraps",
    "Rice Cakes",
    "Panko Breadcrumbs",
    "Rye Bread Loaf",
  ],
  Beverages: [
    "Cola Classic",
    "Orange Soda",
    "Root Beer",
    "Lemon Lime Soda",
    "Ginger Ale",
    "Green Tea",
    "Black Tea",
    "Earl Grey Tea",
    "Peppermint Tea",
    "Chamomile Tea",
    "Medium Roast Coffee",
    "Dark Roast Coffee",
    "Espresso Beans",
    "Cold Brew Concentrate",
    "Matcha Powder",
    "Apple Juice",
    "Orange Juice",
    "Cranberry Juice",
    "Grape Juice",
    "Pineapple Juice",
    "Coconut Water",
    "Sparkling Water",
    "Spring Water",
    "Tonic Water",
    "Club Soda",
    "Energy Drink",
    "Sports Drink",
    "Kombucha Original",
    "Iced Tea Lemon",
    "Lemonade",
    "Hot Chocolate Mix",
    "Chai Latte Mix",
    "Milk Tea",
    "Bubble Tea Kit",
    "Berry Smoothie Blend",
    "Horchata Mix",
    "Agua Fresca Mix",
    "Tomato Juice",
    "Vegetable Juice Blend",
    "Cucumber Seltzer",
  ],
  "Fruits & Vegetables": [
    "Red Apples",
    "Granny Smith Apples",
    "Organic Bananas",
    "Navel Oranges",
    "Seedless Red Grapes",
    "Fresh Strawberries",
    "Blueberries",
    "Raspberries",
    "Blackberries",
    "Fresh Pineapple",
    "Ripe Mangoes",
    "Hass Avocados",
    "Lemons",
    "Limes",
    "Watermelon",
    "Honeydew Melon",
    "Cantaloupe",
    "Yellow Peaches",
    "Red Plums",
    "Nectarines",
    "Sweet Cherries",
    "Bartlett Pears",
    "Green Kiwi",
    "Papaya",
    "Dragon Fruit",
    "Broccoli Crowns",
    "Cauliflower Head",
    "Romaine Lettuce",
    "Baby Spinach",
    "Kale Bunch",
    "Tomatoes on the Vine",
    "English Cucumber",
    "Bell Pepper Mix",
    "Baby Carrots",
    "Celery Bunch",
    "Red Onions",
    "Yellow Onions",
    "Russet Potatoes",
    "Sweet Potatoes",
    "Garlic Bulb",
  ],
  Dairy: [
    "Whole Milk Gallon",
    "2% Reduced Fat Milk",
    "Skim Milk",
    "Chocolate Milk",
    "Almond Milk Original",
    "Oat Milk Barista",
    "Soy Milk Vanilla",
    "Heavy Whipping Cream",
    "Half & Half",
    "Whipped Cream",
    "Unsalted Butter",
    "Salted Butter",
    "Plain Greek Yogurt",
    "Vanilla Greek Yogurt",
    "Strawberry Yogurt",
    "Cottage Cheese",
    "Sour Cream",
    "Cream Cheese Block",
    "Mascarpone",
    "Ricotta Cheese",
    "Sharp Cheddar Block",
    "Mild Cheddar",
    "Shredded Mozzarella",
    "Grated Parmesan",
    "Swiss Cheese Slices",
    "Provolone Slices",
    "Havarti Cheese",
    "Smoked Gouda",
    "Brie Wheel",
    "Blue Cheese Crumbles",
    "String Cheese",
    "Cheese Sticks",
    "Eggs Dozen",
    "Egg Whites",
    "Organic Eggs",
    "Buttermilk",
    "Condensed Milk",
    "Evaporated Milk",
    "Vanilla Coffee Creamer",
    "Vanilla Ice Cream",
  ],
  Snacks: [
    "Classic Potato Chips",
    "BBQ Potato Chips",
    "Sour Cream & Onion Chips",
    "Restaurant Style Tortilla Chips",
    "Pita Chips Sea Salt",
    "Pretzel Sticks",
    "Peanut Butter Pretzels",
    "Mixed Nuts",
    "Cashew Halves Roasted",
    "Roasted Almonds",
    "Trail Mix",
    "Chocolate Chip Granola Bars",
    "Peanut Butter Granola Bars",
    "Protein Chocolate Bars",
    "Fruit & Nut Bars",
    "Butter Popcorn",
    "Kettle Corn",
    "Cheese Puffs",
    "Rice Crispy Treats",
    "Chocolate Chip Cookies",
    "Oatmeal Raisin Cookies",
    "Fudge Brownie Bites",
    "Fruit Snacks",
    "Gummy Bears",
    "Milk Chocolate Bar",
    "Dark Chocolate Bar",
    "White Chocolate Bar",
    "Peanut Butter Cups",
    "Caramel Popcorn",
    "Beef Jerky Original",
    "Pork Cracklings",
    "Roasted Sunflower Seeds",
    "Pumpkin Seeds",
    "Saltine Crackers",
    "Rice Crackers",
    "Veggie Straws",
    "Baked Lentil Chips",
    "Roasted Seaweed Snacks",
    "Dried Mango Slices",
    "Medjool Dates",
  ],
  "Cleaning Supplies": [
    "Multi-Surface Cleaner",
    "Glass Cleaner Spray",
    "Bathroom Cleaner",
    "Kitchen Degreaser",
    "Floor Cleaner",
    "Laundry Detergent Liquid",
    "Laundry Pods",
    "Fabric Softener",
    "Stain Remover Spray",
    "Liquid Bleach",
    "Original Dish Soap",
    "Lemon Dish Soap",
    "Dishwasher Detergent",
    "Rinse Aid",
    "Dishwasher Pods",
    "All-Purpose Cleaning Wipes",
    "Disinfecting Wipes",
    "Sponge Pack",
    "Scrub Brush Set",
    "Microfiber Cloths",
    "Paper Towels 6-Pack",
    "Toilet Paper 12-Pack",
    "Facial Tissues",
    "Trash Bags",
    "Ziploc Storage Bags",
    "Aluminum Foil",
    "Plastic Wrap",
    "Parchment Paper",
    "Oven Cleaner",
    "Drain Cleaner",
    "Wood Furniture Cleaner",
    "Carpet Cleaner Spray",
    "Upholstery Cleaner",
    "Leather Conditioner",
    "Shoe Cleaner Kit",
    "Window Squeegee",
    "Dusting Spray",
    "Mop Refill Heads",
    "Vacuum Bags",
    "Air Freshener",
  ],
  "Personal Care": [
    "Moisturizing Body Wash",
    "Bar Soap",
    "Liquid Hand Soap",
    "Shampoo",
    "Conditioner",
    "Whitening Toothpaste",
    "Mouthwash",
    "Dental Floss",
    "Soft Toothbrush",
    "Electric Toothbrush Heads",
    "Deodorant Stick",
    "Deodorant Spray",
    "Antiperspirant",
    "Body Lotion",
    "Face Moisturizer",
    "Sunscreen SPF 30",
    "Sunscreen SPF 50",
    "Lip Balm",
    "Lipstick",
    "Mascara",
    "Eyeliner Pencil",
    "Eye Shadow Palette",
    "Liquid Foundation",
    "Concealer",
    "BB Cream",
    "Shaving Cream",
    "Razor Cartridge Pack",
    "Disposable Razors",
    "Aftershave Balm",
    "Hair Gel",
    "Hair Spray",
    "Styling Mousse",
    "Hair Wax",
    "Dry Shampoo",
    "Hair Mask Treatment",
    "Cotton Swabs",
    "Cotton Balls",
    "Facial Tissues",
    "Baby Wipes",
    "Hand Sanitizer",
  ],
  "Meat & Seafood": [
    "Boneless Chicken Breast",
    "Chicken Thighs",
    "Whole Roasting Chicken",
    "Chicken Wings",
    "Ground Chicken",
    "Sirloin Steak",
    "Ribeye Steak",
    "Ground Beef 80/20",
    "Ground Beef 90/10",
    "Beef Chuck Roast",
    "Pork Chops",
    "Pork Tenderloin",
    "Ground Pork",
    "Pork Shoulder",
    "Smoked Bacon",
    "Italian Sausage",
    "Bratwurst",
    "Chorizo Links",
    "Turkey Breast",
    "Ground Turkey",
    "Whole Turkey",
    "Turkey Bacon",
    "Lamb Chops",
    "Ground Lamb",
    "Lamb Roast",
    "Fresh Salmon Fillet",
    "Tilapia Fillet",
    "Cod Fillet",
    "Raw Shrimp",
    "Cooked Shrimp",
    "Tuna Steaks",
    "Canned Solid Tuna",
    "Canned Pink Salmon",
    "Frozen Fish Sticks",
    "Clam Chowder",
    "Lobster Tails",
    "Lump Crab Meat",
    "Sea Scallops",
    "Fresh Mussels",
    "Oysters",
  ],
  "Frozen Foods": [
    "Frozen Mixed Vegetables",
    "Frozen Broccoli Florents",
    "Frozen Chopped Spinach",
    "Frozen Corn",
    "Frozen Green Peas",
    "Crispy French Fries",
    "Tater Tots",
    "Hash Browns",
    "Sweet Potato Fries",
    "Onion Rings",
    "Frozen Cheese Pizza",
    "Frozen Pepperoni Pizza",
    "Frozen Variety Pizzas",
    "Frozen Beef Burritos",
    "Frozen Chicken Tacos",
    "Chicken Nuggets",
    "Chicken Tenders",
    "Frozen Fish Fillets",
    "Shrimp Tempura",
    "Frozen Waffles",
    "Frozen Pancakes",
    "Frozen French Toast",
    "Vanilla Ice Cream Pint",
    "Ice Cream Tub",
    "Frozen Yogurt",
    "Mango Sorbet",
    "Frozen Mixed Berries",
    "Frozen Mango Chunks",
    "Frozen Berry Blend",
    "Frozen Lasagna",
    "Frozen Chicken Meal",
    "Frozen Pasta Bowl",
    "TV Dinner Variety Pack",
    "Chicken Pot Pie",
    "Frozen Beef Pot Roast",
    "Frozen Soup",
    "Frozen Chicken Stock",
    "Frozen Pie Crust",
    "Frozen Cookie Dough",
    "Frozen Garlic Bread",
  ],
  Condiments: [
    "Classic Ketchup",
    "Yellow Mustard",
    "Dijon Mustard",
    "Whole Grain Mustard",
    "Real Mayonnaise",
    "Miracle Whip",
    "Original Barbecue Sauce",
    "Original Hot Sauce",
    "Sriracha",
    "Cholula Hot Sauce",
    "Soy Sauce",
    "Teriyaki Sauce",
    "Fish Sauce",
    "Worcestershire Sauce",
    "Oyster Sauce",
    "Extra Virgin Olive Oil",
    "Light Olive Oil",
    "Vegetable Oil",
    "Canola Oil",
    "Sesame Oil",
    "Virgin Coconut Oil",
    "Avocado Oil",
    "White Vinegar",
    "Apple Cider Vinegar",
    "Balsamic Vinegar",
    "Red Wine Vinegar",
    "Rice Vinegar",
    "Italian Dressing",
    "Ranch Dressing",
    "Caesar Dressing",
    "Thousand Island Dressing",
    "Blue Cheese Dressing",
    "Pure Honey",
    "Pure Maple Syrup",
    "Agave Nectar",
    "Creamy Peanut Butter",
    "Crunchy Peanut Butter",
    "Almond Butter",
    "Strawberry Jam",
    "Grape Jelly",
  ],
};

// ── Expense config ───────────────────────────────────────

const EXPENSE_CATEGORIES = [
  { category: "Rent", type: "operational", minAmt: 2000, maxAmt: 5000 },
  { category: "Utilities", type: "operational", minAmt: 200, maxAmt: 800 },
  { category: "Payroll", type: "payroll", minAmt: 5000, maxAmt: 15000 },
  { category: "Marketing", type: "marketing", minAmt: 500, maxAmt: 3000 },
  { category: "Supplies", type: "operational", minAmt: 100, maxAmt: 1000 },
  { category: "Maintenance", type: "operational", minAmt: 200, maxAmt: 2000 },
  { category: "Insurance", type: "operational", minAmt: 500, maxAmt: 2000 },
  { category: "Shipping", type: "operational", minAmt: 50, maxAmt: 500 },
] as const;

// ── Purchase-order status distribution ───────────────────

const PO_STATUSES = [
  ...Array<string>(40).fill("pending"),
  ...Array<string>(40).fill("approved"),
  ...Array<string>(40).fill("ordered"),
  ...Array<string>(60).fill("received"),
  ...Array<string>(20).fill("cancelled"),
];

// ── Notification templates ──────────────────────────────

const NOTIFICATION_TEMPLATES = [
  {
    title: "Low Stock Alert",
    message: (p: string) =>
      `Product "${p}" has fallen below its reorder level. Please initiate a purchase order.`,
    type: "stock_alert",
  },
  {
    title: "Stock Critical",
    message: (p: string) =>
      `URGENT: "${p}" stock is critically low at ${randInt(0, 5)} units. Immediate restock required.`,
    type: "stock_alert",
  },
  {
    title: "Order Shipped",
    message: () =>
      `Purchase order PO-${randInt(1000, 9999)} has been shipped and is in transit.`,
    type: "order_update",
  },
  {
    title: "Order Received",
    message: () =>
      `Purchase order PO-${randInt(1000, 9999)} has been received and inventory updated.`,
    type: "order_update",
  },
  {
    title: "Order Delayed",
    message: () =>
      `Purchase order PO-${randInt(1000, 9999)} is delayed. New ETA: ${faker.date
        .soon({ days: 7 })
        .toLocaleDateString()}.`,
    type: "order_update",
  },
  {
    title: "Inventory Audit Scheduled",
    message: () =>
      "A monthly inventory audit has been scheduled for next week. Please ensure all stock counts are up to date.",
    type: "system",
  },
  {
    title: "Supplier Performance Warning",
    message: (s: string) =>
      `Supplier "${s}" has a declining reliability score. Consider reviewing the supplier agreement.`,
    type: "system",
  },
  {
    title: "New Invoice Available",
    message: () =>
      `Invoice INV-${randInt(10000, 99999)} for ${randomPrice(500, 5000)} is now available for review.`,
    type: "system",
  },
  {
    title: "Product Expiry Alert",
    message: (p: string) =>
      `Products in category "${p}" are approaching their expiry date. Consider a discount promotion.`,
    type: "stock_alert",
  },
  {
    title: "System Maintenance",
    message: () =>
      "Scheduled system maintenance will occur on Saturday from 2:00 AM to 4:00 AM. The system will be unavailable during this time.",
    type: "system",
  },
];

// ── Workflow definitions ────────────────────────────────

const WORKFLOW_DEFS = [
  {
    name: "Monthly Inventory Audit",
    status: "active",
    steps: [
      { step: 1, action: "Review current inventory levels", assignee: "Inventory Manager", days: 2 },
      { step: 2, action: "Reconcile system counts with physical stock", assignee: "Warehouse Team", days: 3 },
      { step: 3, action: "Identify discrepancies and update records", assignee: "Inventory Manager", days: 2 },
      { step: 4, action: "Generate audit report", assignee: "Operations Lead", days: 1 },
      { step: 5, action: "Approve final adjustments", assignee: "Director of Operations", days: 2 },
    ],
  },
  {
    name: "Supplier Onboarding",
    status: "active",
    steps: [
      { step: 1, action: "Collect supplier documentation", assignee: "Procurement Specialist", days: 5 },
      { step: 2, action: "Verify business licenses and certifications", assignee: "Compliance Officer", days: 3 },
      { step: 3, action: "Negotiate terms and pricing", assignee: "Procurement Manager", days: 7 },
      { step: 4, action: "Set up supplier in system", assignee: "IT Support", days: 2 },
      { step: 5, action: "Place initial test order", assignee: "Procurement Specialist", days: 3 },
    ],
  },
  {
    name: "Customer Refund Processing",
    status: "active",
    steps: [
      { step: 1, action: "Verify refund request details", assignee: "Customer Service Rep", days: 1 },
      { step: 2, action: "Assess product return condition", assignee: "Quality Control", days: 2 },
      { step: 3, action: "Process refund payment", assignee: "Finance Team", days: 1 },
      { step: 4, action: "Update inventory if returned", assignee: "Warehouse Team", days: 1 },
      { step: 5, action: "Send confirmation to customer", assignee: "Customer Service Rep", days: 1 },
    ],
  },
  {
    name: "Quarterly Sales Review",
    status: "completed",
    steps: [
      { step: 1, action: "Compile sales data for the quarter", assignee: "Sales Analyst", days: 3 },
      { step: 2, action: "Analyze performance against targets", assignee: "Sales Manager", days: 2 },
      { step: 3, action: "Identify top/bottom performing products", assignee: "Sales Analyst", days: 2 },
      { step: 4, action: "Prepare presentation deck", assignee: "Sales Manager", days: 2 },
      { step: 5, action: "Present to executive team", assignee: "VP of Sales", days: 1 },
    ],
  },
  {
    name: "Warehouse Restock Plan",
    status: "active",
    steps: [
      { step: 1, action: "Identify low-stock items across warehouses", assignee: "Inventory Manager", days: 2 },
      { step: 2, action: "Prioritize restock by sales velocity", assignee: "Inventory Manager", days: 1 },
      { step: 3, action: "Generate purchase order requests", assignee: "Procurement Specialist", days: 2 },
      { step: 4, action: "Approve purchase orders", assignee: "Procurement Manager", days: 2 },
      { step: 5, action: "Schedule incoming deliveries", assignee: "Warehouse Coordinator", days: 3 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  // ── Clean existing data (reverse FK order) ──────────
  console.log("🧹 Clearing existing data…");
  await db.delete(sales);
  await db.delete(purchaseOrders);
  await db.delete(notifications);
  await db.delete(workflows);
  await db.delete(expenses);
  await db.delete(products);
  await db.delete(customers);
  await db.delete(suppliers);
  console.log("✅ Existing data cleared.\n");

  // ── 1. Suppliers ──────────────────────────────────
  console.log("📦 Seeding suppliers…");
  const supplierRows = Array.from({ length: 30 }, () => ({
    name: faker.company.name(),
    contactName: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    leadTimeDays: randInt(3, 30),
    reliabilityScore: (randInt(300, 500) / 100).toFixed(2),
  }));
  const insertedSuppliers = await db
    .insert(suppliers)
    .values(supplierRows)
    .returning();
  console.log(`   ✅ ${insertedSuppliers.length} suppliers inserted.\n`);

  // ── 2. Products ───────────────────────────────────
  console.log("📦 Seeding products…");
  const productRows = [];
  let skuCounter = 1;
  for (let i = 0; i < 990; i++) {
    const category = CATEGORIES[i % CATEGORIES.length];
    const namePool = PRODUCT_NAMES[category];
    const name = pick(namePool);
    const isDiscontinued = Math.random() < 0.05;
    productRows.push({
      sku: padSku(skuCounter++),
      name,
      category,
      stockQuantity: randInt(0, 500),
      reorderLevel: randInt(10, 50),
      reorderQuantity: randInt(20, 200),
      unitPrice: randomPrice(),
      supplierId: pick(insertedSuppliers).id,
      warehouseLocation: pick(["Warehouse A", "Warehouse B", "Warehouse C", "Warehouse D"]),
      salesVolume: randInt(0, 10000),
      inventoryTurnoverRate: (Math.random() * 11.5 + 0.5).toFixed(2),
      status: isDiscontinued ? "discontinued" : "active",
    });
  }
  const insertedProducts = await db
    .insert(products)
    .values(productRows)
    .returning();
  console.log(`   ✅ ${insertedProducts.length} products inserted.\n`);

  // ── 3. Customers ──────────────────────────────────
  console.log("👤 Seeding customers…");
  const usedEmails = new Set<string>();
  const customerRows = Array.from({ length: 200 }, () => {
    let email = faker.internet.email();
    while (usedEmails.has(email)) {
      email = faker.internet.email();
    }
    usedEmails.add(email);
    return {
      name: faker.person.fullName(),
      email,
      phone: faker.phone.number(),
      signupDate: faker.date.past({ years: 2 }),
      lifetimeValue: faker.commerce.price({ min: 0, max: 5000, dec: 2 }),
      segment: pick(["standard", "premium", "vip"]),
    };
  });
  const insertedCustomers = await db
    .insert(customers)
    .values(customerRows)
    .returning();
  console.log(`   ✅ ${insertedCustomers.length} customers inserted.\n`);

  // ── 4. Sales ──────────────────────────────────────
  console.log("💰 Seeding sales…");
  const oneYearAgo = monthsAgo(12);
  const saleRows = Array.from({ length: 5000 }, () => {
    const product = pick(insertedProducts);
    const customer = pick(insertedCustomers);
    const quantity = randInt(1, 20);
    const unitPrice = product.unitPrice;
    const total = (quantity * parseFloat(unitPrice)).toFixed(2);
    return {
      productId: product.id,
      customerId: customer.id,
      quantity,
      unitPrice,
      total,
      saleDate: faker.date.between({ from: oneYearAgo, to: new Date() }),
    };
  });
  const insertedSales = await db.insert(sales).values(saleRows).returning();
  console.log(`   ✅ ${insertedSales.length} sales inserted.\n`);

  // ── 5. Purchase Orders ────────────────────────────
  console.log("📋 Seeding purchase orders…");
  const poRows = Array.from({ length: 200 }, () => {
    const product = pick(insertedProducts);
    const supplier = pick(insertedSuppliers);
    const quantity = randInt(10, 500);
    const unitCost = (parseFloat(product.unitPrice) * 0.7).toFixed(2);
    const totalCost = (quantity * parseFloat(unitCost)).toFixed(2);
    const status = pick(PO_STATUSES);
    const orderDate = faker.date.between({ from: oneYearAgo, to: new Date() });
    const receivedDate =
      status === "received"
        ? faker.date.between({ from: orderDate, to: new Date() })
        : null;
    return {
      productId: product.id,
      supplierId: supplier.id,
      quantity,
      unitCost,
      totalCost,
      status,
      orderDate,
      receivedDate,
    };
  });
  await db.insert(purchaseOrders).values(poRows);
  console.log(`   ✅ 200 purchase orders inserted.\n`);

  // ── 6. Expenses ───────────────────────────────────
  console.log("💸 Seeding expenses…");
  const expenseRows = Array.from({ length: 300 }, () => {
    const cfg = pick(EXPENSE_CATEGORIES);
    const amount = randInt(cfg.minAmt, cfg.maxAmt).toFixed(2);
    return {
      category: cfg.category,
      amount,
      description: `${cfg.category} expense — ${faker.lorem.sentence({ min: 3, max: 8 })}`,
      expenseDate: faker.date.between({ from: oneYearAgo, to: new Date() }),
      type: cfg.type,
    };
  });
  // Spread them more evenly by month — shuffle after generation
  expenseRows.sort(() => Math.random() - 0.5);
  await db.insert(expenses).values(expenseRows);
  console.log(`   ✅ 300 expenses inserted.\n`);

  // ── 7. Notifications ──────────────────────────────
  console.log("🔔 Seeding notifications…");
  const notificationRows = Array.from({ length: 10 }, (_, i) => {
    const tmpl = pick(NOTIFICATION_TEMPLATES);
    const ctx = pick([
      pick(insertedProducts).name,
      pick(CATEGORIES),
      pick(insertedSuppliers).name,
    ]);
    const message = tmpl.message(ctx);
    return {
      title: tmpl.title,
      message,
      type: tmpl.type,
      read: i < 3 ? 1 : 0, // first 3 are read
    };
  });
  await db.insert(notifications).values(notificationRows);
  console.log(`   ✅ 10 notifications inserted.\n`);

  // ── 8. Workflows ──────────────────────────────────
  console.log("⚙️  Seeding workflows…");
  const workflowRows = WORKFLOW_DEFS.map((wf) => ({
    name: wf.name,
    steps: JSON.stringify(wf.steps),
    status: wf.status,
  }));
  await db.insert(workflows).values(workflowRows);
  console.log(`   ✅ 5 workflows inserted.\n`);

  // ── Done ──────────────────────────────────────────
  console.log("✅ Seed complete!");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
