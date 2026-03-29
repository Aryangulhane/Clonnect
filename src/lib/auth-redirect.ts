const localhostHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

export function getSafeCallbackPath(raw: string | null | undefined, fallback = "/feed") {
  if (!raw) return fallback;

  if (raw.startsWith("/")) {
    return raw;
  }

  try {
    const parsed = new URL(raw);
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return path.startsWith("/") ? path : fallback;
  } catch {
    return fallback;
  }
}

export function getPreferredBaseUrl(fallback: string) {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      const parsed = new URL(candidate);
      if (!localhostHosts.has(parsed.hostname)) {
        return parsed.origin;
      }
    } catch {
      continue;
    }
  }

  try {
    const parsedFallback = new URL(fallback);
    if (!localhostHosts.has(parsedFallback.hostname)) {
      return parsedFallback.origin;
    }
  } catch {
    // Ignore parse failures and return the original fallback.
  }

  return fallback;
}
