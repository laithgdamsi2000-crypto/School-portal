import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

/**
 * Admin authentication config.
 *
 * Deliberately uses NextAuth's Credentials provider (email + password)
 * rather than a hand-rolled session system:
 *  - Session cookies are HttpOnly + SameSite=Lax by default (mitigates
 *    XSS-based session theft and basic CSRF).
 *  - JWT session strategy means no session table to manage for a single
 *    admin, but this same config file is where Teacher/Parent/Student
 *    login gets added later — just more providers or a role field on
 *    the existing provider's `authorize` callback.
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours — admin sessions expire, must re-login
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!admin || !admin.isActive) {
          // Same generic failure path as a wrong password below —
          // never reveal whether the email exists or is deactivated.
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          admin.passwordHash
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

/** Helper to hash a password when creating/resetting the admin account. */
export async function hashPassword(plain: string): Promise<string> {
  const SALT_ROUNDS = 12;
  return bcrypt.hash(plain, SALT_ROUNDS);
}
