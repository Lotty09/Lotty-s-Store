"use client";

import dynamic from 'next/dynamic';

const CheckoutClient = dynamic(() => import('./CheckoutClient'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-xl font-bold text-gray-500 animate-pulse">Loading secure checkout...</p>
    </div>
  )
});

export default function CheckoutPage() {
  return <CheckoutClient />;
}