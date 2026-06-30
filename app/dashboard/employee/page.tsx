'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DailyReportForm from '@/components/dashboard/employee/DailyReportForm';
import Card from '@/components/ui/Card';
import { DailyReport, Task, TaskCategory, SubUnitType } from '@/types';
import { CheckSquare, FileText, Eye } from 'lucide-react';
import TaskList from '@/components/dashboard/TaskList';
import { format } from 'date-fns';
import { formatDate, formatDateTime, formatTime } from '@/global/dateUtils';

export default function EmployeeDashboard() {
  const { data: session } = useSession();
  const [submittedReports, setSubmittedReports] = useState<DailyReport[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'tasks'>('report');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | undefined>();
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        setFilteredTasks(tasksData);
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

  useEffect(() => {
    if (selectedCategory) {
      setFilteredTasks(tasks.filter(task => task.category === selectedCategory));
    } else {
      setFilteredTasks(tasks);
    }
  }, [selectedCategory, tasks]);

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

  const handleStatusUpdate = async (taskId: number, status: Task['status']) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status }),
      });

      if (!response.ok) throw new Error('Failed to update task status');

      const updatedTask = await response.json();
      const updatedTasks = tasks.map(task => task.id === taskId ? updatedTask : task);
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks.filter(task =>
        !selectedCategory || task.category === selectedCategory
      ));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const openReportModal = (report: DailyReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeReportModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Welcome, {session?.user?.name
            ?.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')}!        
        </h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Department: <strong className='capitalize'>{session?.user?.department}</strong></span>
          {session?.user?.subUnit && (
            <span>Sub-Unit: <strong className='capitalize'>{session?.user?.subUnit}</strong></span>
          )}
          <span>Role: <strong className='capitalize'>{session?.user?.role}</strong></span>
        </div>
      </div>

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
            className={`flex-1 px-6 py-2.5 font-medium rounded-lg transition-all duration-200 ${activeTab === 'report'
              ? 'bg-white text-[#0088D0] shadow-md scale-[0.98]'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            role="tab"
            aria-selected={activeTab === 'report'}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className={`w-4 h-4 transition-colors ${activeTab === 'report' ? 'text-[#0088D0]' : 'text-gray-400'
                }`} />
              <span>Submit Report</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 px-6 py-2.5 font-medium rounded-lg transition-all duration-200 ${activeTab === 'tasks'
              ? 'bg-white text-[#0088D0] shadow-md scale-[0.98]'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            role="tab"
            aria-selected={activeTab === 'tasks'}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckSquare className={`w-4 h-4 transition-colors ${activeTab === 'tasks' ? 'text-[#0088D0]' : 'text-gray-400'
                }`} />
              <span>My Tasks</span>
              <span className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${activeTab === 'tasks'
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
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            Report Date
                          </p>
                          <div className="font-semibold text-md text-gray-800">
                            {format(new Date(report.date), 'MMM d, yyyy')}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-400">Submitted</p>
                          <p className="font-medium text-[#0088D0]">
                            {formatTime(report.submittedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p><strong>Tasks:</strong> {report.tasks.length} completed</p>
                        <p><strong>Hours:</strong> {report.hoursWorked}hr</p>
                        <p><strong>Status:</strong> <span className="text-green-600">✓ Submitted</span></p>
                      </div>
                      <button
                        onClick={() => openReportModal(report)}
                        className="mt-3 flex items-center gap-2 text-sm text-[#0088D0] hover:underline"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <TaskList
            tasks={filteredTasks}
            userRole="employee"
            onStatusUpdate={handleStatusUpdate}
          />
        </div>
      )}

      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">
                Report's Detail
              </h3>
              <button
                onClick={closeReportModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Employee</p>
                  <p className="capitalize font-medium text-gray-800">{selectedReport.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">
                    {formatDate(selectedReport.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hours Worked</p>
                  <p className="font-medium text-gray-800">{selectedReport.hoursWorked} hours</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted At</p>
                  <p className="font-medium text-gray-800">
                    {formatTime(selectedReport.submittedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-[#0088D0] rounded"></span>
                  Tasks Completed ({selectedReport.tasks.length})
                </h4>
                <ul className="space-y-2">
                  {selectedReport.tasks.map((task, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-[#0088D0] font-bold text-sm mt-0.5">{index + 1}.</span>
                      <span className="text-gray-700">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>


              {selectedReport.taskDescription && selectedReport.taskDescription.trim() && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-400 rounded"></span>
                    Task Description
                  </h4>
                  <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    {selectedReport.taskDescription}
                  </p>
                </div>
              )}

              {selectedReport.challenges && selectedReport.challenges.trim() && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-yellow-500 rounded"></span>
                    Challenges Faced
                  </h4>
                  <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    {selectedReport.challenges}
                  </p>
                </div>
              )}

              {selectedReport.tomorrowPlan && selectedReport.tomorrowPlan.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-green-500 rounded"></span>
                    Plan for Tomorrow
                  </h4>
                  <ul className="space-y-2">
                    {selectedReport.tomorrowPlan.map((plan, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <span className="text-green-600 font-bold text-sm mt-0.5">{index + 1}.</span>
                        <span className="text-gray-700">{plan}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={closeReportModal}
                className="w-full px-4 py-2 bg-[#0088D0] text-white rounded-lg hover:bg-[#0077b8] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}