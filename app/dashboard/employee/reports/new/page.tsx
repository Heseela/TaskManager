'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import DailyReportForm from '@/components/dashboard/employee/DailyReportForm';

export default function NewReportPage() {
  const router = useRouter();

  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleSubmit = async (reportData: any) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }

      toast.success('Report submitted successfully!');
      router.push('/dashboard/employee/reports');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to submit report'
      );
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto mb-5 flex items-center justify-between">
        <button
          onClick={() => setShowCancelModal(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>

      <DailyReportForm onSubmit={handleSubmit} />

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_25px_60px_rgba(0,0,0,0.25)] animate-in zoom-in-95 duration-200">

            <div className="p-8">

              {/* Icon */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-[#0088D0]/15 to-[#981E52]/15 ring-8 ring-[#0088D0]/5">
                <AlertTriangle className="h-8 w-8 text-[#981E52]" />
              </div>

              <h2 className="mt-6 text-center text-xl font-bold text-gray-900">
                Leave this page?
              </h2>

              <p className="mt-3 text-center text-sm leading-6 text-gray-500">
                You have unsaved changes in this report.
                <br />
                If you go back now, everything you've entered will be permanently lost.
              </p>

              <div className="my-7 h-px bg-gray-100" />

              <div className="flex gap-3">

                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-2 font-semibold text-gray-700 transition-all duration-200 hover:border-[#0088D0]/30 hover:bg-[#0088D0]/5 hover:text-[#0088D0]"
                >
                  Continue Editing
                </button>

                <button
                  onClick={() => router.push('/dashboard/employee/reports')}
                  className="flex-1 rounded-xl bg-linear-to-r from-[#981E52] to-[#B12463] py-2 font-semibold text-white shadow-lg shadow-[#981E52]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#981E52]/35"
                >
                  Leave Page
                </button>

              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}