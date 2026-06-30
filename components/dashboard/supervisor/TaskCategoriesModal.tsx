'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Button from '../../ui/Button';
import { Plus, X, Edit, Trash2 } from 'lucide-react';

interface Category {
  ID: number;
  SubUnitID: number;
  SubUnitName: string;
  CategoryName: string;
  CreatedAt: string;
}

interface Department {
  ID: number;
  DepName: string;
  DepCode: string;
}

interface SubUnit {
  ID: number;
  DepID: number;
  SubUnit: string;
  DepName?: string;
  DepCode?: string;
}

interface TaskCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: () => void;
}

export default function TaskCategoriesModal({
  isOpen,
  onClose,
  onCategoryAdded,
}: TaskCategoriesModalProps) {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subUnits, setSubUnits] = useState<SubUnit[]>([]);
  const [filteredSubUnits, setFilteredSubUnits] = useState<SubUnit[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | ''>('');
  const [selectedSubUnitId, setSelectedSubUnitId] = useState<number | ''>('');
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubUnitsLoading, setIsSubUnitsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAllData();
    }
  }, [isOpen]);

  // Filter subunits when department changes
  useEffect(() => {
    if (selectedDepartmentId) {
      const filtered = subUnits.filter(su => Number(su.DepID) === selectedDepartmentId);
      setFilteredSubUnits(filtered);
      setSelectedSubUnitId('');
    } else {
      setFilteredSubUnits([]);
      setSelectedSubUnitId('');
    }
  }, [selectedDepartmentId, subUnits]);

  // Filter categories by search and subunit
  useEffect(() => {
    let filtered = categories;
    
    if (selectedSubUnitId) {
      filtered = filtered.filter(c => c.SubUnitID === selectedSubUnitId);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.CategoryName.toLowerCase().includes(term) ||
        c.SubUnitName.toLowerCase().includes(term)
      );
    }
    
    setFilteredCategories(filtered);
  }, [categories, selectedSubUnitId, searchTerm]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchCategories(),
        fetchDepartments(),
        fetchSubUnits(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?all=true');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        setFilteredCategories(data.categories || []);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error loading categories');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchSubUnits = async () => {
    setIsSubUnitsLoading(true);
    try {
      const response = await fetch('/api/subunits');
      if (response.ok) {
        const data = await response.json();
        setSubUnits(data);
      }
    } catch (error) {
      console.error('Error fetching subunits:', error);
    } finally {
      setIsSubUnitsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
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
        await fetchCategories();
        setCategoryName('');
        setSelectedDepartmentId('');
        setSelectedSubUnitId('');
        setShowAddForm(false);
        onCategoryAdded();
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

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    const loadingToast = toast.loading('Deleting category...');

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Category deleted successfully!', {
          id: loadingToast,
        });
        await fetchCategories();
        onCategoryAdded();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete category', {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category', {
        id: loadingToast,
      });
    }
  };

  const handleEditCategory = async (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.CategoryName);
    setSelectedDepartmentId(
      subUnits.find(su => su.ID === category.SubUnitID)?.DepID || ''
    );
    setSelectedSubUnitId(category.SubUnitID);
    setShowAddForm(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Updating category...');

    try {
      const response = await fetch(`/api/categories/${editingCategory?.ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryName: categoryName.trim(),
        }),
      });

      if (response.ok) {
        toast.success('Category updated successfully!', {
          id: loadingToast,
        });
        await fetchCategories();
        setCategoryName('');
        setSelectedDepartmentId('');
        setSelectedSubUnitId('');
        setEditingCategory(null);
        setShowAddForm(false);
        onCategoryAdded();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update category', {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category', {
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Task Categories</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedSubUnitId}
              onChange={(e) => setSelectedSubUnitId(Number(e.target.value) || '')}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
            >
              <option value="">All Sub-Units</option>
              {subUnits.map(su => (
                <option key={su.ID} value={su.ID}>
                  {su.SubUnit}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (!showAddForm) {
                  setEditingCategory(null);
                  setCategoryName('');
                  setSelectedDepartmentId('');
                  setSelectedSubUnitId('');
                }
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? 'Cancel' : 'Add Category'}
            </Button>
          </div>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-3">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form
              onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
                    required
                    disabled={!!editingCategory}
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept.ID} value={dept.ID}>
                        {dept.DepName} ({dept.DepCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-Unit *
                  </label>
                  <select
                    value={selectedSubUnitId}
                    onChange={(e) => setSelectedSubUnitId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
                    required
                    disabled={!selectedDepartmentId || !!editingCategory}
                  >
                    <option value="">Select subunit</option>
                    {filteredSubUnits.map(su => (
                      <option key={su.ID} value={su.ID}>
                        {su.SubUnit}
                      </option>
                    ))}
                  </select>
                  {!selectedDepartmentId && (
                    <p className="mt-1 text-xs text-gray-500">Select a department first</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? 'Saving...'
                    : editingCategory
                    ? 'Update Category'
                    : 'Add Category'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingCategory(null);
                    setCategoryName('');
                    setSelectedDepartmentId('');
                    setSelectedSubUnitId('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <div
                  key={category.ID}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        {category.CategoryName}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {category.SubUnitName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Added: {new Date(category.CreatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.ID)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Total: {filteredCategories.length} categories
          </p>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}