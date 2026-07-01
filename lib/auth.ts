import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/datasource';
import { DepartmentType, SubUnitType } from '@/types';

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

        if (user && user.password === credentials.password) {
           const authUser = {
              id: Number(user.id),
              email: user.email,
              name: user.name,
              role: user.role as 'employee' | 'supervisor',
              department: user.department as DepartmentType,
              subUnit: user.subUnit as SubUnitType | undefined,
            };
            return authUser;
        }
        
        return null;
      },
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
  },
  secret: process.env.NEXTAUTH_SECRET || 'demo-secret-key-for-development',
};