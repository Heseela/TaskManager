'use client';

import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
  Mail,
  Building2,
  Briefcase,
  Sparkles,
  Crown,
  Award,
  Clock
} from 'lucide-react';
import LogoutButton from '../auth/LogoutButton';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ }: HeaderProps) {
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

  const getRoleIcon = () => {
    const role = session?.user?.role?.toLowerCase() || '';
    if (role.includes('admin') || role.includes('manager')) return <Crown size={14} className="text-yellow-400" />;
    if (role.includes('lead') || role.includes('supervisor')) return <Award size={14} className="text-blue-400" />;
    return;
  };

  return (
    <header className=" bg-white/80 backdrop-blur-md border-b border-gray-200/80 relative top-0 z-40 shadow-sm">
      <div className="flex items-center justify-end px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100/80 transition-all duration-300 group"
            >
              <div className="relative w-10 h-10 rounded-full bg-linear-to-br from-[#0088D0] via-[#0077b8] to-[#005a8c] flex items-center justify-center shrink-0 shadow-lg shadow-[#0088D0]/25 group-hover:shadow-[#0088D0]/40 transition-shadow duration-300">
                <span className="text-white font-bold text-sm tracking-wider">
                  {getUserInitials()}
                </span>
                <div className="absolute inset-0 rounded-full bg-linear-to-t from-black/10 to-transparent pointer-events-none"></div>
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-800 capitalize leading-tight">
                  {session?.user?.name || 'User'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-green-400"></span>
                  <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                    {session?.user?.role || 'Employee'}
                  </p>
                </div>
              </div>

              <div className={`p-0.5 rounded-full transition-all duration-300 ${isDropdownOpen ? 'bg-[#0088D0]/10 rotate-180' : ''
                }`}>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'text-[#0088D0]' : 'group-hover:text-gray-600'
                    }`}
                />
              </div>
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />

                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100/80 overflow-hidden animate-slideDown z-50">
                  <div className="relative bg-linear-to-r from-[#0088D0] via-[#0077b8] to-[#981E52] px-4 py-4 overflow-hidden">
                    <div className="relative flex items-center gap-4">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border-2 border-white/30 shadow-lg">
                          <span className="text-white font-bold text-sm tracking-wider">
                            {getUserInitials()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold text-lg truncate capitalize">
                            {session?.user?.name || 'User'}
                          </p>
                          {getRoleIcon()}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-white/90 text-sm capitalize">
                            {session?.user?.role || 'Employee'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 space-y-1 border-b border-gray-100/80">
                    {session?.user?.email && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 px-3 py-2 rounded-xl hover:bg-linear-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group/item">
                        <div className="">
                          <span>Email:</span>
                        </div>
                        <span className="truncate font-medium">{session.user.email}</span>
                      </div>
                    )}

                    {session?.user?.subUnit && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 px-3 py-2 rounded-xl hover:bg-linear-to-r hover:from-purple-50/50 hover:to-transparent transition-all duration-200 group/item">
                        <div className="">
                          <span>SubUnit:</span>
                        </div>
                        <span className="capitalize font-medium">{session.user.subUnit}</span>
                      </div>
                    )}

                    {session?.user?.department && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 px-3 py-2 rounded-xl hover:bg-linear-to-r hover:from-green-50/50 hover:to-transparent transition-all duration-200 group/item">
                        <div className="">
                          <span>Department:</span>
                        </div>
                        <span className="capitalize font-medium">{session.user.department}</span>
                      </div>
                    )}
                  </div>

                  <div className="px-2 flex justify-end py-2">
                    <LogoutButton />
                  </div>

                  <div className="px-6 py-2.5 bg-linear-to-r from-gray-50/80 to-gray-100/30 border-t border-gray-100/80">
                    <p className="text-xs text-gray-400 text-center">
                      Signed in as <span className="font-medium text-gray-600">{session?.user?.email}</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}