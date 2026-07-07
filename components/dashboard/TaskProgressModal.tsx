'use client';

import { useState, useEffect } from 'react';
import { Report, Task } from '@/types';
import { formatDateTime, formatTime } from '@/global/dateUtils';
import { format } from 'date-fns';
import { X, Clock, Calendar, User, FileText, AlertCircle, CheckCircle, Clock as ClockIcon, ChevronDown, ChevronUp } from 'lucide-react';

interface TaskProgressModalProps {
    task: Task;
    onClose: () => void;
}

export default function TaskProgressModal({ task, onClose }: TaskProgressModalProps) {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedReports, setExpandedReports] = useState<Set<number>>(new Set());

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

    const toggleReportExpand = (reportId: number) => {
        setExpandedReports(prev => {
            const newSet = new Set(prev);
            if (newSet.has(reportId)) {
                newSet.delete(reportId);
            } else {
                newSet.add(reportId);
            }
            return newSet;
        });
    };

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

    const getStatusIcon = (status: Task['status']) => {
        switch (status) {
            case 'pending':
                return <ClockIcon size={14} className="text-yellow-600" />;
            case 'in-progress':
                return <AlertCircle size={14} className="text-blue-600" />;
            case 'completed':
                return <CheckCircle size={14} className="text-green-600" />;
            default:
                return null;
        }
    };

    const taskReports = reports.filter(report =>
        report.tasks.some(taskTitle =>
            taskTitle.toLowerCase().includes(task.title.toLowerCase()) ||
            task.title.toLowerCase().includes(taskTitle.toLowerCase())
        )
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-800 truncate">
                            Task Progress
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Task Details */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 capitalize">
                                {task.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                                    {task.priority.toUpperCase()} PRIORITY
                                </span>
                                {task.category && (
                                    <span className="text-sm text-gray-500">
                                        Category: <span className="font-medium text-gray-700">{task.category}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Assignment Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-start gap-2">
                                <User size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500">Assigned By</p>
                                    <p className="font-medium text-gray-800 capitalize">{task.assignedByName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <User size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500">Assigned To</p>
                                    <p className="font-medium text-gray-800 capitalize">{task.assignedToName}</p>
                                </div>
                            </div>
                            {task.dueDate && (
                                <div className="flex items-start gap-2">
                                    <Calendar size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500">Due Date</p>
                                        <p className="font-medium text-gray-800">
                                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-2">
                                <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                        {getStatusIcon(task.status)}
                                        {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Report History */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <FileText size={16} className="text-gray-400" />
                                    Report History ({taskReports.length})
                                </h5>
                            </div>

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0088D0] border-t-transparent"></div>
                                    <p className="text-sm text-gray-500 mt-3">Loading report history...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <AlertCircle size={20} className="text-red-500 mx-auto mb-2" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            ) : taskReports.length === 0 ? (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                    <FileText size={32} className="text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500">No report descriptions found for this task yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Reports will appear here once they include this task</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                    {taskReports.map((report) => {
                                        const isExpanded = expandedReports.has(report.id);
                                        const hasDescription = report.taskDescription || report.previousTaskDescription;
                                        
                                        return (
                                            <div 
                                                key={report.id} 
                                                className="bg-blue-50 border border-blue-100 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-200"
                                            >
                                                {/* Report Header */}
                                                <div 
                                                    className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-blue-100/50 transition-colors"
                                                    onClick={() => hasDescription && toggleReportExpand(report.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <Calendar size={14} className="text-gray-400" />
                                                            <span className="font-medium text-gray-700">
                                                                {format(new Date(report.date), 'MMM d, yyyy')}
                                                            </span>
                                                            <span className="text-gray-300">•</span>
                                                            <Clock size={14} className="text-gray-400" />
                                                            <span>{report.hoursWorked}h</span>
                                                        </div>
                                                    </div>
                                                    {hasDescription && (
                                                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Report Content */}
                                                {(isExpanded || !hasDescription) && (
                                                    <div className="px-4 pb-4 space-y-3">
                                                        {report.taskDescription && (
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 mb-1.5">Task Description</p>
                                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                                        {report.taskDescription}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {report.previousTaskDescription && (
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 mb-1.5">Previous Task Description</p>
                                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                                        {report.previousTaskDescription}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Report Metadata */}
                                                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-400 border-t border-gray-200/50">
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={12} />
                                                                {format(new Date(report.date), 'h:mm a')}
                                                            </span>
                                                            {report.subUnit && (
                                                                <>
                                                                    <span className="text-gray-300">•</span>
                                                                    <span className="capitalize">{report.subUnit}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 bg-[#0088D0] text-white rounded-lg hover:bg-[#0077b8] transition-all duration-200 font-medium hover:shadow-md"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}