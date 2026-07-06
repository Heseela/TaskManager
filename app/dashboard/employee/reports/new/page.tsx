'use client';

import { useRouter } from 'next/navigation';
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
    <div className="">
      <DailyReportForm onSubmit={handleSubmit} />
    </div>
  );
}