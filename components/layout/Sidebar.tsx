'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  Users,
  Tag,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSupervisor = session?.user?.role === 'supervisor';

  const employeeLinks = [
    { href: '/dashboard/employee', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/employee/reports', label: 'My Reports', icon: FileText },
    { href: '/dashboard/employee/tasks', label: 'Assigned Tasks', icon: CheckSquare },
  ];

  const supervisorLinks = [
    { href: '/dashboard/supervisor', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/supervisor/team-reports', label: 'Team Reports', icon: ClipboardList },
    { href: '/dashboard/supervisor/tasks', label: 'Assigned Tasks', icon: CheckSquare },
    { href: '/dashboard/supervisor/task-categories', label: 'Task Categories', icon: Tag },
    { href: '/dashboard/supervisor/employees', label: 'Employees', icon: Users },
  ];

  const links = isSupervisor ? supervisorLinks : employeeLinks;

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'
        }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Logo"
              width={30}
              height={30}
              className="object-cover"
            />
          </div>
          {isOpen && (
            <span className="text-lg font-bold text-[#981E52] whitespace-nowrap">
              SRDB Daily Log
            </span>
          )}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${isActive
                  ? 'bg-[#0088D0]/10 text-[#0088D0]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {isOpen && (
                <span className="font-medium text-sm whitespace-nowrap">
                  {link.label}
                </span>
              )}
              {!isOpen && (
                <div className="absolute left-16 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {link.label}
                </div>
              )}
              {isActive && (
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#0088D0] rounded-l-lg ${!isOpen ? 'hidden' : ''}`}></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50">
          <div className="w-9 h-9 rounded-full bg-[#981E52]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[#981E52] font-semibold text-sm">
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate capitalize">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {session?.user?.role}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}