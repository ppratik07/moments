'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Sidebar from '@/components/dashboard/SideBar';
import { Button } from '@/components/ui/button';
import { HTTP_BACKEND } from '@/utils/config';
import axios from 'axios';
import { Header } from '@/components/landing/Header';

const FailurePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, getToken } = useAuth();
  const [paymentDetails, setPaymentDetails] = useState<{
    order_id: string;
    project_id: string;
    status: string;
    error_message?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const order_id = searchParams?.get('order_id');
  const project_id = searchParams?.get('project_id');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!order_id || !isSignedIn) {
        setError('Invalid order ID or authentication required');
        setIsLoading(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Failed to obtain authentication token');
        }

        // Fetch payment details from backend
        const response = await axios.get(`${HTTP_BACKEND}/api/order?order_id=${order_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPaymentDetails(response.data);
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError('Failed to load payment details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [order_id, isSignedIn, getToken]);

  const handleRetryPayment = () => {
    if (project_id) {
      router.push(`/dashboard/${project_id}`);
    } else {
      router.push('/');
    }
  };

  const handleReturnToHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex-1 p-6 text-center mt-10">Loading payment details...</div>
      </div>
    );
  }

  if (error || !order_id) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex-1 p-6 text-center mt-10 text-red-600">{error || 'Invalid order ID'}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col">
      <Header isSignedIn={isSignedIn ?? false} />
      <div className="flex flex-1">
        {project_id && <Sidebar projectId={project_id} />}
        <div className="flex-1 ml-0 md:ml-[2rem] p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 mt-10">
            <h1 className="text-3xl font-bold text-red-600 mb-4 text-center">Payment Failed</h1>
            <p className="text-lg text-gray-600 mb-6 text-center">
              We’re sorry, but there was an issue processing your payment. Please try again or contact support if the problem persists.
            </p>

            {paymentDetails ? (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Payment Details</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Order ID:</span> {paymentDetails.order_id}
                  </p>
                  {paymentDetails.project_id && (
                    <p>
                      <span className="font-medium">Project ID:</span> {paymentDetails.project_id}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    {paymentDetails.status.charAt(0).toUpperCase() + paymentDetails.status.slice(1)}
                  </p>
                  {paymentDetails.error_message && (
                    <p>
                      <span className="font-medium">Error:</span> {paymentDetails.error_message}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 mb-8 text-center">Unable to retrieve payment details.</p>
            )}

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleRetryPayment}
                className="px-6 py-2 text-white bg-amber-600 rounded hover:bg-amber-700"
              >
                Retry Payment
              </Button>
              <Button
                onClick={handleReturnToHome}
                className="px-6 py-2 text-white bg-gray-600 rounded hover:bg-gray-700"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailurePage;