'use client';

import { useState } from 'react';
import Card from '../ui/Card';
import { DailyReport } from '@/types';

interface SupervisorDashboardProps {
  reports: DailyReport[];
  onSendEmail: (reportId: string) => void;
}

export default function SupervisorDashboard({ reports }: SupervisorDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');

  const sortedReports = [...reports].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredReports = sortedReports.filter(report => {
    const dateMatch = selectedDate === 'all' || report.date === selectedDate;
    const employeeMatch = selectedEmployee === 'all' || report.userId === selectedEmployee;
    return dateMatch && employeeMatch;
  });

  const uniqueDates = [...new Map(reports.map(r => [r.date, r.date])).keys()].sort().reverse();

  const uniqueEmployees = [...new Map(reports.map(r => [r.userId, r.userName])).entries()]
    .map(([id, name]) => ({ id, name }));

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-gray-700 text-sm font-medium mb-1">Filter by Date</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
          >
            <option value="all">All Dates</option>
            {uniqueDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 text-sm font-medium mb-1">Filter by Employee</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088D0]"
          >
            <option value="all">All Employees</option>
            {uniqueEmployees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No reports found for the selected criteria</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {selectedDate === 'all' ? (
            Object.entries(
              filteredReports.reduce((acc, report) => {
                if (!acc[report.date]) acc[report.date] = [];
                acc[report.date].push(report);
                return acc;
              }, {} as Record<string, DailyReport[]>)
            ).map(([date, dateReports]) => (
              <div key={date}>

                <div className="space-y-4">
                  {dateReports.map(report => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onViewDetails={() => { }}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            filteredReports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onViewDetails={() => { }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: DailyReport; onViewDetails: () => void }) {
  return (
    <Card key={report.id} title={`${report.userName}'s Report`}>
      <div className="space-y-4">
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-700">{report.date}</p>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-gray-500">
                Submitted: {new Date(report.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            Tasks Completed
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {report.tasks.map((task, idx) => (
              <li key={idx} className="text-gray-600">{task}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Hours Worked</h4>
          <p className="text-gray-600">{report.hoursWorked} hours</p>
        </div>

        {report.challenges.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Challenges</h4>
            <p className="text-gray-600">{report.challenges}</p>
          </div>
        )}

        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Tomorrow's Plan</h4>
          <ul className="list-disc list-inside space-y-1">
            {report.tomorrowPlan.map((plan, idx) => (
              <li key={idx} className="text-gray-600">{plan}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}