'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Button from '../../ui/Button';

interface Department {
  ID: number;
  DepName: string;
  DepCode: string;
}

interface SubUnit {
  ID: number;
  DepID: number | string; // Allow both number and string
  SubUnit: string;
  DepName?: string;
  DepCode?: string;
}

interface AddTaskCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: () => void; // Refresh categories after adding
}

export default function AddTaskCategoryModal({ 
  isOpen, 
  onClose, 
  onCategoryAdded 
}: AddTaskCategoryModalProps) {
  const { data: session } = useSession();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subUnits, setSubUnits] = useState<SubUnit[]>([]);
  const [filteredSubUnits, setFilteredSubUnits] = useState<SubUnit[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | ''>('');
  const [selectedSubUnitId, setSelectedSubUnitId] = useState<number | ''>('');
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubUnitsLoading, setIsSubUnitsLoading] = useState(true);

  // Fetch departments and subunits when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchSubUnits();
    }
  }, [isOpen]);

  // Filter subunits when department changes - FIXED: Convert DepID to number for comparison
  useEffect(() => {
    if (selectedDepartmentId) {
      const filtered = subUnits.filter(su => Number(su.DepID) === selectedDepartmentId);
      setFilteredSubUnits(filtered);
      setSelectedSubUnitId(''); // Reset subunit selection
    } else {
      setFilteredSubUnits([]);
      setSelectedSubUnitId('');
    }
  }, [selectedDepartmentId, subUnits]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      } else {
        toast.error('Failed to load departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Error loading departments');
    }
  };

  const fetchSubUnits = async () => {
    setIsSubUnitsLoading(true);
    try {
      const response = await fetch('/api/subunits');
      if (response.ok) {
        const data = await response.json();
        setSubUnits(data);
      } else {
        toast.error('Failed to load subunits');
      }
    } catch (error) {
      console.error('Error fetching subunits:', error);
      toast.error('Error loading subunits');
    } finally {
      setIsSubUnitsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDepartmentId) {
      toast.error('Please select a department');
      return;
    }

    if (!selectedSubUnitId) {
      toast.error('Please select a subunit');
      return;
    }

    if (!categoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Adding category...');

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subUnitId: selectedSubUnitId,
          categoryName: categoryName.trim(),
        }),
      });

      if (response.ok) {
        toast.success('Category added successfully!', {
          id: loadingToast,
        });
        setCategoryName('');
        setSelectedDepartmentId('');
        setSelectedSubUnitId('');
        onCategoryAdded(); // Refresh categories in parent
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to add category', {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category', {
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Debug logging
  console.log('Departments:', departments);
  console.log('SubUnits:', subUnits);
  console.log('Selected Department ID:', selectedDepartmentId);
  console.log('Filtered SubUnits:', filteredSubUnits);

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add Task Category</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Select Department *
            </label>
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
              required
            >
              <option value="">Select a department</option>
              {departments.map((dept) => (
                <option key={dept.ID} value={dept.ID}>
                  {dept.DepName} ({dept.DepCode})
                </option>
              ))}
            </select>
            {departments.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">
                No departments found. Please add departments first.
              </p>
            )}
          </div>

          {/* Sub-Unit Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Select Sub-Unit *
            </label>
            <select
              value={selectedSubUnitId}
              onChange={(e) => setSelectedSubUnitId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
              required
              disabled={!selectedDepartmentId || isSubUnitsLoading}
            >
              <option value="">Select a subunit</option>
              {filteredSubUnits.map((subUnit) => (
                <option key={subUnit.ID} value={subUnit.ID}>
                  {subUnit.SubUnit}
                </option>
              ))}
            </select>
            {isSubUnitsLoading && (
              <p className="mt-1 text-sm text-gray-500">Loading subunits...</p>
            )}
            {selectedDepartmentId && filteredSubUnits.length === 0 && !isSubUnitsLoading && (
              <p className="mt-1 text-sm text-yellow-600">
                No subunits found for this department. Please add subunits first.
              </p>
            )}
            {!selectedDepartmentId && (
              <p className="mt-1 text-sm text-gray-400">
                Please select a department first
              </p>
            )}
          </div>

          {/* Category Name Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name (e.g., PRTG Scan)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
              required
              disabled={isLoading}
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || isSubUnitsLoading || !selectedDepartmentId || !selectedSubUnitId}
              >
                {isLoading ? 'Adding...' : 'Add Category'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>

        {/* Optional: Show existing categories for the selected subunit */}
        {selectedSubUnitId && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Existing Categories for this Sub-Unit:
            </h4>
            <div className="max-h-32 overflow-y-auto">
              <SubUnitCategories subUnitId={selectedSubUnitId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component to show existing categories
function SubUnitCategories({ subUnitId }: { subUnitId: number }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/categories?subUnitId=${subUnitId}`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (subUnitId) {
      fetchCategories();
    }
  }, [subUnitId]);

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading categories...</p>;
  }

  if (categories.length === 0) {
    return <p className="text-sm text-gray-500">No categories yet</p>;
  }

  return (
    <ul className="space-y-1">
      {categories.map((cat, index) => (
        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#0088D0] rounded-full"></span>
          {cat}
        </li>
      ))}
    </ul>
  );
}