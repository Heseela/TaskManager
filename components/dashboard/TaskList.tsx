'use client';

import { Task } from '@/types';
import Card from '../ui/Card';

interface TaskListProps {
  tasks: Task[];
  userRole: string;
  onStatusUpdate?: (taskId: string, status: Task['status']) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

const priorityColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-600',
};

export default function TaskList({ tasks, userRole, onStatusUpdate }: TaskListProps) {


  const getStatusBadge = (status: Task['status']) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
    
  );
console.log("TASKLIST RECEIVED:", tasks);
  const getPriorityBadge = (priority: Task['priority']) => (
    <span className={`text-sm font-medium ${priorityColors[priority]}`}>
      {priority.toUpperCase()}
    </span>
  );

  const getStatusOptions = (currentStatus: Task['status']) => {
    const options = [];
    if (currentStatus !== 'pending') options.push('pending');
    if (currentStatus !== 'in-progress') options.push('in-progress');
    if (currentStatus !== 'completed') options.push('completed');
    return options;
  };

 const isEmployee = userRole === 'employee';
  const isSupervisor = userRole === 'supervisor' ; 


  if (tasks.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">No tasks assigned yet</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <Card key={task.id}>
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-800">{task.title}</h3>
                  {getPriorityBadge(task.priority)}
                </div>
                {task.description && (
                  <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    
                   
                     <span>
                      {isEmployee ? (
                        // For employees: Show who assigned the task
                        <>Assigned By: {task.assignedByName || task.assignedToName}</>
                      ) : isSupervisor ? (
                        // For supervisors/managers: Show who the task is assigned to
                        <>Assigned To: {task.assignedToName}</>
                      ) : (
                        // Fallback
                        <>Assigned To: {task.assignedToName}</>
                      )}
                    </span>
                   
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(task.status)}
              </div>
            </div>

            {userRole === 'employee' && onStatusUpdate && task.status !== 'completed' && (
              <div className="pt-3 border-t border-gray-100">
                <select
                  onChange={(e) => onStatusUpdate(task.id, e.target.value as Task['status'])}
                  value={task.status}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
                >
                  {getStatusOptions(task.status).map(status => (
                    <option key={status} value={status}>
                      Mark as {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}