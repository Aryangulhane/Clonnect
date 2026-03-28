import { execSync } from "node:child_process";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Synchronously resolve a hostname to an IP address using Google DNS (8.8.8.8).
 * This works around broken local DNS resolvers (e.g. WSL/Hyper-V on Windows).
 */
function resolveHostSync(hostname: string): string {
  try {
    const output = execSync(
      `nslookup ${hostname} 8.8.8.8`,
      { encoding: "utf-8", timeout: 5000, windowsHide: true }
    );
    // Parse nslookup output - find IP addresses after "Addresses:" or "Address:"
    // Skip the first "Address:" which is the DNS server itself
    const lines = output.split("\n");
    let pastServer = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("Address") && !trimmed.includes("8.8.8.8")) {
        pastServer = true;
      }
      if (pastServer) {
        // Match IPv4 address
        const match = trimmed.match(/(\d+\.\d+\.\d+\.\d+)/);
        if (match) return match[1];
      }
    }
  } catch {
    // Fall through to return hostname
  }
  return hostname;
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const url = new URL(connectionString);
  const hostname = url.hostname;
  const resolvedHost = resolveHostSync(hostname);

  const pool = new Pool({
    host: resolvedHost,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    ssl: {
      rejectUnauthorized: true,
      servername: hostname,  // Neon uses SNI for connection routing
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaPg(pool as any);
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
