import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "[Clonnect] DATABASE_URL is not configured.\n" +
      "Add it to your .env file or Vercel environment variables.\n" +
      "Get it from: https://console.neon.tech → your project → Connection Details"
    );
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  });
}

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
