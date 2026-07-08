import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/datasource';
import { DepartmentType, SubUnitType } from '@/types';
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.getUser(credentials.email);

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: Number(user.id),
          email: user.email,
          name: user.name,
          role: user.role as 'employee' | 'supervisor',
          department: user.department as DepartmentType,
          subUnit: user.subUnit as SubUnitType | undefined,
        };
      }
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as number;
        token.role = user.role as 'employee' | 'supervisor';
        token.name = user.name;
        token.email = user.email;
        token.department = user.department as DepartmentType;
        token.subUnit = user.subUnit as SubUnitType | undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as number;
        session.user.role = token.role as 'employee' | 'supervisor';
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.department = token.department as DepartmentType;
        session.user.subUnit = token.subUnit as SubUnitType | undefined;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 60,  //session expires after 30 mins
    updateAge: 5 * 60,  //refresh the session expiry every 5 minutes if the user is active
  },

  secret: process.env.NEXTAUTH_SECRET || 'demo-secret-key-for-development',
};