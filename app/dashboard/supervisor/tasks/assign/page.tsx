'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Users, Calendar, AlertCircle, Send } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { SubUnitType, TASK_CATEGORIES_BY_SUB_UNIT, TaskCategory } from '@/types';
import toast from 'react-hot-toast';

interface Employee {
  id: string;
  name: string;
  subUnit?: SubUnitType;
}

export default function AssignTaskPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    category: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees');
        if (response.ok) {
          const data = await response.json();
          setEmployees(data);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchEmployees();
    }
  }, [session]);

  const selectedEmployee = employees.find(emp => emp.id === formData.assignedTo);
  const availableCategories = selectedEmployee?.subUnit
    ? TASK_CATEGORIES_BY_SUB_UNIT[selectedEmployee.subUnit] || []
    : [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please select an employee';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    if (!session?.user) {
      toast.error('You must be logged in to assign tasks');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Assigning task...');

    try {
      const selectedEmployee = employees.find(emp => emp.id === formData.assignedTo);
      if (!selectedEmployee) {
        toast.error('Selected employee not found', { id: loadingToast });
        setIsSubmitting(false);
        return;
      }

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignedTo: Number(selectedEmployee.id),
        assignedToName: selectedEmployee.name,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        category: formData.category || undefined,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success('Task assigned successfully!', { id: loadingToast });
        router.push('/dashboard/supervisor/tasks');
      } else {
        toast.error(responseData.error || 'Failed to assign task', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error('Failed to assign task. Please try again.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0088D0] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/supervisor"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assign New Task</h1>
          <p className="text-gray-500 mt-1">Create and assign a task to a team member</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              placeholder="Enter task title"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-200'
                }`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              placeholder="Describe the task in detail"
              rows={4}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-200'
                }`}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Assign To <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={formData.assignedTo}
                onChange={(e) => {
                  setFormData({ ...formData, assignedTo: e.target.value, category: '' });
                  if (errors.assignedTo) setErrors({ ...errors, assignedTo: '' });
                }}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent ${errors.assignedTo ? 'border-red-500' : 'border-gray-200'
                  }`}
                disabled={isSubmitting || employees.length === 0}
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name
                      .split(' ')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                    {emp.subUnit ? ` (${emp.subUnit})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {errors.assignedTo && (
              <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>
            )}
            {employees.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">
                No employees available. Please add employees first.
              </p>
            )}
          </div>

          {/* Category */}
          {selectedEmployee && availableCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Task Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
                disabled={isSubmitting}
              >
                <option value="">Select category</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
              disabled={isSubmitting}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Due Date
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
                disabled={isSubmitting}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Leave empty for no due date
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/dashboard/supervisor/tasks')}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2"
              disabled={isSubmitting || employees.length === 0}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Assign Task
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}