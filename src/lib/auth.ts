import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrismaClient, prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";
import { applyAuthEnvironment, getAuthSecret } from "@/lib/auth-env";

applyAuthEnvironment();

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Pass the REAL PrismaClient, not the Proxy — PrismaAdapter needs direct access
  secret: getAuthSecret(),
  adapter: PrismaAdapter(getPrismaClient()),
  // Credentials provider does NOT support database sessions — must use JWT
  session: { strategy: "jwt" },
  providers: [
    // Google is already declared in authConfig — only override Credentials here
    // because the real authorize() needs Prisma (not edge-compatible)
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
          });

          if (!user || !user.passwordHash) return null;

          const isValid = await bcrypt.compare(
            parsed.data.password,
            user.passwordHash
          );

          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("Credentials authorize error:", error);
          return null;
        }
      },
    }),
  ],
  logger: {
    error(error) {
      console.error("[Auth.js]", error);
    },
    warn(code) {
      console.warn("[Auth.js]", code);
    },
  },
});
