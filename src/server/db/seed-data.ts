import { demoOrders } from "@/server/demo-data/orders";

export const seedUsers = [
  {
    fullName: "Nina Alvarez",
    email: "nina.alvarez@opsflow.ai",
    team: "operations",
  },
  {
    fullName: "Marcus Reid",
    email: "marcus.reid@opsflow.ai",
    team: "support",
  },
];

export const seedCustomers = demoOrders.map((order) => ({
  externalCustomerId: order.customer.id,
  name: order.customer.name,
  email: order.customer.email,
  segment: order.customer.segment,
  region: order.customer.region,
}));
