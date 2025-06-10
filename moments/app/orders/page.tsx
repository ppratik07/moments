import React from 'react';
import { Header } from '../../components/landing/Header';
export default function OrdersPage() {
    
    return (
        <div>
            <Header isSignedIn />
            <div className="grid sm:px-10 lg:grid-cols-2 lg:px-20 xl:px-32">
                <div className="px-4 pt-8 flex flex-col items-center">
                    <p className="text-xl font-medium mb-2">Order Summary</p>
                    <p className="text-gray-400 mb-8 text-center">Check out all the image pdf listed which you have paid for.</p>
                    <div className="w-full max-w-md space-y-3 rounded-lg border bg-white px-2 py-4 sm:px-6">
                        <div className="flex flex-col rounded-lg bg-white sm:flex-row">
                            <img className="m-2 h-24 w-28 rounded-md border object-cover object-center" src="https://images.unsplash.com/flagged/photo-1556637640-2c80d3201be8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8c25lYWtlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60" alt="" />
                            <div className="flex w-full flex-col px-4 py-4">
                                <span className="font-semibold">Nike Air Max Pro 8888 - Super Light</span>
                                <span className="float-right text-gray-400">42EU - 8.5US</span>
                                <p className="text-lg font-bold">₹138.99</p>
                            </div>
                        </div>
                        <div className="flex flex-col rounded-lg bg-white sm:flex-row">
                            <img className="m-2 h-24 w-28 rounded-md border object-cover object-center" src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8c25lYWtlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60" alt="" />
                            <div className="flex w-full flex-col px-4 py-4">
                                <span className="font-semibold">Nike Air Max Pro 8888 - Super Light</span>
                                <span className="float-right text-gray-400">42EU - 8.5US</span>
                                <p className="mt-auto text-lg font-bold">₹238.99</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}