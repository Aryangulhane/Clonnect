import type { NextAuthConfig } from "next-auth";
import { applyAuthEnvironment, getAuthSecret } from "@/lib/auth-env";
import { getPreferredBaseUrl, getSafeCallbackPath } from "@/lib/auth-redirect";

applyAuthEnvironment();

/**
 * Edge-compatible auth config — NO Prisma imports.
 * Used by middleware.ts for route protection.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: getAuthSecret(),
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
    error: "/auth/login",
  },
      // NOTE: This authorize stub is intentional — the real authorize()
  providers: [],
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedRoutes = ["/feed", "/profile", "/discover", "/knowledge", "/notifications", "/post"];
      const authRoutes = ["/auth/login", "/auth/register"];

      const isProtected = protectedRoutes.some((r) => nextUrl.pathname.startsWith(r));
      const isAuthRoute = authRoutes.some((r) => nextUrl.pathname.startsWith(r));

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/feed", nextUrl));
      }
      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL("/auth/login", nextUrl);
        redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(redirectUrl);
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub && session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      const preferredBaseUrl = getPreferredBaseUrl(baseUrl);
      const safePath = getSafeCallbackPath(url, "/feed");
      return new URL(safePath, preferredBaseUrl).toString();
    },
  },
  session: { strategy: "jwt" },
};
