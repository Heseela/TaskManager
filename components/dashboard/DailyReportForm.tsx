'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { TASK_CATEGORIES_BY_SUB_UNIT, SubUnitType, TaskCategory } from '@/types';

export default function DailyReportForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<string[]>(['']);
  const [hoursWorked, setHoursWorked] = useState(8);
  const [accomplishments, setAccomplishments] = useState(['']);
  const [challenges, setChallenges] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState(['']);
  const [selectedSubUnit, setSelectedSubUnit] = useState<SubUnitType | ''>('');
  const [taskDescription, setTaskDescription] = useState('');
  const [availableCategories, setAvailableCategories] = useState<TaskCategory[]>([]);

  const userSubUnit = session?.user?.subUnit as SubUnitType;

  useEffect(() => {
    if (userSubUnit) {
      setSelectedSubUnit(userSubUnit);
      const categories = TASK_CATEGORIES_BY_SUB_UNIT[userSubUnit] || [];
      setAvailableCategories(categories);
    }
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

  const handleSubUnitChange = (subUnit: SubUnitType) => {
    setSelectedSubUnit(subUnit);
    const categories = TASK_CATEGORIES_BY_SUB_UNIT[subUnit] || [];
    setAvailableCategories(categories);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      tasks: tasks.filter(t => t.trim()),
      hoursWorked,
      accomplishments: accomplishments.filter(a => a.trim()),
      challenges,
      tomorrowPlan: tomorrowPlan.filter(p => p.trim()),
      subUnit: selectedSubUnit,
      taskDescription: taskDescription.trim(),
    });
    
    setTasks(['']);
    setHoursWorked(8);
    setAccomplishments(['']);
    setChallenges('');
    setTomorrowPlan(['']);
    setTaskDescription('');
  };

  return (
    <Card title="Today's Work Report">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Tasks Completed</label>
          {tasks.map((task, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <select
                value={task}
                onChange={(e) => updateTaskField(idx, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-[#0088D0]"
              >
                <option value="">Select task category</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
                {availableCategories.length === 0 && (
                  <option value="General">General Task</option>
                )}
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