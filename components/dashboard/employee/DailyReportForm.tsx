'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import { SubUnitType, TaskCategory } from '@/types';

export default function DailyReportForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<string[]>(['']);
  const [hoursWorked, setHoursWorked] = useState(8);
  const [challenges, setChallenges] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState(['']);
  const [taskDescription, setTaskDescription] = useState('');
  const [availableCategories, setAvailableCategories] = useState<TaskCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [error, setError] = useState('');

  const userSubUnit = session?.user?.subUnit as SubUnitType;

  useEffect(() => {
    const fetchCategories = async () => {
      if (userSubUnit) {
        setIsLoadingCategories(true);
        setError('');
        try {
          const response = await fetch(
            `/api/categories?subUnitName=${encodeURIComponent(userSubUnit)}`
          );
          
          if (response.ok) {
            const data = await response.json();
            setAvailableCategories(data.categories || []);
            if (data.categories && data.categories.length > 0) {
              toast.success(`Loaded ${data.categories.length} categories for ${userSubUnit}`);
            }
          } else {
            const errorData = await response.json();
            const errorMsg = errorData.error || 'Failed to fetch categories';
            setError(errorMsg);
            toast.error(errorMsg);
            setAvailableCategories([]);
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
          const errorMsg = 'Network error while fetching categories';
          setError(errorMsg);
          toast.error(errorMsg);
          setAvailableCategories([]);
        } finally {
          setIsLoadingCategories(false);
        }
      }
    };

    fetchCategories();
  }, [userSubUnit]);

  const addTaskField = () => {
    setTasks(prev => [...prev, '']);
  };

  const updateTaskField = (index: number, value: string) => {
    setTasks(prev => prev.map((item, i) => i === index ? value : item));
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
    
    const selectedTasks = tasks.filter(t => t.trim());
    if (selectedTasks.length === 0) {
      toast.error('Please select at least one task');
      return;
    }

    if (hoursWorked <= 0 || hoursWorked > 24) {
      toast.error('Please enter valid hours (1-24)');
      return;
    }

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
      
      setTasks(['']);
      setHoursWorked(8);
      setChallenges('');
      setTomorrowPlan(['']);
      setTaskDescription('');
      
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.', {
        id: loadingToast,
      });
    }
  };

  return (
    <Card title="Today's Work Report">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Tasks Completed
            {isLoadingCategories && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
          </label>
          {tasks.map((task, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <select
                value={task}
                onChange={(e) => updateTaskField(idx, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0]"
                disabled={isLoadingCategories}
              >
                <option value="">Select task category</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTaskField(idx)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
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
          >
            + Add another task
          </button>
          {availableCategories.length === 0 && !isLoadingCategories && userSubUnit && (
            <p className="mt-1 text-sm text-yellow-600">
              No categories available for your subunit.
            </p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Task Description</label>
          <textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0]"
            rows={3}
            placeholder="Provide a detailed description of the tasks you completed today..."
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Hours Worked</label>
          <input
            type="number"
            value={hoursWorked}
            onChange={(e) => setHoursWorked(Number(e.target.value))}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0]"
            step="0.5"
            min="0"
            max="24"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Challenges Faced</label>
          <textarea
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0]"
            rows={3}
            placeholder="Any challenges or blockers..."
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Plan for Tomorrow</label>
          {tomorrowPlan.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateField(idx, e.target.value, setTomorrowPlan)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0]"
                placeholder="Enter plan..."
              />
              {tomorrowPlan.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField(idx, setTomorrowPlan)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
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
          >
            + Add another plan
          </button>
        </div>

        <Button type="submit" className="w-full">
          Submit Report
        </Button>
      </form>
    </Card>
  );
}