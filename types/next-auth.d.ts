import NextAuth, { DefaultSession } from 'next-auth';
import { DepartmentType, SubUnitType } from './index';

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      role: 'employee' | 'supervisor';
      name?: string;
      email?: string;
      department?: DepartmentType;
      subUnit?: SubUnitType;
    } & DefaultSession['user'];
  }

  interface User {
    id: number;
    role: 'employee' | 'supervisor';
    name?: string;
    email?: string;
    department?: DepartmentType;
    subUnit?: SubUnitType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number;
    role: 'employee' | 'supervisor';
    name?: string;
    email?: string;
    department?: DepartmentType;
    subUnit?: SubUnitType;
  }
}