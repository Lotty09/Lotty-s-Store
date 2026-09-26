import dynamic from 'next/dynamic';

// This tells Next.js to NEVER run this component on the server during build time.
// It will only load in the user's browser.
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