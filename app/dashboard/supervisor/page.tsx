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
  Sparkles,
  Briefcase,
  AlertCircle,
  Activity,
  ArrowUpRight,
  FileText,
  CheckCircle,
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
    totalHours: 0,
    completionRate: 0,
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

        const reportsArray = Array.isArray(reportsData) ? reportsData : (reportsData?.data || []);
        const tasksArray = Array.isArray(tasksData) ? tasksData : (tasksData?.data || []);
        const employeesArray = Array.isArray(employeesData) ? employeesData : (employeesData?.data || []);

        setReports(reportsArray);
        setTasks(tasksArray);
        setEmployees(employeesArray);

        const today = format(new Date(), 'yyyy-MM-dd');
        const todayReports = reportsArray.filter((r: DailyReport) => r.date === today);
        const pending = tasksArray.filter((t: Task) => t.status !== 'completed').length;
        const totalHours = reportsArray.reduce((sum: number, r: DailyReport) => sum + (r.hoursWorked || 0), 0);
        const avgHours = reportsArray.length > 0 ? (totalHours / reportsArray.length) : 0;
        const completedTasks = tasksArray.filter((t: Task) => t.status === 'completed').length;
        const completionRate = tasksArray.length > 0 ? (completedTasks / tasksArray.length) * 100 : 0;

        setStats({
          totalReports: reportsArray.length,
          todayReports: todayReports.length,
          pendingTasks: pending,
          totalEmployees: employeesArray.length,
          avgHours: Math.round(avgHours * 10) / 10,
          totalHours: Math.round(totalHours * 10) / 10,
          completionRate: Math.round(completionRate),
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

    const ActivityItem = ({ report, index }: { report: DailyReport; index: number }) => (
    <div
      className="flex items-center justify-between py-3.5 px-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200 border-b border-gray-100/80 last:border-0 group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-linear-to-br from-[#0088D0]/10 to-[#0066A0]/10 flex items-center justify-center border-2 border-white shadow-sm group-hover:border-[#0088D0]/20 transition-colors">
            <span className="text-sm font-semibold text-[#0088D0]">
              {report.userName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <CheckCircle size={10} className="text-white" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-800 capitalize text-sm group-hover:text-[#0088D0] transition-colors truncate">
            {report.userName || 'Unknown User'}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <ClipboardList size={12} className="text-gray-400" />
              {report.tasks?.length || 0} tasks
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={12} className="text-gray-400" />
              {report.hoursWorked}h
            </span>
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 ml-4">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Calendar size={13} className="text-gray-400" />
          {format(new Date(report.date), 'MMM d, yyyy')}
        </p>
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
           
          <h1 className="flex gap-2 text-2xl font-bold text-gray-800">
            Team Dashboard 
              <Sparkles size={20} className="text-[#e9a20a]" />
           
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
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100/80 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#0088D0]/10 rounded-xl">
                <Activity size={18} className="text-[#0088D0]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            </div>
            <Link
              href="/dashboard/supervisor/team-reports"
              className="text-sm text-[#0088D0] hover:text-[#0066A0] font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {reports.slice(0, 5).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <FileText size={28} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">Team reports will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100/80">
              {reports.slice(0, 5).map((report, index) => (
                <ActivityItem key={report.id} report={report} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <TrendingUp size={18} className="text-purple-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Team Overview</h2>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Clock size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Employees</p>
                  <p className="text-lg font-bold text-gray-800">{stats.totalEmployees}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckSquare size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed Tasks</p>
                  <p className="text-lg font-bold text-gray-800">{tasks.filter(t => t.status === 'completed').length}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertCircle size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Tasks</p>
                  <p className="text-lg font-bold text-gray-800">{stats.pendingTasks}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Briefcase size={18} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Hours/Report</p>
                  <p className="text-lg font-bold text-gray-800">{stats.avgHours}h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
    </div>
  );
}