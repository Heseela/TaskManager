// components/dashboard/TaskProgressModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Report, Task } from '@/types';
import { formatDateTime, formatTime } from '@/global/dateUtils';
import { format } from 'date-fns';

interface TaskProgressModalProps {
    task: Task;
    onClose: () => void;
}

export default function TaskProgressModal({ task, onClose }: TaskProgressModalProps) {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/reports');
                if (!response.ok) throw new Error('Failed to fetch reports');
                const data = await response.json();
                setReports(data);
            } catch (err) {
                setError('Failed to load report history');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: Task['priority']) => {
        switch (priority) {
            case 'low':
                return 'text-green-600';
            case 'medium':
                return 'text-yellow-600';
            case 'high':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    // Filter reports that contain this task title
    const taskReports = reports.filter(report =>
        report.tasks.some(taskTitle =>
            taskTitle.toLowerCase().includes(task.title.toLowerCase()) ||
            task.title.toLowerCase().includes(taskTitle.toLowerCase())
        )
    );

    return (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <span>Task Progress</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Task Details */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 capitalize">
                                {task.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                                    {task.priority.toUpperCase()} PRIORITY
                                </span>
                                {task.category && (
                                    <span className="text-sm text-gray-500">
                                        Category: <span className="font-medium">{task.category}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Assignment Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-500">Assigned By</p>
                                <p className="font-medium text-gray-800 capitalize">{task.assignedByName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Assigned To</p>
                                <p className="font-medium text-gray-800 capitalize">{task.assignedToName}</p>
                            </div>
                            {task.dueDate && (
                                <div>
                                    <p className="text-sm text-gray-500">Due Date</p>
                                    <p className="font-medium text-gray-800">
                                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                    {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Report History - Task Descriptions from Reports */}
                        <div className="border-t border-gray-200 pt-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">
                                Report History ({taskReports.length})
                            </h5>

                            {isLoading ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0088D0] mx-auto"></div>
                                    <p className="text-sm text-gray-500 mt-2">Loading report history...</p>
                                </div>
                            ) : error ? (
                                <p className="text-sm text-red-500">{error}</p>
                            ) : taskReports.length === 0 ? (
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-gray-500">No report descriptions found for this task yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {taskReports.map((report) => (
                                        <div key={report.id} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                            {report.taskDescription && (
                                                <div>
                                                    <p className="text-sm text-gray-700 font-medium mb-1">Task Description:</p>
                                                    <p className="text-sm text-gray-600 bg-white rounded p-2 border border-gray-100">
                                                        {report.taskDescription}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                                                <span>Hours: {report.hoursWorked}h</span>
                                                <span>•</span>
                                                <span className="text-xs text-gray-500">
                                                    {format(new Date(report.date), 'MMM d, yyyy')} {" "}
                                                    - {formatTime(report.date)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        {/* <div className="border-t border-gray-200 pt-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">Timeline</h5>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Created</span>
                                    <span className="text-gray-700">  
                                        {format(new Date(task.createdAt), 'MMM d, yyyy')} {" "}
                                        {formatTime(task.createdAt)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Last Updated</span>
                                    <span className="text-gray-700">
                                        {format(new Date(task.updatedAt), 'MMM d, yyyy')} {" "}
                                        {formatTime(task.updatedAt)}
                                    </span>
                                </div>
                                {task.status === 'completed' && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Completed</span>
                                        <span className="text-green-600 font-medium">
                                            {format(new Date(task.updatedAt), 'MMM d, yyyy')} {" "}
                                         {formatTime(task.updatedAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div> */}
                    </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-[#0088D0] text-white rounded-lg hover:bg-[#0077b8] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}