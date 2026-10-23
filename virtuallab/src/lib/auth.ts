import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (user.status !== "ACTIVE") {
          throw new Error("User account is not active");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      // Feature #67: Audit LOGIN event
      try {
        await prisma.auditLog.create({
          data: {
            userId: (user as any).id || null,
            action: 'LOGIN',
            entity: 'User',
            entityId: (user as any).id || null,
            metadata: JSON.stringify({ email: user.email }),
          },
        });
      } catch (e) {
        console.error('Failed to log LOGIN audit:', e);
      }
    },
    async signOut({ token }) {
      // Feature #67: Audit LOGOUT event
      try {
        await prisma.auditLog.create({
          data: {
            userId: (token as any)?.id || null,
            action: 'LOGOUT',
            entity: 'User',
            entityId: (token as any)?.id || null,
          },
        });
      } catch (e) {
        console.error('Failed to log LOGOUT audit:', e);
      }
    },
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  }
};
