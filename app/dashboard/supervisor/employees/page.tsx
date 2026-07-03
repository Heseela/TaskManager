'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Users, Mail, Building, Plus, Filter } from 'lucide-react';
import Link from 'next/link';
import SearchInput from '@/components/ui/SearchInput';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  subUnit: string;
  role: string;
}

export default function EmployeesPage() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterSubUnit, setFilterSubUnit] = useState<string>('all');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees');
        const data = await response.json();
        setEmployees(data);
        setFilteredEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchEmployees();
    }
  }, [session]);

  useEffect(() => {
    let filtered = [...employees];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        emp => 
          emp.name.toLowerCase().includes(term) ||
          emp.email.toLowerCase().includes(term)
      );
    }

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department === filterDepartment);
    }

    if (filterSubUnit !== 'all') {
      filtered = filtered.filter(emp => emp.subUnit === filterSubUnit);
    }

    setFilteredEmployees(filtered);
  }, [searchTerm, filterDepartment, filterSubUnit, employees]);

  const uniqueDepartments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
  const uniqueSubUnits = [...new Set(employees.map(emp => emp.subUnit).filter(Boolean))];

  const getSubUnitsForDepartment = (department: string) => {
    if (department === 'all') {
      return uniqueSubUnits;
    }
    return [...new Set(
      employees
        .filter(emp => emp.department === department)
        .map(emp => emp.subUnit)
        .filter(Boolean)
    )];
  };

  useEffect(() => {
    setFilterSubUnit('all');
  }, [filterDepartment]);

  const availableSubUnits = getSubUnitsForDepartment(filterDepartment);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={24} className="text-[#0088D0]" />
            Team Members
          </h1>
          <p className="text-gray-500 mt-1">View and manage your team</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-all duration-200">
          <p className="text-2xl font-bold text-gray-800">{employees.length}</p>
          <p className="text-sm text-gray-500">Total Employees</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-all duration-200">
          <p className="text-2xl font-bold text-blue-600">{uniqueDepartments.length}</p>
          <p className="text-sm text-gray-500">Departments</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-all duration-200">
          <p className="text-2xl font-bold text-green-600">
            {employees.filter(e => e.role === 'employee').length}
          </p>
          <p className="text-sm text-gray-500">Active Employees</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search employees by name or email..."
              onClear={() => {
                setSearchTerm('');
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent transition-all text-sm bg-white"
            >
              <option value="all">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Building size={18} className="text-gray-400" />
            <select
              value={filterSubUnit}
              onChange={(e) => setFilterSubUnit(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent transition-all text-sm bg-white"
            >
              <option value="all">All Sub-Units</option>
              {availableSubUnits.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
          <span className="text-sm text-gray-500 ml-auto bg-gray-50 px-3 py-1 rounded-full">
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}
          </span>
        </div>
        {/* {(filterDepartment !== 'all' || filterSubUnit !== 'all' || searchTerm) && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Active filters:</span>
            {filterDepartment !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                Dept: {filterDepartment}
                <button
                  onClick={() => setFilterDepartment('all')}
                  className="hover:text-blue-900 ml-1"
                >
                  ×
                </button>
              </span>
            )}
            {filterSubUnit !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                Sub-Unit: {filterSubUnit}
                <button
                  onClick={() => setFilterSubUnit('all')}
                  className="hover:text-green-900 ml-1"
                >
                  ×
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 rounded-full text-xs">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:text-gray-900 ml-1"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterDepartment('all');
                setFilterSubUnit('all');
              }}
              className="text-xs text-red-600 hover:text-red-700 hover:underline"
            >
              Clear all
            </button>
          </div>
        )} */}
      </div>

      {/* Employees Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0088D0] border-t-transparent"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No employees found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0088D0] to-[#0077b8] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {employee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 capitalize truncate">
                    {employee.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Mail size={14} className="flex-shrink-0" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Building size={14} className="flex-shrink-0" />
                    <span className="capitalize">{employee.subUnit || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                  {employee.role}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {employee.department}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}