'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DailyReport } from '@/types';
import { format } from 'date-fns';
import { Filter, Eye, Calendar, Clock, User, CheckCircle, FileText, Users, Building, ChevronLeft, ChevronRight, Paperclip, File, Image, FileArchive, FileSpreadsheet, FileCode, X, EyeIcon, Layers } from 'lucide-react';

export default function TeamReportsPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<DailyReport[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    employee: '',
    department: '',
    subUnit: '',
  });
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, employeesRes] = await Promise.all([
          fetch('/api/reports'),
          fetch('/api/employees'),
        ]);

        const reportsData = await reportsRes.json();
        const employeesData = await employeesRes.json();

        const reportsWithDepartment = reportsData.map((report: any) => {
          const employee = employeesData.find((emp: any) => emp.id === report.userId);
          return {
            ...report,
            department: employee?.department || 'N/A',
          };
        });

        setReports(reportsWithDepartment);
        setFilteredReports(reportsWithDepartment);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  useEffect(() => {
    let filtered = [...reports];

    if (filters.date) {
      filtered = filtered.filter(r => r.date === filters.date);
    }

    if (filters.employee) {
      filtered = filtered.filter(r => String(r.userId) === filters.employee);
    }

    if (filters.department) {
      filtered = filtered.filter(r => r.department === filters.department);
    }

    if (filters.subUnit) {
      filtered = filtered.filter(r => r.subUnit === filters.subUnit);
    }

    setFilteredReports(filtered);
    setCurrentPage(1);
  }, [filters, reports]);

  const viewReport = (report: DailyReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const uniqueDepartments = [...new Set(reports.map(r => r.department).filter(Boolean))];
  const uniqueSubUnits = [...new Set(reports.map(r => r.subUnit).filter(Boolean))];

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const iconMap: { [key: string]: any } = {
      'pdf': FileText,
      'doc': FileText,
      'docx': FileText,
      'xls': FileSpreadsheet,
      'xlsx': FileSpreadsheet,
      'csv': FileSpreadsheet,
      'jpg': Image,
      'jpeg': Image,
      'png': Image,
      'gif': Image,
      'svg': Image,
      'webp': Image,
      'zip': FileArchive,
      'rar': FileArchive,
      '7z': FileArchive,
      'tar': FileArchive,
      'gz': FileArchive,
      'js': FileCode,
      'ts': FileCode,
      'jsx': FileCode,
      'tsx': FileCode,
      'html': FileCode,
      'css': FileCode,
      'json': FileCode,
      'xml': FileCode,
    };
    return iconMap[extension] || File;
  };

  const getFileSize = (sizeInBytes?: number) => {
    if (!sizeInBytes) return 'Unknown size';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
    return `${(sizeInBytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileColor = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const colorMap: { [key: string]: string } = {
      'pdf': 'text-red-500',
      'doc': 'text-blue-500',
      'docx': 'text-blue-500',
      'xls': 'text-green-500',
      'xlsx': 'text-green-500',
      'csv': 'text-green-500',
      'jpg': 'text-purple-500',
      'jpeg': 'text-purple-500',
      'png': 'text-purple-500',
      'gif': 'text-purple-500',
      'svg': 'text-purple-500',
      'zip': 'text-yellow-500',
      'rar': 'text-yellow-500',
      '7z': 'text-yellow-500',
      'js': 'text-yellow-600',
      'ts': 'text-blue-600',
      'html': 'text-orange-500',
      'css': 'text-purple-600',
      'json': 'text-green-600',
      'xml': 'text-red-400',
    };
    return colorMap[extension] || 'text-gray-500';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-blue-100 text-blue-700 border-blue-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    const dotColors = {
      submitted: 'bg-green-500',
      pending: 'bg-yellow-500',
      approved: 'bg-blue-500',
      rejected: 'bg-red-500',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.submitted}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status as keyof typeof dotColors] || 'bg-green-500'}`}></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={24} className="text-[#0088D0]" />
            Team Reports
          </h1>
          <p className="text-gray-500 mt-1">View and manage all team reports</p>
        </div>
        <button
          onClick={() => {
            setFilters({ date: '', employee: '', department: '', subUnit: '' });
          }}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 border border-gray-200"
        >
          <Filter size={16} />
          Reset Filters
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-all duration-200">
          <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
          <p className="text-sm text-gray-500">Total Reports</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-all duration-200">
          <p className="text-2xl font-bold text-blue-600">
            {new Set(reports.map(r => r.userId)).size}
          </p>
          <p className="text-sm text-gray-500">Employees</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-all duration-200">
          <p className="text-2xl font-bold text-green-600">
            {uniqueDepartments.length}
          </p>
          <p className="text-sm text-gray-500">Departments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              Employee
            </label>
            <select
              value={filters.employee}
              onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent transition-all bg-white"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
              <option key={emp.id} value={String(emp.id)}>
                {emp.name
                  .split(' ')
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </option>
            ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <Building size={16} className="text-gray-400" />
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent transition-all bg-white"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              Sub-Unit
            </label>
            <select
              value={filters.subUnit}
              onChange={(e) => setFilters({ ...filters, subUnit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent transition-all bg-white"
            >
              <option value="">All Sub-Units</option>
              {uniqueSubUnits.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0088D0] border-t-transparent"></div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FileText size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No reports found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-6 px-6 text-sm font-medium text-gray-500 w-16">
                      SN
                    </th>
                    <th className="text-left py-6 px-6 text-sm font-medium text-gray-500">
                      Employee
                    </th>
                    <th className="text-left py-6 px-6 text-sm font-medium text-gray-500">
                      Tasks
                    </th>
                    <th className="text-left py-6 px-6 text-sm font-medium text-gray-500">
                      Hours
                    </th>
                    <th className="text-left py-6 px-6 text-sm font-medium text-gray-500">
                      Department
                    </th>
                    <th className="text-left py-6 px-6 text-sm font-medium text-gray-500">
                      Sub-Unit
                    </th>
                    <th className="text-left py-6 px-6 text-sm font-medium text-gray-500">
                      Date
                    </th>
                    <th className="text-left py-6 px-6 text-sm font-medium text-gray-500">
                      Attachments
                    </th>
                    <th className="text-center py-6 px-6 text-sm font-medium text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.map((report, index) => (
                    <tr
                      key={report.id}
                      className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="py-3 px-6 r">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="py-3 px-6 text-gray-600">
                        <span className="font-medium text-gray-800 capitalize">
                          {report.userName}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-gray-600">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          <CheckCircle size={12} />
                          {report.tasks.length}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-gray-600">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                          <span className="font-medium">{report.hoursWorked} hrs</span>
                        </span>
                      </td>
                      <td className="py-3 px-6 text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {report.department || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {report.subUnit || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-gray-600">
                        <div className="flex items-center justify-start gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {format(new Date(report.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-gray-600">
                        {report.fileAttachments && report.fileAttachments.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <Paperclip size={14} className="text-gray-400" />
                            <span className="text-xs font-medium text-gray-600">
                              {report.fileAttachments.length}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => viewReport(report)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#0088D0] hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <Eye size={15} />
                          <span className="text-xs font-medium">View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium text-gray-700">
                  {Math.min(indexOfLastItem, filteredReports.length)}
                </span>{' '}
                of <span className="font-medium text-gray-700">{filteredReports.length}</span> reports
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

      {/* Report Detail Modal */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={closeModal}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-[#0088D0]" />
                Report Details of <span className='text-[#981E52]'>{selectedReport.userName}</span>
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>
 
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Date</p>
                  <p className="font-medium text-gray-800 mt-1 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    {format(new Date(selectedReport.date), 'EEEE, MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Hours Worked</p>
                  <p className="font-medium text-gray-800 mt-1 flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    {selectedReport.hoursWorked}h
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Department</p>
                  <p className="font-medium text-gray-800 mt-1 flex items-center gap-2">
                    <Building size={16} className="text-gray-400" />
                    {selectedReport.department || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Sub-Unit</p>
                  <p className="font-medium text-gray-800 mt-1 flex items-center gap-2">
                    <Layers size={16} className="text-gray-400" />
                    {selectedReport.subUnit || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Tasks Section */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#0088D0] rounded-full"></span>
                  Tasks Completed ({selectedReport.tasks?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedReport.tasks && selectedReport.tasks.length > 0 ? (
                    selectedReport.tasks.map((task, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        <CheckCircle size={18} className="text-[#0088D0] mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{task}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">No tasks listed</p>
                  )}
                </div>
              </div>

              {/* Task Description */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                  Task Description
                </h4>
                <div className="bg-purple-50/70 p-4 rounded-lg border border-purple-100">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedReport.taskDescription || 'No description provided'}
                  </p>
                </div>
              </div>

              {/* Previous Task Description */}
              {selectedReport.previousTaskDescription && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="w-1 h-5 bg-teal-500 rounded-full"></span>
                    Previous Task Description
                  </h4>
                  <div className="bg-teal-50/70 p-4 rounded-lg border border-teal-100">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedReport.previousTaskDescription}
                    </p>
                  </div>
                </div>
              )}

              {/* Challenges */}
              {selectedReport.challenges && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="w-1 h-5 bg-yellow-500 rounded-full"></span>
                    Challenges Faced
                  </h4>
                  <div className="bg-yellow-50/70 p-4 rounded-lg border border-yellow-100">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedReport.challenges}
                    </p>
                  </div>
                </div>
              )}

              {/* Tomorrow's Plan */}
              {selectedReport.tomorrowPlan && selectedReport.tomorrowPlan.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                    Tomorrow's Plan
                  </h4>
                  <div className="space-y-2">
                    {selectedReport.tomorrowPlan.map((plan, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg border border-green-100">
                        <span className="text-green-600 font-semibold mt-0.5">{i + 1}.</span>
                        <span className="text-gray-700">{plan}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Attachments */}
              {selectedReport.fileAttachments && selectedReport.fileAttachments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                    File Attachments ({selectedReport.fileAttachments.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedReport.fileAttachments.map((file, index) => {
                      const FileIcon = getFileIcon(file.name);
                      const fileColor = getFileColor(file.name);

                      return (
                        <a
                          key={index}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#0088D0] hover:shadow-md transition-all duration-200 group cursor-pointer"
                        >
                          <div className={`p-2 bg-white rounded-lg shadow-sm ${fileColor}`}>
                            <FileIcon size={20} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium text-gray-700 truncate group-hover:text-[#0088D0]"
                              title={file.name}
                            >
                              {file.name}
                            </p>
                          </div>

                          <div
                            className="p-1.5 text-gray-400 group-hover:text-[#0088D0] group-hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="View file"
                          >
                            <EyeIcon size={16} />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-200 px-6 py-4">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2.5 bg-[#0088D0] text-white rounded-lg hover:bg-[#0077b8] transition-all duration-200 hover:shadow-md font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}