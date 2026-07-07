'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardList,
  Users,
  Mail,
  ArrowRight,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#0088D0] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0088D0]/5 to-[#981E52]/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0088D0] mb-6 shadow-lg shadow-[#0088D0]/20">
              <span className="text-white font-bold text-3xl">WR</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
             SRDB Work Report Dashboard
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Streamline your team's daily reporting process. Easy submission, real-time tracking, and comprehensive analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/login"
                className="px-8 py-3 bg-[#981E52] text-white rounded-xl font-medium hover:bg-[#8d1448] transition-all duration-200 shadow-lg shadow-[#0088D0]/20 flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#features"
                className="px-8 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 border border-gray-200"
              >
                Learn More
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Easy Reporting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Real-time Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Role-Based Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">
            Everything You Need to Manage Reports
          </h2>
          <p className="text-gray-500 mt-2">
            Powerful features designed to streamline your team's workflow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-[#0088D0]/10 flex items-center justify-center mb-5 group-hover:bg-[#0088D0] transition-colors">
              <ClipboardList className="w-7 h-7 text-[#0088D0] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Reporting</h3>
            <p className="text-gray-500">
              Submit daily work reports with our simple, intuitive form interface. Quick and efficient.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-[#981E52]/10 flex items-center justify-center mb-5 group-hover:bg-[#981E52] transition-colors">
              <Users className="w-7 h-7 text-[#981E52] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Role-Based Access</h3>
            <p className="text-gray-500">
              Employees submit reports, supervisors get comprehensive overviews and analytics.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-[#0088D0]/10 flex items-center justify-center mb-5 group-hover:bg-[#0088D0] transition-colors">
              <Mail className="w-7 h-7 text-[#0088D0] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Email Reminders</h3>
            <p className="text-gray-500">
              Automated email notifications and reminders for pending reports and tasks.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-[#0088D0] to-[#981E52] rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of teams already using WorkReport Dashboard
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-800 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-lg"
          >
            Create Free Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 WorkReport Dashboard. All rights reserved.</p>
          <p className="mt-1 text-xs text-gray-400">
            Built with ❤️ for better team collaboration
          </p>
        </div>
      </footer>
    </div>
  );
}