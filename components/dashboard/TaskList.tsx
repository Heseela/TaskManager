// 'use client';

// import { Task } from '@/types';
// import Card from '../ui/Card';
// import { format } from 'date-fns';
// import { formatDateTime } from '@/global/dateUtils';

// interface TaskListProps {
//   tasks: Task[];
//   userRole: string;
//   onStatusUpdate?: (taskId: number, status: Task['status']) => void;
// }

// const statusColors = {
//   pending: 'bg-yellow-100 text-yellow-800',
//   'in-progress': 'bg-blue-100 text-blue-800',
//   completed: 'bg-green-100 text-green-800',
// };

// const priorityColors = {
//   low: 'text-green-600',
//   medium: 'text-yellow-600',
//   high: 'text-red-600',
// };

// export default function TaskList({ tasks, userRole, onStatusUpdate }: TaskListProps) {
//   const getStatusBadge = (status: Task['status']) => (
//     <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
//       {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
//     </span>
//   );

//   const getPriorityBadge = (priority: Task['priority']) => (
//     <span className={`text-sm font-medium ${priorityColors[priority]}`}>
//       {priority.toUpperCase()}
//     </span>
//   );

//   const getStatusOptions = (currentStatus: Task['status']) => {
//     const options = [];
//     if (currentStatus !== 'pending') options.push('pending');
//     if (currentStatus !== 'in-progress') options.push('in-progress');
//     if (currentStatus !== 'completed') options.push('completed');
//     return options;
//   };

//   if (tasks.length === 0) {
//     return (
//       <Card>
//         <div className="text-center py-8">
//           <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//           </svg>
//           <p className="text-gray-500">No tasks assigned yet</p>
//         </div>
//       </Card>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {tasks.map(task => (
//         <Card key={task.id}>
//           <div className="space-y-3">
//             <div className="flex justify-between items-start">
//               <div className="flex-1">
//                 <div className="flex items-center gap-3 mb-2">
//                   <h3 className="capitalize font-semibold text-gray-800">{task.title}</h3>
//                   {getPriorityBadge(task.priority)}
//                 </div>
//                 {task.description && (
//                   <p className="text-gray-600 text-sm mb-3">{task.description}</p>
//                 )}
//                 {task.category && (
//                   <p className="text-sm text-gray-500 mb-2">
//                     Category: <span className="font-medium">{task.category}</span>
//                   </p>
//                 )}
//                 <div className="flex flex-wrap gap-4 text-sm text-gray-500">
//                   <div className="flex items-center gap-1">
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                     </svg>
//                     <span>
//                       Assigned by:{' '}
//                       <span className="font-medium">
//                         {task.assignedByName.charAt(0).toUpperCase() +
//                           task.assignedByName.slice(1)}
//                       </span>
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                     </svg>
//                     <span>
//                       Assigned to:{' '}
//                       <span className="font-medium">
//                         {task.assignedToName.charAt(0).toUpperCase() +
//                           task.assignedToName.slice(1)}
//                       </span>
//                     </span>
//                   </div>
//                   {task.dueDate && (
//                     <div className="flex items-center gap-1">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                       </svg>
//                       <span>
//                         Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="text-right">
//                 {getStatusBadge(task.status)}
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-4 text-xs text-gray-400 border-t border-gray-100 mt-8">
//               <div>
//                 Created At: <span className="font-medium">{formatDateTime(task.createdAt)}</span>
//               </div>
//               <div>
//                 Updated At: <span className="font-medium">{formatDateTime(task.updatedAt)}</span>
//               </div>
//             </div>

//             {userRole === 'employee' && onStatusUpdate && task.status !== 'completed' && (
//               <div className="pt-3 border-t border-gray-100">
//                 <select
//                   onChange={(e) => onStatusUpdate(task.id, e.target.value as Task['status'])}
//                   value={task.status}
//                   className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
//                 >
//                   {getStatusOptions(task.status).map(status => (
//                     <option key={status} value={status}>
//                       Mark as {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}
//           </div>
//         </Card>
//       ))}
//     </div>
//   );
// }


// components/dashboard/TaskList.tsx
'use client';

import { useState } from 'react';
import { Task } from '@/types';
import Card from '../ui/Card';
import { format } from 'date-fns';
import { formatDateTime } from '@/global/dateUtils';
import TaskProgressModal from './TaskProgressModal';

interface TaskListProps {
  tasks: Task[];
  userRole: string;
  onStatusUpdate?: (taskId: number, status: Task['status']) => void;
  onTaskCompleted?: (taskId: number) => void;
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

export default function TaskList({ tasks, userRole, onStatusUpdate, onTaskCompleted }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const getStatusBadge = (status: Task['status']) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

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

  const handleViewProgress = (task: Task) => {
    setSelectedTask(task);
    setIsProgressModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsProgressModalOpen(false);
    setSelectedTask(null);
  };

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
    <>
      <div className="space-y-4">
        {tasks.map(task => (
          <Card key={task.id}>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="capitalize font-semibold text-gray-800">{task.title}</h3>
                    {getPriorityBadge(task.priority)}
                  </div>
                  {task.description && (
                    <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                  )}
                  {task.category && (
                    <p className="text-sm text-gray-500 mb-2">
                      Category: <span className="font-medium">{task.category}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>
                        Assigned by:{' '}
                        <span className="font-medium">
                          {task.assignedByName.charAt(0).toUpperCase() +
                            task.assignedByName.slice(1)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>
                        Assigned to:{' '}
                        <span className="font-medium">
                          {task.assignedToName.charAt(0).toUpperCase() +
                            task.assignedToName.slice(1)}
                        </span>
                      </span>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(task.status)}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-400 border-t border-gray-100 mt-8">
                <div>
                  Created At: <span className="font-medium">{formatDateTime(task.createdAt)}</span>
                </div>
                <div>
                  Updated At: <span className="font-medium">{formatDateTime(task.updatedAt)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                <button
                  onClick={() => handleViewProgress(task)}
                  className="px-4 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Progress
                </button>

                {userRole === 'employee' && onStatusUpdate && task.status !== 'completed' && (
                  <select
                    onChange={(e) => {
                      const newStatus = e.target.value as Task['status'];
                      onStatusUpdate(task.id, newStatus);
                      if (newStatus === 'completed' && onTaskCompleted) {
                        onTaskCompleted(task.id);
                      }
                    }}
                    value={task.status}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
                  >
                    {getStatusOptions(task.status).map(status => (
                      <option key={status} value={status}>
                        Mark as {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {isProgressModalOpen && selectedTask && (
        <TaskProgressModal
          task={selectedTask}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}