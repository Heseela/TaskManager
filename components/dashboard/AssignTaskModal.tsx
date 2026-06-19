'use client';

import { useState } from 'react';
import Button from '../ui/Button';
import { TaskCategory, TASK_CATEGORIES_BY_SUB_UNIT, SubUnitType } from '@/types';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Array<{ id: string; name: string; subUnit?: SubUnitType }>;
  onSubmit: (taskData: any) => void;
}

export default function AssignTaskModal({ isOpen, onClose, employees, onSubmit }: AssignTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState<TaskCategory | ''>('');

  const selectedEmployee = employees.find(emp => emp.id === assignedTo);
  const availableCategories = selectedEmployee?.subUnit 
    ? TASK_CATEGORIES_BY_SUB_UNIT[selectedEmployee.subUnit] || []
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedEmployee = employees.find(emp => emp.id === assignedTo);
    onSubmit({
      title,
      description,
      assignedTo,
      assignedToName: selectedEmployee?.name || '',
      priority,
      dueDate,
      category: category || undefined,
    });
    setTitle('');
    setDescription('');
    setAssignedTo('');
    setPriority('medium');
    setDueDate('');
    setCategory('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Assign New Task</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
              required
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Assign To *</label>
            <select
              value={assignedTo}
              onChange={(e) => {
                setAssignedTo(e.target.value);
                setCategory('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
              required
            >
              <option value="">Select employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} {emp.subUnit ? `(${emp.subUnit})` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedEmployee && availableCategories.length > 0 && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Task Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
              >
                <option value="">Select category</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-2">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Assign Task
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}