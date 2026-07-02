'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatDateTime } from '@/global/dateUtils';

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

export default function TaskCategoriesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [subUnits, setSubUnits] = useState<SubUnit[]>([]);
    const [filteredSubUnits, setFilteredSubUnits] = useState<SubUnit[]>([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | ''>('');
    const [selectedSubUnitId, setSelectedSubUnitId] = useState<number | ''>('');
    const [categoryName, setCategoryName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'supervisor') {
            router.push('/dashboard');
        }
    }, [session, status, router]);

    useEffect(() => {
        if (session?.user?.role === 'supervisor') {
            fetchAllData();
        }
    }, [session]);

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
        setIsLoading(true);
        try {
            await Promise.all([
                fetchCategories(),
                fetchDepartments(),
                fetchSubUnits(),
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
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
        try {
            const response = await fetch('/api/subunits');
            if (response.ok) {
                const data = await response.json();
                setSubUnits(data);
            }
        } catch (error) {
            console.error('Error fetching subunits:', error);
        }
    };

    const openAddModal = () => {
        resetForm();
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setCategoryName(category.CategoryName);
        const subunit = subUnits.find(su => su.ID === category.SubUnitID);
        if (subunit) {
            setSelectedDepartmentId(Number(subunit.DepID));
            setSelectedSubUnitId(category.SubUnitID);
            const filtered = subUnits.filter(su => Number(su.DepID) === Number(subunit.DepID));
            setFilteredSubUnits(filtered);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
        setEditingCategory(null);
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

        setIsSubmitting(true);
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
                closeModal();
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
            setIsSubmitting(false);
        }
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryName.trim()) {
            toast.error('Please enter a category name');
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Updating category...');

        try {
            const response = await fetch(`/api/categories?id=${editingCategory?.ID}`, {
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
                closeModal();
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
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setCategoryName('');
        setSelectedDepartmentId('');
        setSelectedSubUnitId('');
        setFilteredSubUnits([]);
    };

    const getDepartmentName = (depId: number) => {
        if (!depId) return 'Unknown';
        const dept = departments.find(d => d.ID === Number(depId));
        return dept?.DepName || 'Unknown';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0088D0] mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/supervisor"
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Task Categories</h1>
                        <p className="text-sm text-gray-500">
                            Manage task categories for all subunits
                        </p>
                    </div>
                </div>
                <Button
                    onClick={openAddModal}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </Button>
            </div>

            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                             style={{ paddingLeft: '20px' }}
                            placeholder="Search categories by name or subunit..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
                        />
                    </div>
                </div>
                <div>
                    <select
                        value={selectedSubUnitId}
                        onChange={(e) => setSelectedSubUnitId(Number(e.target.value) || '')}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0] min-w-[150px]"
                    >
                        <option value="">All Sub-Units</option>
                        {subUnits.map(su => (
                            <option key={su.ID} value={su.ID}>
                                {su.SubUnit}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <Card>
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No categories found</p>
                        {searchTerm && (
                            <p className="text-sm text-gray-400 mt-1">
                                Try adjusting your search or filter
                            </p>
                        )}
                        {!searchTerm && !selectedSubUnitId && (
                            <Button
                                variant="secondary"
                                onClick={openAddModal}
                                className="mt-4"
                            >
                                Add your first category
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                                        Category Name
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                                        Sub-Unit
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                                        Department
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                                        Created At
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.map((category) => (
                                    <tr
                                        key={category.ID}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <span className="font-medium text-gray-800">
                                                {category.CategoryName}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {category.SubUnitName}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {getDepartmentName(
                                                Number(subUnits.find(su => su.ID === category.SubUnitID)?.DepID) || 0
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {formatDateTime(category.CreatedAt)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(category)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Edit category"
                                                >
                                                    <Edit className="w-4 h-4 text-blue-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <div className="flex justify-between items-center text-sm text-gray-500">
                <p>
                    Total: {filteredCategories.length} category
                    {filteredCategories.length !== 1 ? 's' : ''}
                </p>
                {filteredCategories.length !== categories.length && (
                    <p>
                        Showing {filteredCategories.length} of {categories.length} total categories
                    </p>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                                disabled={isSubmitting}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form
                            onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedDepartmentId}
                                    onChange={(e) => {
                                        setSelectedDepartmentId(Number(e.target.value));
                                        setSelectedSubUnitId('');
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
                                    required
                                    disabled={!!editingCategory || isSubmitting}
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
                                    Sub-Unit <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedSubUnitId}
                                    onChange={(e) => setSelectedSubUnitId(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
                                    required
                                    disabled={!selectedDepartmentId || !!editingCategory || isSubmitting}
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
                                {selectedDepartmentId && filteredSubUnits.length === 0 && !isSubmitting && (
                                    <p className="mt-1 text-xs text-yellow-600">
                                        No subunits found for this department
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    placeholder="Enter category name (e.g., PRTG Scan)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : editingCategory
                                            ? 'Update Category'
                                            : 'Add Category'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={closeModal}
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}