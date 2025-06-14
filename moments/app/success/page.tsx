import SuccessPageContent from '@/components/success/SuccessPageContent';
import { Suspense } from 'react';
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex-1 p-6 text-center mt-10">Loading...</div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}