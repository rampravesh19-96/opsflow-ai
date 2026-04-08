import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

import { getEnv } from "./src/server/env";

dotenv.config({ path: ".env.local", override: false, quiet: true });
dotenv.config({ path: ".env", override: false, quiet: true });

const env = getEnv();

export default {
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.databaseUrl,
  },
  strict: true,
} satisfies Config;
