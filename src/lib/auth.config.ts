import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-compatible auth config — NO Prisma imports.
 * Used by middleware.ts for route protection.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials provider declared here for shape, actual authorize logic is in auth.ts
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // NOTE: This authorize stub is intentional — the real authorize()
      // lives in src/lib/auth.ts. This file is edge-compatible (no Prisma).
      authorize: () => null,
    }),
  ],
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
  },
  session: { strategy: "jwt" },
};
