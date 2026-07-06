'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DailyReport } from '@/types';
import { format } from 'date-fns';
import { FileText, Eye, Calendar, Clock, CheckCircle, ChevronLeft, Image, File, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeReportsPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports');
        const data = await response.json();
        setReports(data);
        setFilteredReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchReports();
    }
  }, [session]);

  useEffect(() => {
    if (filterDate) {
      setFilteredReports(reports.filter(r => r.date === filterDate));
    } else {
      setFilteredReports(reports);
    }
    setCurrentPage(1);
  }, [filterDate, reports]);

  const viewReport = (report: DailyReport) => {
    console.log('Report file attachments:', report.fileAttachments);
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
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
          <h1 className="text-2xl font-bold text-gray-800">My Reports</h1>
          <p className="text-gray-500 mt-1">View all your submitted reports</p>
        </div>
        <Link
          href="/dashboard/employee/reports/new"
          className="px-4 py-2 bg-[#0088D0] text-white rounded-lg hover:bg-[#0077b8] transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <FileText size={18} />
          New Report
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 ">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" /> Date:
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088D0] focus:border-transparent transition-all"
            />
          </div>
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-sm text-red-600 hover:text-red-700 hover:underline transition-colors"
            >
              Clear filter
            </button>
          )}
          <span className="text-sm text-gray-500 ml-auto bg-gray-50 px-3 py-1 rounded-full">
            Total {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0088D0] border-t-transparent"></div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FileText size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No reports found</p>
          <p className="text-sm text-gray-400 mt-1">
            {filterDate ? 'Try changing the date filter' : 'Start submitting your daily reports'}
          </p>
          <Link
            href="/dashboard/employee/reports/new"
            className="inline-block mt-4 text-[#0088D0] hover:text-[#0077b8] hover:underline transition-colors"
          >
            Submit your first report →
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Task Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Attachments
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Submitted Date
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.map((report, index) => (
                    <tr
                      key={report.id}
                      className="hover:bg-blue-50/50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-[#0088D0] flex-shrink-0" />
                          <span className="font-medium text-gray-800">
                            {report.tasks && report.tasks.length > 0
                              ? report.tasks[0]
                              : 'No tasks'}
                          </span>
                        </div>
                        {report.tasks && report.tasks.length > 1 && (
                          <span className="text-xs text-gray-400 ml-6">
                            +{report.tasks.length - 1} more tasks
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                          {report.taskDescription || 'No description'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          <Clock size={14} />
                          {report.hoursWorked}h
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {report.fileAttachments && report.fileAttachments.length > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <File size={14} className="text-purple-500" />
                            <span className="text-xs text-gray-500">
                              {report.fileAttachments.length}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {format(new Date(report.submittedAt || report.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => viewReport(report)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#0088D0] hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <Eye size={16} />
                          <span className="text-sm font-medium">View</span>
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
                Report Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Submitted Date</p>
                  <p className="font-medium text-gray-800 mt-1 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    {format(new Date(selectedReport.submittedAt || selectedReport.date), 'EEEE, MMM d, yyyy')}
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
                  <p className="text-sm text-gray-500 font-medium">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-1 ${selectedReport.status === 'submitted' || selectedReport.status === 'pending'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedReport.status === 'submitted' || selectedReport.status === 'pending'
                      ? 'bg-green-500'
                      : 'bg-red-500'
                      }`}></span>
                    {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Report Date</p>
                  <p className="font-medium text-gray-800 mt-1">
                    {format(new Date(selectedReport.date), 'MMM d, yyyy')}
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

              {/* Add Previous Task Description */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="w-1 h-5 bg-teal-500 rounded-full"></span>
                  Previous Task Description
                </h4>
                <div className="bg-teal-50/70 p-4 rounded-lg border border-teal-100">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedReport.previousTaskDescription || 'No description provided'}
                  </p>
                </div>
              </div>

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
              {/* File Attachments Section */}
              {selectedReport.fileAttachments && selectedReport.fileAttachments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                    File Attachments ({selectedReport.fileAttachments.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedReport.fileAttachments.map((file, i) => {
                      if (!file || !file.url) {
                        return null;
                      }

                      const fileUrl = file.url || '';
                      const fileName = file.name || 'Unknown file';

                      const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileUrl);
                      const isPdf = /\.pdf$/i.test(fileUrl);
                      const isWord = /\.(doc|docx)$/i.test(fileUrl);
                      const isExcel = /\.(xls|xlsx)$/i.test(fileUrl);
                      const isText = /\.(txt|csv|log)$/i.test(fileUrl);

                      return (
                        <a
                          key={i}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors group"
                        >
                          {isImage ? (
                            <Image size={20} className="text-purple-500" />
                          ) : isPdf ? (
                            <FileText size={20} className="text-red-500" />
                          ) : isWord ? (
                            <FileText size={20} className="text-blue-600" />
                          ) : isExcel ? (
                            <FileText size={20} className="text-green-600" />
                          ) : isText ? (
                            <FileText size={20} className="text-gray-500" />
                          ) : (
                            <File size={20} className="text-gray-500" />
                          )}
                          <span className="text-gray-700 group-hover:text-[#0088D0] transition-colors truncate flex-1">
                            {fileName}
                          </span>
                          <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">
                            View →
                          </span>
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