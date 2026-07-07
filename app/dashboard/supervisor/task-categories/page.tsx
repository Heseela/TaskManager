'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Edit, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatDateTime } from '@/global/dateUtils';
import SearchInput from '@/components/ui/SearchInput';
import { Department } from '@/types';

interface Category {
    ID: number;
    SubUnitID: number;
    SubUnitName: string;
    CategoryName: string;
    CreatedAt: string;
}

interface SubUnit {
    ID: number;
    DepID: string;
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
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | ''>('');
    const [selectedSubUnitId, setSelectedSubUnitId] = useState<number | ''>('');
    const [categoryName, setCategoryName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const filteredSubUnits = subUnits.filter(
        su => Number(su.DepID) === Number(selectedDepartmentId)
    );

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
        setCurrentPage(1);
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

        const subunit = subUnits.find(
            su => Number(su.ID) === Number(category.SubUnitID)
        );

        if (subunit) {
            setSelectedDepartmentId(Number(subunit.DepID));
            setSelectedSubUnitId(Number(subunit.ID));
        } else {
            setSelectedDepartmentId('');
            setSelectedSubUnitId('');
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
    };

    const getDepartmentName = (depId: string | number) => {
        if (!depId) return 'Unknown';
        const dept = departments.find(d => d.ID === Number(depId));
        return dept?.DepName || 'Unknown';
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
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
                <div className="flex-1 max-w-[500px]">
                    <div className="relative">
                        <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search categories by name or subunit..."
                            onClear={() => {
                                setSearchTerm('');
                            }}
                        />
                    </div>
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
                    <>
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
                                    {currentItems.map((category) => (
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
                                                    subUnits.find(su => su.ID === category.SubUnitID)?.DepID || 0
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {formatDateTime(category.CreatedAt)}
                                            </td>
                                            <td className="px-4 py-3 text-left">
                                                <button
                                                    onClick={() => openEditModal(category)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#0088D0] hover:bg-blue-50 rounded-lg transition-all hover:scale-105"
                                                    title="Edit category"
                                                >
                                                    <Edit size={15} />
                                                    <span className="text-xs font-medium">Edit</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between flex-wrap gap-4 px-4 py-3 border-t border-gray-200 mt-4">
                                <div className="text-sm text-gray-500">
                                    Showing <span className="font-medium text-gray-700">{indexOfFirstItem + 1}</span> to{' '}
                                    <span className="font-medium text-gray-700">
                                        {Math.min(indexOfLastItem, filteredCategories.length)}
                                    </span>{' '}
                                    of <span className="font-medium text-gray-700">{filteredCategories.length}</span> categories
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${currentPage === 1
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                            }`}
                                    >
                                        <ChevronLeft size={16} />
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-1 mx-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => paginate(page)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                    ? 'bg-[#0088D0] text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${currentPage === totalPages
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                            }`}
                                    >
                                        Next
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
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
                                        const depId = Number(e.target.value);

                                        setSelectedDepartmentId(depId);

                                        if (!editingCategory) {
                                            setSelectedSubUnitId('');
                                        }
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
                                    disabled={!selectedDepartmentId || !!editingCategory || isSubmitting}
                                >
                                    <option value="">Select subunit</option>

                                    {filteredSubUnits.map((su) => (
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
                                    type="button"
                                    variant="primary"
                                    onClick={closeModal}
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant='secondary'
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : editingCategory
                                            ? 'Update Category'
                                            : 'Add Category'}
                                </Button>

                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}