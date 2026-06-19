import 'next-auth';
import 'next-auth/jwt';
import { DepartmentType, SubUnitType } from '@/types';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    name: string;
    email: string;
    department: DepartmentType;
    subUnit?: SubUnitType;
  }
  
  interface Session {
    user: {
      id: string;
      role: string;
      name: string;
      email: string;
      department: DepartmentType;
      subUnit?: SubUnitType;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    name?: string;
    email?: string;
    department: DepartmentType;
    subUnit?: SubUnitType;
  }
}