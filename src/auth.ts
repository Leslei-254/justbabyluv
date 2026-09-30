import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { auditEvent, AUDIT_EVENT_TYPES } from "@/lib/audit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) {
          await auditEvent({ eventType: AUDIT_EVENT_TYPES.AUTH_FAILURE, metadata: { method: "credentials", reason: "missing_credentials" } });
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, email.toLowerCase().trim()),
        });
        if (!user) {
          await auditEvent({ eventType: AUDIT_EVENT_TYPES.AUTH_FAILURE, metadata: { method: "credentials", reason: "invalid_credentials" } });
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          await auditEvent({ eventType: AUDIT_EVENT_TYPES.AUTH_FAILURE, userId: user.id, metadata: { method: "credentials", reason: "invalid_credentials" } });
          return null;
        }

        await auditEvent({ eventType: AUDIT_EVENT_TYPES.AUTH_SUCCESS, userId: user.id, metadata: { method: "credentials" } });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
