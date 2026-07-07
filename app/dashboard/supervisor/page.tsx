'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DailyReport, Task } from '@/types';
import {
  Users,
  ClipboardList,
  CheckSquare,
  Clock,
  TrendingUp,
  Plus,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function SupervisorDashboard() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    todayReports: 0,
    pendingTasks: 0,
    totalEmployees: 0,
    avgHours: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, tasksRes, employeesRes] = await Promise.all([
          fetch('/api/reports'),
          fetch('/api/tasks'),
          fetch('/api/employees'),
        ]);

        const reportsData = await reportsRes.json();
        const tasksData = await tasksRes.json();
        const employeesData = await employeesRes.json();

        setReports(reportsData);
        setTasks(tasksData);
        setEmployees(employeesData);

        const today = format(new Date(), 'yyyy-MM-dd');
        const todayReports = reportsData.filter((r: DailyReport) => r.date === today);
        const pending = tasksData.filter((t: Task) => t.status !== 'completed').length;
        const totalHours = reportsData.reduce((sum: number, r: DailyReport) => sum + r.hoursWorked, 0);
        const avgHours = reportsData.length > 0 ? (totalHours / reportsData.length) : 0;

        setStats({
          totalReports: reportsData.length,
          todayReports: todayReports.length,
          pendingTasks: pending,
          totalEmployees: employeesData.length,
          avgHours: Math.round(avgHours * 10) / 10,
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

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
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
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Team Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your team's reports and tasks
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardList}
          label="Total Reports"
          value={stats.totalReports}
          color="bg-blue-500"
        />
        <StatCard
          icon={Clock}
          label="Today's Reports"
          value={stats.todayReports}
          color="bg-green-500"
        />
        <StatCard
          icon={Users}
          label="Team Members"
          value={stats.totalEmployees}
          color="bg-purple-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Hours/Report"
          value={`${stats.avgHours}h`}
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/supervisor/team-reports"
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow group"
        >
          <div className="w-14 h-14 rounded-full bg-blue-50 mx-auto flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <ClipboardList size={28} className="text-blue-500" />
          </div>
          <p className="mt-3 font-medium text-gray-800">Team Reports</p>
          <p className="text-sm text-gray-500">View all team reports</p>
        </Link>

        <Link
          href="/dashboard/supervisor/tasks"
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow group"
        >
          <div className="w-14 h-14 rounded-full bg-yellow-50 mx-auto flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
            <CheckSquare size={28} className="text-yellow-500" />
          </div>
          <p className="mt-3 font-medium text-gray-800">Assigned Tasks</p>
          <p className="text-sm text-gray-500">{stats.pendingTasks} pending</p>
        </Link>

        <Link
          href="/dashboard/supervisor/employees"
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow group"
        >
          <div className="w-14 h-14 rounded-full bg-green-50 mx-auto flex items-center justify-center group-hover:bg-green-100 transition-colors">
            <Users size={28} className="text-green-500" />
          </div>
          <p className="mt-3 font-medium text-gray-800">Team Members</p>
          <p className="text-sm text-gray-500">{stats.totalEmployees} employees</p>
        </Link>
      </div>

      {/* Recent Team Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-[#0088D0]" />
          Recent Team Activity
        </h2>
        {reports.slice(0, 5).length === 0 ? (
          <p className="text-gray-500 text-center py-6">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">
                      {report.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 capitalize text-sm">
                      {report.userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {report.tasks.length} tasks · {report.hoursWorked}h worked
                    </p>
                  </div>
                </div>
                 <div className="text-right">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {format(new Date(report.date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}