export function getEnv() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is missing. Add it to .env.local or .env before running OpsFlow AI.",
    );
  }

  return {
    appUrl: process.env.APP_URL,
    databaseUrl,
    databaseSslMode: process.env.DATABASE_SSL === "require" ? "require" : "disable",
    nodeEnv: process.env.NODE_ENV ?? "development",
  } as const;
}
