'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TaskList from '@/components/dashboard/TaskList';
import AssignTaskModal from '@/components/dashboard/supervisor/AssignTaskModal';
// import AddTaskCategoryModal from '@/components/dashboard/supervisor/AddTaskCategoryModal';
import { DailyReport, Task, SubUnitType } from '@/types';
import { ClipboardList, Tag, Users } from 'lucide-react';
import { format } from 'date-fns';
import { formatTime } from '@/global/dateUtils';
import TaskCategoriesModal from '@/components/dashboard/supervisor/TaskCategoriesModal';
import Link from 'next/link';

interface Employee {
  id: string;
  name: string;
  subUnit?: SubUnitType;
}

export default function SupervisorDashboardPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  // const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'reports' | 'tasks'>('reports');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);


  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch reports
      const reportsRes = await fetch('/api/reports');
      if (!reportsRes.ok) throw new Error('Failed to fetch reports');
      const reportsData = await reportsRes.json();
      setReports(reportsData);

      // Fetch tasks
      const tasksRes = await fetch('/api/tasks');
      if (!tasksRes.ok) throw new Error('Failed to fetch tasks');
      const tasksData = await tasksRes.json();
      setTasks(tasksData);

      // Fetch employees
      const employeesRes = await fetch('/api/employees');
      if (employeesRes.ok) {
        const employeesData = await employeesRes.json();
        const typedEmployees = employeesData.map((emp: any) => ({
          ...emp,
          id: String(emp.id),
          subUnit: emp.subUnit as SubUnitType | undefined
        }));
        setEmployees(typedEmployees);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'supervisor') {
      fetchData();
    }
  }, [session]);

  const handleAssignTask = async (taskData: any) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) throw new Error('Failed to assign task');

      const newTask = await response.json();
      setTasks([newTask, ...tasks]);
      setSuccessMessage('Task assigned successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsAssignModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign task');
    }
  };

  const handleCategoryAdded = () => {
    // Refresh categories data if needed
    setSuccessMessage('Category added successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const today = new Date().toLocaleDateString('en-CA');

  const todayReports = reports.filter(
    r => String(r.date).slice(0, 10) === today
  );
  const uniqueEmployees = [...new Map(reports.map(r => [r.userId, r.userName])).entries()];
  const avgHoursPerDay = reports.length > 0
    ? (reports.reduce((sum, r) => sum + r.hoursWorked, 0) / reports.length).toFixed(1)
    : '0';

  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="dashboard-title">Supervisor Dashboard</h2>
          <div className='flex items-center gap-4'>
            <Button onClick={() => setIsAssignModalOpen(true)}>
              + Assign New Task
            </Button>
            <Link href="/dashboard/supervisor/task-categories">
              <Button variant="secondary" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Task Categories
              </Button>
            </Link>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            ✓ {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            ✗ {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#0088D0' }}>
                {isLoading ? '...' : todayReports.length}
              </div>
              <div className="text-gray-600 text-sm mt-1">Reports Today</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#0088D0' }}>
                {uniqueEmployees.length}
              </div>
              <div className="text-gray-600 text-sm mt-1">Active Employees</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#0088D0' }}>
                {avgHoursPerDay}
              </div>
              <div className="text-gray-600 text-sm mt-1">Avg Hours/Day</div>
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
        </div>

        <div className="bg-gray-100 p-1 rounded-xl mb-6">
          <nav className="flex gap-1" role="tablist">
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 px-6 py-2.5 font-medium rounded-lg transition-all duration-200 ${activeTab === 'reports'
                ? 'bg-white text-[#0088D0] shadow-md scale-[0.98]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              role="tab"
              aria-selected={activeTab === 'reports'}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className={`w-4 h-4 transition-colors ${activeTab === 'reports' ? 'text-[#0088D0]' : 'text-gray-400'
                  }`} />
                <span>Team Reports</span>
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
                <ClipboardList className={`w-4 h-4 transition-colors ${activeTab === 'tasks' ? 'text-[#0088D0]' : 'text-gray-400'
                  }`} />
                <span>Assigned Tasks</span>
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
      </div>

      {activeTab === 'reports' ? (
        isLoading ? (
          <Card>
            <p className="text-gray-500 text-center py-8">Loading reports...</p>
          </Card>
        ) : (
          <ReportsSection reports={reports} />
        )
      ) : (
        <TaskList tasks={tasks} userRole="supervisor" />
      )}

      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        employees={employees}
        onSubmit={handleAssignTask}
      />

      <TaskCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        onCategoryAdded={handleCategoryAdded}
      />
      {/* 
      <AddTaskCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryAdded={handleCategoryAdded}
      /> */}
    </div>
  );
}

function ReportsSection({ reports }: { reports: DailyReport[] }) {
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedSubUnit, setSelectedSubUnit] = useState<string>('all');

  const sortedReports = [...reports].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get unique subunits from reports
  const uniqueSubUnits = [...new Set(reports.map(r => r.subUnit).filter(Boolean))];

  const filteredReports = sortedReports.filter(report => {
    const dateMatch = selectedDate === 'all' || report.date === selectedDate;
    const employeeMatch = selectedEmployee === 'all' || String(report.userId) === selectedEmployee;
    const subUnitMatch = selectedSubUnit === 'all' || report.subUnit === selectedSubUnit;
    return dateMatch && employeeMatch && subUnitMatch;
  });

  const uniqueDates = [...new Map(reports.map(r => [r.date, r.date])).keys()].sort().reverse();
  const uniqueEmployees = [...new Map(reports.map(r => [String(r.userId), r.userName])).entries()]
    .map(([id, name]) => ({ id, name }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-gray-700 text-sm font-medium mb-1">Filter by Date</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
          >
            <option value="all">All Dates</option>
            {uniqueDates.map(date => (
              <option key={date} value={date}>
                {format(new Date(date), 'MMM d, yyyy')}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-gray-700 text-sm font-medium mb-1">Filter by Employee</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
          >
            <option value="all">All Employees</option>
            {uniqueEmployees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-gray-700 text-sm font-medium mb-1">Filter by Sub-Unit</label>
          <select
            value={selectedSubUnit}
            onChange={(e) => setSelectedSubUnit(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
          >
            <option value="all">All Sub-Units</option>
            {uniqueSubUnits.map(subUnit => (
              <option key={subUnit} value={subUnit}>{subUnit}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No reports found for the selected criteria</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {selectedDate === 'all' ? (
            Object.entries(
              filteredReports.reduce((acc, report) => {
                if (!acc[report.date]) acc[report.date] = [];
                acc[report.date].push(report);
                return acc;
              }, {} as Record<string, DailyReport[]>)
            ).map(([date, dateReports]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {format(new Date(date), 'EEE - MMM d, yyyy')}
                </h3>
                <div className="space-y-4">
                  {dateReports.map(report => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            filteredReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: DailyReport }) {
  return (
    <Card>
      <div className="space-y-4">
        <div className="flex justify-between items-start pb-3 border-b border-gray-100">
          <div>
            <h4 className="capitalize font-semibold text-gray-800">{report.userName}</h4>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
              <span>{report.subUnit || 'N/A'}</span>
              <span>•</span>
              <span>
                Submitted At{': '}
                {formatTime(report.submittedAt)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-gray-600">{report.hoursWorked} hours</span>
            <div className="mt-1">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                {report.status}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h5 className="font-medium text-gray-700 mb-2">Tasks Completed</h5>
          <ul className="list-disc list-inside space-y-1">
            {report.tasks.map((task, idx) => (
              <li key={idx} className="text-gray-600 text-sm">{task}</li>
            ))}
          </ul>
        </div>

        {report.taskDescription && (
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Task Description</h5>
            <p className="text-gray-600 text-sm">{report.taskDescription}</p>
          </div>
        )}

        {report.challenges && (
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Challenges</h5>
            <p className="text-gray-600 text-sm">{report.challenges}</p>
          </div>
        )}

        {report.tomorrowPlan && report.tomorrowPlan.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Tomorrow's Plan</h5>
            <ul className="list-disc list-inside space-y-1">
              {report.tomorrowPlan.map((plan, idx) => (
                <li key={idx} className="text-gray-600 text-sm">{plan}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}