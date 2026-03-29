const localhostHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function normalizeOrigin(raw: string | undefined, allowLocalhost: boolean) {
  if (!raw) return undefined;

  try {
    const candidate = raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`;
    const parsed = new URL(candidate);

    if (!allowLocalhost && localhostHosts.has(parsed.hostname)) {
      return undefined;
    }

    return parsed.origin;
  } catch {
    return undefined;
  }
}

export function resolveAuthBaseUrl() {
  const isProduction = process.env.NODE_ENV === "production";
  const allowLocalhost = !isProduction;

  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const origin = normalizeOrigin(candidate, allowLocalhost);
    if (origin) {
      return origin;
    }
  }

  return allowLocalhost ? "http://localhost:3000" : undefined;
}

export function getAuthSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NEXTAUTH_SECRET) return process.env.NEXTAUTH_SECRET;

  const fallbackParts = [
    "clonnect-auth-fallback",
    process.env.DATABASE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.URL,
    process.env.VERCEL_URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.NODE_ENV,
  ].filter(Boolean);

  return fallbackParts.join("|");
}

export function applyAuthEnvironment() {
  const baseUrl = resolveAuthBaseUrl();
  const isProduction = process.env.NODE_ENV === "production";

  if (baseUrl) {
    process.env.AUTH_URL = baseUrl;
    process.env.NEXTAUTH_URL = baseUrl;
  } else if (isProduction) {
    if (!normalizeOrigin(process.env.AUTH_URL, false)) {
      delete process.env.AUTH_URL;
    }
    if (!normalizeOrigin(process.env.NEXTAUTH_URL, false)) {
      delete process.env.NEXTAUTH_URL;
    }
  }

  const secret = getAuthSecret();
  process.env.AUTH_SECRET = secret;
  process.env.NEXTAUTH_SECRET = secret;

  return { baseUrl, secret };
}
