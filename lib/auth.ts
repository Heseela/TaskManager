import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/datasource';
import { Console } from 'console';

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

console.log("SQL RESULT:", user);
        if (user && user.password === credentials.password) {
           const authUser = {
              id: user.ID.toString(),
              email: user.email,
              name: user.username,
              role: user.Role,
              unit: user.unit,
              department :user.Department
            };

            console.log("AUTH USER:", authUser);

            return authUser;
        }
        
        return null;
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT input user ", user);
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.unit = user.unit;
        token.department = user.department;
      }
      console.log("JWT toek", token);
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.unit = token.unit as string;
        session.user.department = token.department as string;
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