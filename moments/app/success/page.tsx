'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Sidebar from '@/components/dashboard/SideBar';
import { Button } from '@/components/ui/button';
import { HTTP_BACKEND } from '@/utils/config';
import axios from 'axios';
import { Header } from '@/components/landing/Header';

interface orderDetails {
    order_id: string;
    project_id: string;
    amount: number;
    status: string;
    shipping_address?: {
        name: string;
        line1: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
}
export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isSignedIn, getToken } = useAuth();
    const [orderDetails, setOrderDetails] = useState<orderDetails | null>(null);
    const [printStatus, setPrintStatus] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const order_id = searchParams?.get('order_id');
    const project_id = searchParams?.get('project_id');


    useEffect(() => {
        const fetchOrderDetails = async () => {
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

                // Fetch order details from backend
                const response = await axios.get(`${HTTP_BACKEND}/api/order?order_id=${order_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrderDetails(response.data);
                // Step 2: Trigger print job via backend
                const printResponse = await axios.post(
                    `${HTTP_BACKEND}/api/print/${project_id}`,
                    { order_id },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setPrintStatus(`Print job created successfully! Job ID: ${printResponse.data.print_job_id}`);
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError('Failed to load order details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [order_id, isSignedIn, getToken, project_id]);

    const handleReturnToDashboard = () => {
        router.push(project_id ? `/dashboard/${project_id}` : '/');
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <div className="flex-1 p-6 text-center mt-10">Loading order details...</div>
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
                        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Order Confirmed!</h1>
                        <p className="text-lg text-gray-600 mb-6 text-center">
                            Thank you for your purchase. Your Memory Lane book has been successfully ordered and is being prepared for printing.
                        </p>

                        {orderDetails ? (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Details</h2>
                                <div className="space-y-2">
                                    <p>
                                        <span className="font-medium">Order ID:</span> {orderDetails.order_id}
                                    </p>
                                    <p>
                                        <span className="font-medium">Project ID:</span> {orderDetails.project_id}
                                    </p>
                                    <p>
                                        <span className="font-medium">Amount:</span> ₹{orderDetails.amount / 100}
                                    </p>
                                    <p>
                                        <span className="font-medium">Status:</span>{' '}
                                        {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 mb-8 text-center">Order details are being processed...</p>
                        )}

                        {printStatus ? (
                            <p className="text-green-600 mb-8 text-center">{printStatus}</p>
                        ) : (
                            <p className="text-gray-500 mb-8 text-center">Initiating print job...</p>
                        )}

                        <div className="flex justify-center">
                            <Button
                                onClick={handleReturnToDashboard}
                                className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                            >
                                Return to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
