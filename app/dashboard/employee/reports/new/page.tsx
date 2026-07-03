'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DailyReportForm from '@/components/dashboard/employee/DailyReportForm';

export default function NewReportPage() {
  const router = useRouter();

  const handleSubmit = async (reportData: any) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }

      toast.success('Report submitted successfully!');
      router.push('/dashboard/employee/reports');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/employee/reports"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Submit New Report</h1>
          <p className="text-gray-500 mt-1">Record your daily work activities</p>
        </div>
      </div>

      <DailyReportForm onSubmit={handleSubmit} />
    </div>
  );
}