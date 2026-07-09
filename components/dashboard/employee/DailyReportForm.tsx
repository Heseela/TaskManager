'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import { SubUnitType, CategoryTable, Task } from '@/types';
import FileUpload from './FileUpload';
import { Plus, X, AlertCircle, Clock, FileText, Calendar, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react';

interface FormErrors {
  tasks?: string;
  taskDescription?: string;
  hoursWorked?: string;
  previousTaskDescription?: string;
}

interface StepError {
  [key: string]: boolean;
}

export default function DailyReportForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<string[]>(['']);
  const [hoursWorked, setHoursWorked] = useState(8);
  const [challenges, setChallenges] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState(['']);
  const [taskDescription, setTaskDescription] = useState('');
  const [previoustaskDescription, setPreviousTaskDescription] = useState('');
  const [availableCategories, setAvailableCategories] = useState<CategoryTable[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<StepError>({});
  const [showErrors, setShowErrors] = useState(false);

  const userSubUnit = session?.user?.subUnit as SubUnitType;
  const userId = session?.user?.id;

  const steps = [
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'plan', label: 'Plan', icon: Calendar },
  ];

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

  const isStepValid = (stepId: string): boolean => {
    if (stepId === 'tasks') {
      const selectedTasks = tasks.filter(t => t.trim());
      return selectedTasks.length > 0;
    } else if (stepId === 'details') {
      const descriptionError = validateField('taskDescription', taskDescription);
      const hoursError = validateField('hoursWorked', hoursWorked);
      return !descriptionError && !hoursError;
    }
    return true;
  };

  const isStepAccessible = (stepIndex: number): boolean => {
    if (stepIndex === 0) return true;

    if (stepIndex === 1) {
      return isStepValid('tasks');
    }

    if (stepIndex === 2) {
      return isStepValid('tasks') && isStepValid('details');
    }

    return true;
  };

  const updateStepErrors = () => {
    const newStepErrors: StepError = {};

    const selectedTasks = tasks.filter(t => t.trim());
    if (showErrors && selectedTasks.length === 0) {
      newStepErrors.tasks = true;
    }

    if (showErrors) {
      const descriptionError = validateField('taskDescription', taskDescription);
      const hoursError = validateField('hoursWorked', hoursWorked);
      if (descriptionError || hoursError) {
        newStepErrors.details = true;
      }
    }

    setStepErrors(newStepErrors);
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

    const newStepErrors: StepError = {};
    if (newErrors.tasks) newStepErrors.tasks = true;
    if (newErrors.taskDescription || newErrors.hoursWorked) newStepErrors.details = true;
    setStepErrors(newStepErrors);

    return isValid;
  };

  const addTaskField = () => {
    setTasks(prev => [...prev, '']);
    if (errors.tasks) {
      setErrors({ ...errors, tasks: '' });
    }
    setTimeout(() => updateStepErrors(), 0);
  };

  const updateTaskField = (index: number, value: string) => {
    setTasks(prev => prev.map((item, i) => i === index ? value : item));

    const hasSelectedTask = tasks.some((t, i) => i !== index ? t.trim() : value.trim());
    if (hasSelectedTask) {
      setErrors(prev => ({ ...prev, tasks: '' }));
    }

    setTimeout(() => updateStepErrors(), 0);
  };

  const removeTaskField = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
    setTimeout(() => updateStepErrors(), 0);
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

  const handleFileUploaded = (file: { name: string; url: string }) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleFileRemoved = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStepClick = (index: number) => {
    if (!isStepAccessible(index)) {
      if (index === 1 && !isStepValid('tasks')) {
        toast.error('Please complete the Tasks step first', {
          icon: '',
          duration: 3000,
        });
        setCurrentStep(0);
      } else if (index === 2) {
        if (!isStepValid('tasks')) {
          toast.error('Please complete the Tasks step first', {
            duration: 3000,
          });
          setCurrentStep(0);
        } else if (!isStepValid('details')) {
          toast.error('Please complete the Details step first', {
            duration: 3000,
          });
          setCurrentStep(1);
        }
      }
      return;
    }

    setCurrentStep(index);
  };

  const handleNextStep = () => {
    const stepId = steps[currentStep].id;

    if (!isStepValid(stepId)) {
      setShowErrors(true);

      if (stepId === 'tasks') {
        const selectedTasks = tasks.filter(t => t.trim());
        if (selectedTasks.length === 0) {
          setErrors(prev => ({ ...prev, tasks: 'Please select at least one task' }));
          toast.error('Please select at least one task before proceeding', {
            duration: 3000,
          });
        }
      } else if (stepId === 'details') {
        const descriptionError = validateField('taskDescription', taskDescription);
        const hoursError = validateField('hoursWorked', hoursWorked);

        const newErrors: FormErrors = {};
        if (descriptionError) newErrors.taskDescription = descriptionError;
        if (hoursError) newErrors.hoursWorked = hoursError;
        setErrors(newErrors);

        const errorMessages = [];
        if (descriptionError) errorMessages.push(`• ${descriptionError}`);
        if (hoursError) errorMessages.push(`• ${hoursError}`);

        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-medium">Please fix the following errors:</span>
            <div className="text-sm space-y-0.5 mt-1">
              {errorMessages.map((msg, i) => (
                <div key={i} className="flex items-start gap-1">
                  <span className="text-red-500">•</span>
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          </div>,
          { duration: 4000 }
        );
      }

      setTimeout(() => updateStepErrors(), 0);
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setShowErrors(true);

    const isValid = validateForm();

    if (!isValid) {
      const errorMessages = [];
      if (errors.tasks) errorMessages.push('Step 1 (Tasks): ' + errors.tasks);
      if (errors.taskDescription) errorMessages.push('Step 2 (Details): ' + errors.taskDescription);
      if (errors.hoursWorked) errorMessages.push('Step 2 (Details): ' + errors.hoursWorked);

      if (stepErrors.tasks) {
        setCurrentStep(0);
      } else if (stepErrors.details) {
        setCurrentStep(1);
      }

      toast.error(
        <div className="flex flex-col gap-1 max-w-sm">
          <span className="font-medium text-red-600">Please fix the following errors:</span>
          <div className="text-sm space-y-0.5 mt-1">
            {errorMessages.map((msg, i) => (
              <div key={i} className="flex items-start gap-1">
                <span className="text-red-500">•</span>
                <span>{msg}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1 pt-1 border-t border-gray-100">
            Navigate to the step with errors to fix them
          </div>
        </div>,
        { duration: 5000 }
      );

      const firstError = document.querySelector('.text-red-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const selectedTasks = tasks
      .filter(t => t.trim())
      .map(task =>
        assignedTasks.some(a => a.title === task)
          ? `${task} (assigned)`
          : task
      );

    setIsSubmitting(true);

    try {
      const reportData = {
        tasks: selectedTasks,
        hoursWorked,
        challenges: challenges.trim(),
        tomorrowPlan: tomorrowPlan.filter(p => p.trim()),
        subUnit: userSubUnit,
        taskDescription: taskDescription.trim(),
        previousTaskDescription: previoustaskDescription.trim(),
        fileAttachments: uploadedFiles,
      };

      onSubmit(reportData);

      setTasks(['']);
      setHoursWorked(8);
      setChallenges('');
      setTomorrowPlan(['']);
      setTaskDescription('');
      setPreviousTaskDescription('');
      setUploadedFiles([]);
      setErrors({});
      setStepErrors({});
      setCurrentStep(0);
      setShowErrors(false);

      fetchAssignedTasks();

    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDropdownOptions = () => {
    const options: { value: string; label: string; type: 'category' | 'assigned' }[] = [];

    availableCategories.forEach(category => {
      options.push({ value: category, label: category, type: 'category' });
    });

    assignedTasks.forEach(task => {
      options.push({ value: task.title, label: `${task.title} (assigned)`, type: 'assigned' });
    });

    return options;
  };

  const dropdownOptions = getDropdownOptions();

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const hasError = showErrors && stepErrors[step.id] || false;
        const isAccessible = isStepAccessible(index);
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex-1 flex items-center">
            <div className="flex-1 flex flex-col items-center relative">
              <button
                type="button"
                onClick={() => handleStepClick(index)}
                disabled={!isAccessible || isSubmitting}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 relative ${!isAccessible
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : isActive
                    ? 'bg-[#0088D0] text-white shadow-lg shadow-[#0088D0]/30 ring-2 ring-[#0088D0] ring-offset-2'
                    : isCompleted && !hasError
                      ? 'bg-green-500 text-white'
                      : hasError
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-500 ring-offset-2 animate-pulse'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}
              >
                {!isAccessible ? (
                  <Lock size={16} />
                ) : isCompleted && !hasError ? (
                  <CheckCircle2 size={20} />
                ) : hasError ? (
                  <AlertTriangle size={20} />
                ) : (
                  <Icon size={20} />
                )}
                {hasError && isAccessible && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center animate-bounce">
                    !
                  </span>
                )}
              </button>
              <span className={`text-xs font-medium mt-2 flex items-center gap-1 ${!isAccessible
                ? 'text-gray-300'
                : isActive
                  ? 'text-[#0088D0]'
                  : hasError
                    ? 'text-red-500'
                    : 'text-gray-500'
                }`}>
                {step.label}
                {hasError && isAccessible && <AlertCircle size={12} className="text-red-500" />}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${!isStepAccessible(index + 1)
                ? 'bg-gray-100'
                : index < currentStep && !stepErrors[steps[index + 1]?.id]
                  ? 'bg-green-500'
                  : showErrors && stepErrors[steps[index + 1]?.id]
                    ? 'bg-red-300'
                    : 'bg-gray-200'
                }`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const isNextDisabled = () => {
    const stepId = steps[currentStep].id;
    return !isStepValid(stepId) || isSubmitting;
  };

  const Lock = ({ size = 16 }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0110 0v4"></path>
    </svg>
  );

  return (
    <Card className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border-0">
      <div className="bg-linear-to-r from-[#0088D0] to-[#0066A0] px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText size={24} />
          Today's Work Report
        </h2>
        <p className="text-white/80 text-sm mt-1">
          Fill in the details of your daily activities
        </p>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 text-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {renderStepIndicator()}

        <form onSubmit={handleSubmit} noValidate>
          {/* Tasks */}
          <div className={currentStep === 0 ? 'block' : 'hidden'}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Tasks Completed <span className="text-red-500">*</span>
                {(isLoadingCategories || isLoadingTasks) && (
                  <span className="ml-2 text-sm text-gray-400">Loading...</span>
                )}
              </label>
              <div className="space-y-2">
                {tasks.map((task, idx) => (
                  <div key={idx} className="flex gap-2">
                    <div className="flex-1 relative">
                      <select
                        value={task}
                        onChange={(e) => updateTaskField(idx, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 hover:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0] transition-all duration-200 appearance-none bg-white "
                        disabled={isLoadingCategories || isLoadingTasks || isSubmitting}
                      >
                        <option value="">Select a task...</option>
                        {dropdownOptions.map((option) => (
                          <option key={`${option.type}-${option.value}`} value={option.value}>
                            {option.label
                              .split(' ')
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                              )
                              .join(' ')}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                      />
                    </div>
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTaskField(idx)}
                        className="px-3 py-3 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        disabled={isSubmitting}
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addTaskField}
                className="mt-3 text-sm text-[#0088D0] hover:text-[#0066A0] font-medium flex items-center gap-1 transition-colors"
                disabled={isSubmitting}
              >
                <Plus size={16} />
                Add another task
              </button>

              {showErrors && errors.tasks && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                  <AlertCircle size={16} />
                  {errors.tasks}
                </p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className={currentStep === 1 ? 'block' : 'hidden'}>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Task Description <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-600 ml-2 font-normal">(Minimum 10 characters)</span>
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => {
                    setTaskDescription(e.target.value);
                    if (showErrors) {
                      const error = validateField('taskDescription', e.target.value);
                      setErrors(prev => ({ ...prev, taskDescription: error }));
                      setTimeout(() => updateStepErrors(), 0);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-200 hover:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0] transition-all duration-200 "
                  rows={4}
                  placeholder="Provide a detailed description of the tasks you completed today..."
                  disabled={isSubmitting}
                  required
                />
                {showErrors && errors.taskDescription && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle size={16} />
                    {errors.taskDescription}
                  </p>
                )}
                <div className="mt-1 text-xs text-gray-400 flex justify-between">
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Previous Content
                </label>
                <textarea
                  value={previoustaskDescription}
                  onChange={(e) => {
                    setPreviousTaskDescription(e.target.value);
                    if (showErrors) {
                      const error = validateField('previousTaskDescription', e.target.value);
                      setErrors(prev => ({ ...prev, previousTaskDescription: error }));
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0] transition-all duration-200 hover:border-gray-300"
                  rows={3}
                  placeholder="Reference any previous work (optional)"
                  disabled={isSubmitting}
                />
                {showErrors && errors.previousTaskDescription && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle size={16} />
                    {errors.previousTaskDescription}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <span className="flex items-center gap-2">
                    <Clock size={18} />
                    Hours Worked <span className="text-red-500">*</span>
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={hoursWorked}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setHoursWorked(value);
                      if (showErrors) {
                        const error = validateField('hoursWorked', value);
                        setErrors(prev => ({ ...prev, hoursWorked: error }));
                        setTimeout(() => updateStepErrors(), 0);
                      }
                    }}
                    className="w-32 px-4 py-3 border border-gray-200 hover:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0] transition-all duration-200 "
                    step="0.5"
                    min="0.5"
                    max="24"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {showErrors && errors.hoursWorked && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle size={16} />
                    {errors.hoursWorked}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Challenges Faced
                </label>
                <textarea
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0] transition-all duration-200 hover:border-gray-300"
                  rows={3}
                  placeholder="Any challenges or blockers you encountered..."
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Plan */}
          <div className={currentStep === 2 ? 'block' : 'hidden'}>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Plan for Tomorrow
                </label>
                <div className="space-y-2">
                  {tomorrowPlan.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateField(idx, e.target.value, setTomorrowPlan)}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0] transition-all duration-200 hover:border-gray-300"
                        placeholder="Enter plan for tomorrow..."
                        disabled={isSubmitting}
                      />
                      {tomorrowPlan.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeField(idx, setTomorrowPlan)}
                          className="px-3 py-3 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          disabled={isSubmitting}
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addField(setTomorrowPlan)}
                    className="text-sm text-[#0088D0] hover:text-[#0066A0] font-medium flex items-center gap-1 transition-colors"
                    disabled={isSubmitting}
                  >
                    <Plus size={16} />
                    Add another plan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  File Attachments
                  <span className="text-sm text-gray-400 ml-2">(Max 5 files, 10MB each)</span>
                </label>
                <FileUpload
                  onFileUploaded={handleFileUploaded}
                  onFileRemoved={handleFileRemoved}
                  uploadedFiles={uploadedFiles}
                  maxFiles={5}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${currentStep === 0 || isSubmitting
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 bg-gray-200/70  hover:text-gray-900 hover:bg-gray-200'
                }`}
              disabled={currentStep === 0 || isSubmitting}
            >
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isNextDisabled()}
                className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-lg ${isNextDisabled()
                  ? 'bg-[#0088D0]/40 text-gray-100 cursor-not-allowed shadow-none'
                  : 'bg-[#0088D0] text-white hover:bg-[#0066A0] shadow-[#0088D0]/30'
                  }`}
              >
                Next Step
              </button>
            ) : (
              <Button
                type="submit"
                className="px-8 py-2.5 bg-[#0088D0] text-white rounded-lg hover:bg-[#0066A0] transition-colors shadow-lg shadow-[#0088D0]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                variant="secondary"
                disabled={isSubmitting || isLoadingCategories}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
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
            )}
          </div>
        </form>
      </div>
    </Card>
  );
}