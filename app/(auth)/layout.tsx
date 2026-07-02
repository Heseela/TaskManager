'use client';

import { ReactNode } from 'react';
import '@/app/globals.css'


export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {children}
    </div>
  );
}