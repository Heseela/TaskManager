'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardList,
  Users,
  Mail,
} from 'lucide-react';

export default function HomePage() {
  const { data: _session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-2 rounded-full mb-6" style={{ backgroundColor: '#0088D0'}}>
              <div className="w-16 h-16 flex items-center justify-center rounded-full" style={{ backgroundColor: '#0088D0' }}>
                <span className="text-white text-2xl font-bold">WR</span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: '#981E52' }}>
              Work Report Dashboard
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Streamline your team's daily reporting process. Easy submission, real-time tracking, and comprehensive analytics.
            </p>
            
            <div className="flex justify-center space-x-4">
              <Link
                href="/login"
                className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: '#0088D0' }}
              >
                Get Started
              </Link>
            </div>
          </div>

          <div id="features" className="mt-24">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#981E52' }}>
              Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#0088D0' }}>
                <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Reporting</h3>
                <p className="text-gray-600">Submit daily work reports with our simple, intuitive form interface.</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#0088D0' }}>
                <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
                <p className="text-gray-600">Employees submit reports, supervisor get comprehensive overviews.</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#0088D0' }}>
                <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Email Reminders</h3>
                <p className="text-gray-600">Automated email notifications and reminders for pending reports.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2026 WorkReport Dashboard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}