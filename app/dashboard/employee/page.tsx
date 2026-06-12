'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DailyReportForm from '@/components/dashboard/DailyReportForm';
import Card from '@/components/ui/Card';
import TaskList from '@/components/dashboard/TaskList';
import { DailyReport, Task } from '@/types';
import { CheckSquare, FileText } from 'lucide-react';

export default function EmployeeDashboard() {
  const { data: session } = useSession();
  const [submittedReports, setSubmittedReports] = useState<DailyReport[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'tasks'>('report');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportsRes = await fetch('/api/reports');
        if (!reportsRes.ok) throw new Error('Failed to fetch reports');
        const reportsData = await reportsRes.json();
        setSubmittedReports(reportsData);

        const tasksRes = await fetch('/api/tasks');
        if (!tasksRes.ok) throw new Error('Failed to fetch tasks');
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const handleSubmitReport = async (reportData: any) => {
    try {
      setError('');
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }

      const newReport = await response.json();
      setSubmittedReports([newReport, ...submittedReports]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    }
  };

  const handleStatusUpdate = async (taskId: string, status: Task['status']) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status }),
      });

      if (!response.ok) throw new Error('Failed to update task status');

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-8">
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          ✓ Operation completed successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          ✗ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: '#0088D0' }}>
              {submittedReports.length}
            </div>
            <div className="text-gray-600 text-sm mt-1">Reports Submitted</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: '#0088D0' }}>
              {pendingTasks}
            </div>
            <div className="text-gray-600 text-sm mt-1">Pending Tasks</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: '#0088D0' }}>
              {completedTasks}
            </div>
            <div className="text-gray-600 text-sm mt-1">Completed Tasks</div>
          </div>
        </Card>
      </div>

      <div className="bg-gray-100 p-1 rounded-xl mb-6">
  <nav className="flex gap-1" role="tablist">
    <button
      onClick={() => setActiveTab('report')}
      className={`flex-1 px-6 py-2.5 font-medium rounded-lg transition-all duration-200 ${
        activeTab === 'report'
          ? 'bg-white text-[#0088D0] shadow-md scale-[0.98]'
          : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
      }`}
      role="tab"
      aria-selected={activeTab === 'report'}
    >
      <div className="flex items-center justify-center gap-2">
        <FileText className={`w-4 h-4 transition-colors ${
          activeTab === 'report' ? 'text-[#0088D0]' : 'text-gray-400'
        }`} />
        <span>Submit Report</span>
      </div>
    </button>
    
    <button
      onClick={() => setActiveTab('tasks')}
      className={`flex-1 px-6 py-2.5 font-medium rounded-lg transition-all duration-200 ${
        activeTab === 'tasks'
          ? 'bg-white text-[#0088D0] shadow-md scale-[0.98]'
          : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
      }`}
      role="tab"
      aria-selected={activeTab === 'tasks'}
    >
      <div className="flex items-center justify-center gap-2">
        <CheckSquare className={`w-4 h-4 transition-colors ${
          activeTab === 'tasks' ? 'text-[#0088D0]' : 'text-gray-400'
        }`} />
        <span>My Tasks</span>
        <span className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
          activeTab === 'tasks'
            ? 'bg-[#0088D0]/10 text-[#0088D0]'
            : 'bg-gray-200 text-gray-600'
        }`}>
          {tasks.length}
        </span>
      </div>
    </button>
  </nav>
</div>

      {activeTab === 'report' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DailyReportForm onSubmit={handleSubmitReport} />

          <div className="space-y-6">
            <Card title="Your Recent Reports">
              {isLoading ? (
                <p className="text-gray-500 text-center py-8">Loading...</p>
              ) : submittedReports.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reports submitted yet</p>
              ) : (
                <div className="space-y-4 max-h-125 overflow-y-auto">
                  {submittedReports.map(report => (
                    <div key={report.id} className="border border-gray-200 rounded-md p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold" style={{ color: '#0088D0' }}>{report.date}</h4>
                        <span className="text-xs text-gray-500">{new Date(report.submittedAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p><strong>Tasks:</strong> {report.tasks.length} completed</p>
                        <p><strong>Hours:</strong> {report.hoursWorked}hr</p>
                        <p><strong>Status:</strong> <span className="text-green-600">✓ Submitted</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <TaskList
          tasks={tasks}
          userRole="employee"
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}