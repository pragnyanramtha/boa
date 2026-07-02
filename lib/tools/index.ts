import { checkInventory } from "./inventory";
import { forecastDemand } from "./procurement";
import { analyzeProfitability } from "./analytics";
import { trackExpenses } from "./finance";
import { evaluateSupplier } from "./supplier";
import { analyzeSales } from "./sales";
import { segmentCustomers } from "./customer";
import { sendNotification } from "./notification";
import { createWorkflow } from "./workflow";

export const tools = {
  checkInventory,
  forecastDemand,
  analyzeProfitability,
  trackExpenses,
  evaluateSupplier,
  analyzeSales,
  segmentCustomers,
  sendNotification,
  createWorkflow,
};
