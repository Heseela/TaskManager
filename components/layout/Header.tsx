'use client';

import { Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import LogoutButton from '../auth/LogoutButton';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserInitials = () => {
    if (!session?.user?.name) return 'U';
    const names = session.user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
       

        <div className="flex-1 hidden lg:block" />

        <div className="flex items-center gap-4">

          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0088D0] to-[#0077b8] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {getUserInitials()}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-800 capitalize">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {session?.user?.role}
                </p>
              </div>
              <div className="px-4 py-2">
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}