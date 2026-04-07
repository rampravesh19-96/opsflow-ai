import { demoOrders } from "../src/server/demo-data/orders";
import { seedCustomers, seedUsers } from "../src/server/db/seed-data";

async function main() {
  console.log("OpsFlow AI seed foundation");
  console.log(`Users prepared: ${seedUsers.length}`);
  console.log(`Customers prepared: ${seedCustomers.length}`);
  console.log(`Orders prepared: ${demoOrders.length}`);
  console.log(
    "Milestone 1 ships the seed contract and demo fixtures. Database inserts will be wired in a later milestone once write flows are implemented.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
