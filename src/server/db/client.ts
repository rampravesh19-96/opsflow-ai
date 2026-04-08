import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getEnv } from "@/server/env";

let pool: Pool | undefined;

export function getDb() {
  const env = getEnv();

  pool ??= new Pool({
    connectionString: env.databaseUrl,
    ssl:
      env.databaseSslMode === "require"
        ? {
            rejectUnauthorized: false,
          }
        : false,
    max: env.nodeEnv === "production" ? 10 : 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  return drizzle(pool);
}
