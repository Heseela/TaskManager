'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import { SubUnitType, TaskCategory, Task } from '@/types';

interface FormErrors {
  tasks?: string;
  taskDescription?: string;
  hoursWorked?: string;
}

export default function DailyReportForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<string[]>(['']);
  const [hoursWorked, setHoursWorked] = useState(8);
  const [challenges, setChallenges] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState(['']);
  const [taskDescription, setTaskDescription] = useState('');
  const [availableCategories, setAvailableCategories] = useState<TaskCategory[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userSubUnit = session?.user?.subUnit as SubUnitType;
  const userId = session?.user?.id;

  useEffect(() => {
    const fetchData = async () => {
      if (userSubUnit && userId) {
        await Promise.all([
          fetchCategories(),
          fetchAssignedTasks()
        ]);
      }
    };

    fetchData();
  }, [userSubUnit, userId]);

  const fetchCategories = async () => {
    if (!userSubUnit) return;
    
    setIsLoadingCategories(true);
    setError('');
    try {
      const response = await fetch(
        `/api/categories?subUnitName=${encodeURIComponent(userSubUnit)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAvailableCategories(data.categories || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch categories');
        setAvailableCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Network error while fetching categories');
      setAvailableCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchAssignedTasks = async () => {
    if (!userId) return;
    
    setIsLoadingTasks(true);
    try {
      const response = await fetch(`/api/tasks?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Filter tasks that are not completed
        const pendingTasks = data.filter((task: Task) => task.status !== 'completed');
        setAssignedTasks(pendingTasks);
      } else {
        console.error('Failed to fetch assigned tasks');
        setAssignedTasks([]);
      }
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
      setAssignedTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Validation functions
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'tasks':
        const selectedTasks = tasks.filter(t => t.trim());
        if (selectedTasks.length === 0) return 'Please select at least one task';
        return '';
      
      case 'taskDescription':
        if (!value.trim()) return 'Task description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        if (value.trim().length > 500) return 'Description must be less than 500 characters';
        return '';
      
      case 'hoursWorked':
        if (!value || value <= 0) return 'Hours worked is required';
        if (value < 0.5) return 'Hours worked must be at least 0.5';
        if (value > 24) return 'Hours worked cannot exceed 24';
        if (value % 0.5 !== 0) return 'Hours must be in 0.5 increments';
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

  const getFieldValue = (field: string): any => {
    switch (field) {
      case 'tasks': return tasks;
      case 'taskDescription': return taskDescription;
      case 'hoursWorked': return hoursWorked;
      default: return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const selectedTasks = tasks.filter(t => t.trim());
    if (selectedTasks.length === 0) {
      newErrors.tasks = 'Please select at least one task';
      isValid = false;
    }

    const descriptionError = validateField('taskDescription', taskDescription);
    if (descriptionError) {
      newErrors.taskDescription = descriptionError;
      isValid = false;
    }

    const hoursError = validateField('hoursWorked', hoursWorked);
    if (hoursError) {
      newErrors.hoursWorked = hoursError;
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({
      tasks: true,
      taskDescription: true,
      hoursWorked: true,
    });

    return isValid;
  };

  const addTaskField = () => {
    setTasks(prev => [...prev, '']);
    if (errors.tasks) {
      setErrors({ ...errors, tasks: '' });
    }
  };

  const updateTaskField = (index: number, value: string) => {
    setTasks(prev => prev.map((item, i) => i === index ? value : item));
    if (errors.tasks && value) {
      setErrors({ ...errors, tasks: '' });
    }
  };

  const removeTaskField = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const updateField = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const removeField = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
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

    const selectedTasks = tasks.filter(t => t.trim());
    
    setIsSubmitting(true);
    const loadingToast = toast.loading('Submitting report...');

    try {
      onSubmit({
        tasks: selectedTasks,
        hoursWorked,
        challenges: challenges.trim(),
        tomorrowPlan: tomorrowPlan.filter(p => p.trim()),
        subUnit: userSubUnit,
        taskDescription: taskDescription.trim(),
      });

      toast.success('Report submitted successfully!', {
        id: loadingToast,
      });
      
      // Reset form
      setTasks(['']);
      setHoursWorked(8);
      setChallenges('');
      setTomorrowPlan(['']);
      setTaskDescription('');
      setErrors({});
      setTouched({});
      
      // Refresh assigned tasks after submission
      fetchAssignedTasks();
                     
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.', {
        id: loadingToast,
      });   
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShowError = (field: string): boolean => {
    return touched[field] || Object.keys(errors).length > 0;
  };

  const getFieldError = (field: string): string => {
    return errors[field as keyof FormErrors] || '';
  };

  const selectedTasksCount = tasks.filter(t => t.trim()).length;

  // Combine categories and assigned tasks for the dropdown
  const getDropdownOptions = () => {
    const options: { value: string; label: string; type: 'category' | 'assigned' }[] = [];
    
    // Add categories
    availableCategories.forEach(category => {
      options.push({ value: category, label: category, type: 'category' });
    });
    
    // Add assigned tasks
    assignedTasks.forEach(task => {
      options.push({ value: task.title, label: `${task.title} (Assigned Task)`, type: 'assigned' });
    });
    
    return options;
  };

  const dropdownOptions = getDropdownOptions();

  return (
    <Card title="Today's Work Report">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
         {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Tasks Completed */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Tasks Completed <span className="text-red-500">*</span>
            {isLoadingCategories || isLoadingTasks && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
          </label>
          {tasks.map((task, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <select
                value={task}
                onChange={(e) => updateTaskField(idx, e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0] ${
                  errors.tasks && shouldShowError('tasks') && idx === tasks.length - 1 
                    ? 'border-red-500' 
                    : 'border-gray-300'
                }`}
                disabled={isLoadingCategories || isLoadingTasks || isSubmitting}
              >
                <option value="">Select task</option>
                {dropdownOptions.map((option) => (
                  <option key={`${option.type}-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
                {dropdownOptions.length === 0 && !isLoadingCategories && !isLoadingTasks && (
                  <option value="General">General Task</option>
                )}
              </select>
              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTaskField(idx)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addTaskField}
            className="text-sm mt-1 hover:underline"
            style={{ color: '#0088D0' }}
            disabled={isSubmitting}
          >
            + Add another task
          </button>
          
          {errors.tasks && shouldShowError('tasks') && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.tasks}
            </p>
          )}
        </div>

        {/* Task Description */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Task Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={taskDescription}
            onChange={(e) => {
              setTaskDescription(e.target.value);
              if (touched.taskDescription) {
                const error = validateField('taskDescription', e.target.value);
                setErrors({ ...errors, taskDescription: error });
              }
            }}
            onBlur={() => handleBlur('taskDescription')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0] ${
              errors.taskDescription && shouldShowError('taskDescription') 
                ? 'border-red-500' 
                : 'border-gray-300'
            }`}
            rows={3}
            placeholder="Provide a detailed description of the tasks you completed today... (minimum 10 characters)"
            disabled={isSubmitting}
            required
          />
          {errors.taskDescription && shouldShowError('taskDescription') && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.taskDescription}
            </p>
          )}
        </div>

        {/* Hours Worked */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Hours Worked <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={hoursWorked}
            onChange={(e) => {
              const value = Number(e.target.value);
              setHoursWorked(value);
              if (touched.hoursWorked) {
                const error = validateField('hoursWorked', value);
                setErrors({ ...errors, hoursWorked: error });
              }
            }}
            onBlur={() => handleBlur('hoursWorked')}
            className={`w-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0] ${
              errors.hoursWorked && shouldShowError('hoursWorked') 
                ? 'border-red-500' 
                : 'border-gray-300'
            }`}
            step="0.5"
            min="0.5"
            max="24"
            required
            disabled={isSubmitting}
          />
          {errors.hoursWorked && shouldShowError('hoursWorked') && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.hoursWorked}
            </p>
          )}
        </div>

        {/* Challenges Faced */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Challenges Faced</label>
          <textarea
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0]"
            rows={3}
            placeholder="Any challenges or blockers..."
            disabled={isSubmitting}
          />
        </div>

        {/* Plan for Tomorrow */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Plan for Tomorrow</label>
          {tomorrowPlan.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateField(idx, e.target.value, setTomorrowPlan)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0]"
                placeholder="Enter plan..."
                disabled={isSubmitting}
              />
              {tomorrowPlan.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField(idx, setTomorrowPlan)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField(setTomorrowPlan)}
            className="text-sm mt-1 hover:underline"
            style={{ color: '#0088D0' }}
            disabled={isSubmitting}
          >
            + Add another plan
          </button>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || isLoadingCategories}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Report'
          )}
        </Button>
      </form>
    </Card>
  );
}