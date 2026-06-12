'use client';

import { useSession } from 'next-auth/react';
import LogoutButton from '../auth/LogoutButton';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: '#0088D0' }}>
                <span className="text-white font-bold text-sm">WR</span>
              </div>
              <h1 className="text-xl font-bold" style={{ color: '#981E52' }}>
                WorkReport
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{session?.user?.role}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}