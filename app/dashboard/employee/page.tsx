'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DailyReport, Task } from '@/types';
import {
  FileText,
  CheckSquare,
  Clock,
  TrendingUp,
  Calendar,
  ClipboardList,
  Activity,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function EmployeeDashboard() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalHours: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, tasksRes] = await Promise.all([
          fetch('/api/reports'),
          fetch('/api/tasks'),
        ]);

        const reportsData = await reportsRes.json();
        const tasksData = await tasksRes.json();

        setReports(reportsData);
        setTasks(tasksData);

        const completed = tasksData.filter((t: Task) => t.status === 'completed').length;
        const pending = tasksData.filter((t: Task) => t.status !== 'completed').length;
        const totalHours = reportsData.reduce((sum: number, r: DailyReport) => sum + r.hoursWorked, 0);

        setStats({
          totalReports: reportsData.length,
          pendingTasks: pending,
          completedTasks: completed,
          totalHours: totalHours,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const recentReports = reports.slice(0, 5);
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayReports = reports.filter(r => r.date === today);

  const StatCard = ({ icon: Icon, label, value, color, bgColor }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = () => {
    if (!session?.user?.name) return 'User';
    return session.user.name.split(' ')[0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#0088D0] border-t-transparent"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Welcome back, {session?.user?.name
            ?.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')}!        
        </h2>
          <p className="text-gray-500 mt-1">Here's what's happening with your work today</p>
        </div>
        <Link
          href="/dashboard/employee/reports/new"
          className="px-4 py-2 bg-[#0088D0] text-white rounded-lg hover:bg-[#0077b8] transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <FileText size={18} />
          New Report
        </Link>
      </div>

     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total Reports"
          value={stats.totalReports}
          bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={Clock}
          label="Pending Tasks"
          value={stats.pendingTasks}
          bgColor="bg-gradient-to-br from-yellow-500 to-yellow-600"
        />
        <StatCard
          icon={CheckSquare}
          label="Completed Tasks"
          value={stats.completedTasks}
          bgColor="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Hours Worked"
          value={`${stats.totalHours}h`}
          bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-[#0088D0]" />
            Today's Progress
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Reports Submitted</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {todayReports.length}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Tasks Completed</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                {tasks.filter(t => t.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Pending Tasks</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
                {tasks.filter(t => t.status !== 'completed').length}
              </span>
            </div>
          </div>
          <Link
            href="/dashboard/employee/tasks"
            className="mt-4 inline-flex items-center gap-1 text-sm text-[#0088D0] hover:text-[#0077b8] font-medium hover:underline transition-colors"
          >
            View all tasks
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-[#0088D0]" />
            Recent Reports
          </h2>
          {recentReports.length === 0 ? (
            <div className="text-center py-6">
              <ClipboardList size={40} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No reports yet</p>
              <Link
                href="/dashboard/employee/reports/new"
                className="text-sm text-[#0088D0] hover:underline mt-2 inline-block"
              >
                Submit your first report →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {format(new Date(report.date), 'MMM d, yyyy')}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{report.tasks.length} tasks</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{report.hoursWorked}h worked</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Submitted
                  </span>
                </div>
              ))}
            </div>
          )}
          {reports.length > 0 && (
            <Link
              href="/dashboard/employee/reports"
              className="mt-4 inline-flex items-center gap-1 text-sm text-[#0088D0] hover:text-[#0077b8] font-medium hover:underline transition-colors"
            >
              View all reports
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/employee/reports/new"
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-all duration-200 group hover:scale-[1.02]"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 mx-auto flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <FileText size={24} className="text-blue-500" />
          </div>
          <p className="mt-2 text-sm font-medium text-gray-700">Submit Report</p>
          <p className="text-xs text-gray-400">Create a new daily report</p>
        </Link>
        <Link
          href="/dashboard/employee/tasks"
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-all duration-200 group hover:scale-[1.02]"
        >
          <div className="w-12 h-12 rounded-full bg-yellow-50 mx-auto flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
            <CheckSquare size={24} className="text-yellow-500" />
          </div>
          <p className="mt-2 text-sm font-medium text-gray-700">My Tasks</p>
          <p className="text-xs text-gray-400">View assigned tasks</p>
        </Link>
        <Link
          href="/dashboard/employee/reports"
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-all duration-200 group hover:scale-[1.02]"
        >
          <div className="w-12 h-12 rounded-full bg-green-50 mx-auto flex items-center justify-center group-hover:bg-green-100 transition-colors">
            <ClipboardList size={24} className="text-green-500" />
          </div>
          <p className="mt-2 text-sm font-medium text-gray-700">Report History</p>
          <p className="text-xs text-gray-400">View all your reports</p>
        </Link>
      </div>
    </div>
  );
}