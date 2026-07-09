'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../../ui/Button';
import { CategoryTable } from '@/types';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Array<{
    id: string | number;
    name: string;
    subUnit?: string;
  }>;
  onSubmit: (taskData: any) => void;
}

interface FormErrors {
  title?: string;
  assignedTo?: string;
  description?: string;
}

export default function AssignTaskModal({ isOpen, onClose, employees, onSubmit }: AssignTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const selectedEmployee = employees.find(emp => String(emp.id) === assignedTo);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!assignedTo) {
        setAvailableCategories([]);
        setCategory('');
        return;
      }

      const employee = employees.find(emp => String(emp.id) === assignedTo);
      if (!employee?.subUnit) {
        setAvailableCategories([]);
        setCategory('');
        return;
      }

      setIsLoadingCategories(true);
      try {
        const response = await fetch(
          `/api/categories?subUnitName=${encodeURIComponent(employee.subUnit)}`
        );

        if (response.ok) {
          const data = await response.json();
          setAvailableCategories(data.categories || []);
          setCategory('');
        } else {
          console.error('Failed to fetch categories');
          setAvailableCategories([]);
          setCategory('');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setAvailableCategories([]);
        setCategory('');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [assignedTo, employees]);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'title':
        if (!value.trim()) return 'Task title is required';
        if (value.trim().length < 3) return 'Task title must be at least 3 characters';
        if (value.trim().length > 100) return 'Task title must be less than 100 characters';
        return '';
      
      case 'assignedTo':
        if (!value) return 'Please select an employee';
        return '';
      
      case 'description':
        if (!value.trim()) return 'Task description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        if (value.trim().length > 500) return 'Description must be less than 500 characters';
        return '';
      
      default:
        return '';
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, getFieldValue(field));
    setErrors({ ...errors, [field]: error });
  };

  const getFieldValue = (field: string): string => {
    switch (field) {
      case 'title': return title;
      case 'assignedTo': return assignedTo;
      case 'description': return description;
      default: return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const titleError = validateField('title', title);
    if (titleError) {
      newErrors.title = titleError;
      isValid = false;
    }

    const assignedToError = validateField('assignedTo', assignedTo);
    if (assignedToError) {
      newErrors.assignedTo = assignedToError;
      isValid = false;
    }

    const descriptionError = validateField('description', description);
    if (descriptionError) {
      newErrors.description = descriptionError;
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({
      title: true,
      assignedTo: true,
      description: true,
    });

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = document.querySelector('.text-red-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      toast.error('Please fix the errors before submitting');
      return;
    }

    const selectedEmployee = employees.find(emp => String(emp.id) === assignedTo);
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    setIsSubmitting(true);

    try {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        assignedTo: Number(selectedEmployee.id),
        assignedToName: selectedEmployee.name,
        priority,
        dueDate,
        category: category || undefined,
      });

      toast.success('Task assigned successfully!');
      
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setPriority('medium');
      setDueDate('');
      setCategory('');
      setAvailableCategories([]);
      setErrors({});
      setTouched({});
      onClose();
    } catch (error) {
      toast.error('Failed to assign task. Please try again.');
      console.error('Error assigning task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      setTouched({});
      onClose();
    }
  };

  const shouldShowError = (field: string): boolean => {
    return touched[field] || Object.keys(errors).length > 0;
  };

  useEffect(() => {
    if (isOpen) {
      setAssignedTo('');
      setCategory('');
      setAvailableCategories([]);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Assign New Task</h2>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (touched.title) {
                  const error = validateField('title', e.target.value);
                  setErrors({ ...errors, title: error });
                }
              }}
              onBlur={() => handleBlur('title')}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent ${
                errors.title && shouldShowError('title') ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Enter task title"
              disabled={isSubmitting}
            />
            {errors.title && shouldShowError('title') && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (touched.description) {
                  const error = validateField('description', e.target.value);
                  setErrors({ ...errors, description: error });
                }
              }}
              onBlur={() => handleBlur('description')}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent ${
                errors.description && shouldShowError('description') ? 'border-red-500' : 'border-gray-200'
              }`}
              rows={3}
              placeholder="Describe the task in detail"
              disabled={isSubmitting}
            />
            {errors.description && shouldShowError('description') && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.description}
              </p>
            )}
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Assign To <span className="text-red-500">*</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => {
                const value = e.target.value;
                setAssignedTo(value);
                if (touched.assignedTo) {
                  const error = validateField('assignedTo', value);
                  setErrors({ ...errors, assignedTo: error });
                }
              }}
              onBlur={() => handleBlur('assignedTo')}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent ${
                errors.assignedTo && shouldShowError('assignedTo') ? 'border-red-500' : 'border-gray-200'
              }`}
              disabled={isSubmitting || employees.length === 0}
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={String(emp.id)}>
                  {emp.name
                    .toLowerCase()
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                  {emp.subUnit ? ` (${emp.subUnit})` : ''}
                </option>
              ))}
            </select>
            {errors.assignedTo && shouldShowError('assignedTo') && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.assignedTo}
              </p>
            )}
            {employees.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">
                No employees available. Please add employees first.
              </p>
            )}
          </div>

          {/* Task Category - Show when employee is selected and categories are available */}
          {assignedTo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Task Category
                {isLoadingCategories && (
                  <span className="ml-2 text-xs text-gray-400">Loading...</span>
                )}
              </label>
              {isLoadingCategories ? (
                <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-[#0088D0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-500">Loading categories...</span>
                </div>
              ) : availableCategories.length > 0 ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="">Select category</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                  <p className="text-sm text-yellow-700">
                    No categories available for <strong>{selectedEmployee?.subUnit}</strong> subunit.
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Please contact your administrator to add categories for this subunit.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent"
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
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent"
              disabled={isSubmitting}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="mt-1 text-xs text-gray-500">
              {!dueDate && 'Leave empty for no due date'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleClose} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting || employees.length === 0}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assigning...
                </span>
              ) : (
                'Assign Task'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}