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
  ArrowRight,
  User,
  Building,
  Briefcase,
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
    avgHours: 0,
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
        const avgHours = reportsData.length > 0 ? (totalHours / reportsData.length) : 0;

        setStats({
          totalReports: reportsData.length,
          pendingTasks: pending,
          completedTasks: completed,
          avgHours: Math.round(avgHours * 10) / 10
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

  const userName = session?.user?.name
    ?.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ') || 'User';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className=" py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#0088D0]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-[#0088D0]">
                {userName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome back, <span className="text-[#0088D0]">{userName}</span>
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Here's what's happening with your work today
              </p>
            </div>
          </div>
          
          <Link
            href="/dashboard/employee/reports/new"
            className="px-5 py-2.5 bg-[#0088D0] text-white rounded-lg hover:bg-[#0077b8] transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md flex-shrink-0"
          >
            <FileText size={18} />
            New Report
          </Link>
        </div>

        {/* User Info Tags */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100/80">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
            <Building size={14} className="text-[#0088D0]" />
            <span className="font-medium">Department:</span>
            <span className="capitalize text-gray-800">{session?.user?.department}</span>
          </div>
          {session?.user?.subUnit && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
              <Briefcase size={14} className="text-[#981E52]" />
              <span className="font-medium">Sub-Unit:</span>
              <span className="capitalize text-gray-800">{session?.user?.subUnit}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
            <User size={14} className="text-blue-500" />
            <span className="font-medium">Role:</span>
            <span className="capitalize text-gray-800">{session?.user?.role}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
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
          label="Average Hours Worked"
          value={`${stats.avgHours}h`}
          bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Today's Progress & Recent Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-[#0088D0]" />
            Today's Progress
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Reports Submitted</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {todayReports.length}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Tasks Completed</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                {tasks.filter(t => t.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Pending Tasks</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
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
              <p className="text-gray-500 text-sm">No reports yet</p>
              <Link
                href="/dashboard/employee/reports/new"
                className="text-sm text-[#0088D0] hover:underline mt-2 inline-block"
              >
                Submit your first report →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentReports.map((report) => (
                <div 
                  key={report.id} 
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0088D0]/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-[#0088D0]" />
                    </div>
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
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center hover:shadow-md transition-all duration-200 group hover:scale-[1.02]"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 mx-auto flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <FileText size={24} className="text-blue-500" />
          </div>
          <p className="mt-2.5 text-sm font-medium text-gray-700">Submit Report</p>
          <p className="text-xs text-gray-400 mt-0.5">Create a new daily report</p>
        </Link>
        <Link
          href="/dashboard/employee/tasks"
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center hover:shadow-md transition-all duration-200 group hover:scale-[1.02]"
        >
          <div className="w-12 h-12 rounded-full bg-yellow-50 mx-auto flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
            <CheckSquare size={24} className="text-yellow-500" />
          </div>
          <p className="mt-2.5 text-sm font-medium text-gray-700">My Tasks</p>
          <p className="text-xs text-gray-400 mt-0.5">View and manage tasks</p>
        </Link>
        <Link
          href="/dashboard/employee/reports"
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center hover:shadow-md transition-all duration-200 group hover:scale-[1.02]"
        >
          <div className="w-12 h-12 rounded-full bg-green-50 mx-auto flex items-center justify-center group-hover:bg-green-100 transition-colors">
            <ClipboardList size={24} className="text-green-500" />
          </div>
          <p className="mt-2.5 text-sm font-medium text-gray-700">Report History</p>
          <p className="text-xs text-gray-400 mt-0.5">View all your reports</p>
        </Link>
      </div>
    </div>
  );
}