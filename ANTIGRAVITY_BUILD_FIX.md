# Antigravity Prompt — Fix Vercel Build Errors
> Paste this entire block into Antigravity. It contains the root cause analysis and all fixes needed.

---

## Context

This is a Next.js 16.1.6 + Prisma 7.5.0 + TypeScript 5 project called Clonnect.
The Vercel production build is failing. Fix ALL issues described below — do not fix only the first one, as others will cascade.

---

## PROBLEM 1 — CRITICAL (current build failure)

**Error:**
```
./prisma/seed.ts:1:10
Type error: Module '"@prisma/client"' has no exported member 'PostType'.
```

**Root cause:** Prisma 7 removed direct named enum exports from `@prisma/client`. `PostType` and `NotificationType` can no longer be imported as named exports.

**File to fix:** `prisma/seed.ts`

Change line 1 from:
```typescript
import { PrismaClient, PostType, NotificationType } from "@prisma/client";
```

To:
```typescript
import { PrismaClient, $Enums } from "@prisma/client";
```

Then replace every usage of the bare enum throughout the file:

| Old | New |
|-----|-----|
| `PostType.HELP_REQUEST` | `$Enums.PostType.HELP_REQUEST` |
| `PostType.RESOURCE` | `$Enums.PostType.RESOURCE` |
| `PostType.GENERAL` | `$Enums.PostType.GENERAL` |
| `NotificationType.FOLLOW` | `$Enums.NotificationType.FOLLOW` |

The full corrected seed.ts import and usage:
```typescript
import { PrismaClient, $Enums } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ... (keep all existing seeding logic, just swap enum references)
  
  const postData = [
    { type: $Enums.PostType.HELP_REQUEST, title: "Need help with React Server Components", ... },
    { type: $Enums.PostType.RESOURCE, title: "Complete Machine Learning Roadmap 2026", ... },
    { type: $Enums.PostType.GENERAL, title: "Just deployed my first full-stack app! 🚀", ... },
    // etc — replace ALL PostType.X with $Enums.PostType.X
  ];

  // For notifications:
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: $Enums.NotificationType.FOLLOW,  // ← change this
      message: `...`,
      isRead: false,
    },
  });
}
```

---

## PROBLEM 2 — CRITICAL (will fail after Problem 1 is fixed)

**Root cause:** `tsconfig.json` uses `"**/*.ts"` in the `include` array, which pulls `prisma/seed.ts` into the Next.js TypeScript compilation. Next.js 16 type-checks ALL included files even with `ignoreBuildErrors: true`.

**File to fix:** `tsconfig.json`

Add `"prisma"` to the `exclude` array:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": [
    "node_modules",
    "prisma"
  ]
}
```

This prevents seed.ts, migrations, and prisma config files from being type-checked by Next.js build.

---

## PROBLEM 3 — CRITICAL (Middleware deprecated in Next.js 16)

**Warning shown in build log:**
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**Root cause:** Next.js 16 renamed `middleware.ts` to `proxy.ts`. The old file still works but will become a hard error in future versions.

**Action:** Rename `src/middleware.ts` → `src/proxy.ts`

The file content stays exactly the same:
```typescript
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
```

---

## PROBLEM 4 — CRITICAL (Prisma 7 datasource missing url)

**Root cause:** `prisma/schema.prisma` has no `url` field in the datasource block. Prisma 7 requires it explicitly — it will not infer from environment.

**File to fix:** `prisma/schema.prisma`

Find:
```prisma
datasource db {
  provider = "postgresql"
}
```

Replace with:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Note: `DIRECT_URL` is the non-pooled Neon connection string needed for migrations. Both must be set in Vercel environment variables.

---

## PROBLEM 5 — MODERATE (Prisma 7 client generation in next.config.ts)

**Root cause:** `next.config.ts` has `ignoreBuildErrors: true` but does NOT have the Prisma output path configured. In Prisma 7 on Vercel, the client sometimes generates to a different location. Add explicit output to schema.

**File to fix:** `prisma/schema.prisma`

Change the generator block from:
```prisma
generator client {
  provider = "prisma-client-js"
}
```

To:
```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../node_modules/.prisma/client"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```

The `rhel-openssl-3.0.x` binary target is required for Vercel's Linux runtime environment.

---

## PROBLEM 6 — MODERATE (src/lib/prisma.ts uses broken Neon adapter)

**Root cause:** The current `src/lib/prisma.ts` uses `PrismaNeon` from `@prisma/adapter-neon` with a WebSocket constructor that breaks in Next.js 15+ App Router because it uses `require('ws')` synchronously inside an async context. Vercel's serverless functions also don't support this pattern.

**File to fix:** `src/lib/prisma.ts`

Replace the entire file with:
```typescript
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
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
```

This works with Neon via the standard PostgreSQL connection string — Prisma 7 handles Neon's serverless PostgreSQL natively without needing the adapter.

---

## PROBLEM 7 — MODERATE (Missing NextAuth type augmentation causes TS errors)

**Root cause:** Throughout the codebase, `session.user.id` is accessed but `DefaultSession` from next-auth only has `name`, `email`, `image` — not `id`. This will cause TypeScript errors in strict mode.

**File to create:** `src/types/next-auth.d.ts`

```typescript
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    id?: string;
  }
}
```

---

## PROBLEM 8 — LOW (Zod v4 compatibility in API routes)

**Root cause:** The project uses `zod: "^4.3.6"` (Zod v4). In Zod v4, the `.safeParse()` return type and some schema methods changed. The `z.object` usage in register route uses patterns that need verification.

**File to check:** `src/app/api/auth/register/route.ts`

The current schema uses `z.string().optional()` which works in Zod v4. However the `.flatten()` method on ZodError changed. Update the error response:

```typescript
// Change this:
return NextResponse.json(
  { error: "Invalid input", details: parsed.error.flatten() },
  { status: 400 }
);

// To this (Zod v4 compatible):
return NextResponse.json(
  { error: "Invalid input", details: parsed.error.format() },
  { status: 400 }
);
```

Apply the same change in `src/app/api/posts/route.ts`.

---

## VERCEL ENVIRONMENT VARIABLES CHECKLIST

Make sure ALL of these are set in Vercel Dashboard → Project → Settings → Environment Variables:

```
DATABASE_URL         = postgresql://...pooler...neon.tech/neondb?sslmode=require
DIRECT_URL           = postgresql://...neon.tech/neondb?sslmode=require
AUTH_SECRET          = (generate with: openssl rand -base64 32)
NEXTAUTH_URL         = https://your-vercel-app.vercel.app
GOOGLE_CLIENT_ID     = (from Google Cloud Console)
GOOGLE_CLIENT_SECRET = (from Google Cloud Console)
PUSHER_APP_ID        = (optional, for real-time)
PUSHER_KEY           = (optional)
PUSHER_SECRET        = (optional)
PUSHER_CLUSTER       = (optional)
NEXT_PUBLIC_PUSHER_KEY     = (optional)
NEXT_PUBLIC_PUSHER_CLUSTER = (optional)
UPLOADTHING_TOKEN    = (optional, for file uploads)
```

`NEXTAUTH_URL` must be your actual Vercel domain — not localhost — for OAuth redirects to work in production.

---

## GOOGLE OAUTH REDIRECT URI

In Google Cloud Console → Credentials → your OAuth app, add this to Authorized Redirect URIs:
```
https://your-vercel-app.vercel.app/api/auth/callback/google
```

---

## EXECUTION ORDER

Fix in this exact order:

1. Fix `prisma/schema.prisma` (add url + directUrl + binaryTargets)
2. Fix `prisma/seed.ts` (swap enum imports to `$Enums`)
3. Fix `tsconfig.json` (exclude prisma directory)
4. Rename `src/middleware.ts` → `src/proxy.ts`
5. Replace `src/lib/prisma.ts` (remove Neon adapter)
6. Create `src/types/next-auth.d.ts`
7. Fix Zod `.flatten()` → `.format()` in register + posts routes
8. Commit and push → Vercel will auto-redeploy

---

## POST-DEPLOY VERIFICATION

After successful deploy, run in Vercel terminal or locally against production DB:
```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

Then test:
- `/` → landing page loads with 3D globe
- `/auth/login` → login with `arjun@clonnect.dev` / `password123`
- `/feed` → posts load from database
- `/discover` → search works
