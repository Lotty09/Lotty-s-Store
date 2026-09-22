'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Search, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Pacifico } from 'next/font/google';

const pacifico = Pacifico({ weight: '400', subsets: ['latin'] });

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      // Remove any '#' the user might have typed by accident
      const cleanId = orderId.replace('#', '').trim();
      const response = await api.post('/orders/track', { 
        orderId: cleanId, 
        email: email.trim() 
      });
      setOrderData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to find order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-20">
      
      <Link href="/" className={`${pacifico.className} mb-8 text-5xl text-black drop-shadow-md tracking-wide`}>
        Lotty's <span className="text-white">Store</span>
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-none">
        
        <div className="flex items-center gap-3 mb-6 border-b-2 border-yellow-200 pb-4">
          <Link href="/" className="text-black hover:text-blue-600 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-2xl font-bold text-black">Track Order</h2>
        </div>

        {!orderData ? (
          <form onSubmit={handleTrack} className="space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-700 text-sm font-bold rounded-lg border border-red-200">{error}</div>}
            
            <div>
              <label className="block text-sm font-bold text-black mb-1">Order ID</label>
              <input required type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. 15" className="w-full text-black bg-gray-50 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-black mb-1">Email Address</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="The email used at checkout" className="w-full text-black bg-gray-50 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-black text-white py-3.5 rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors shadow-md disabled:bg-gray-400 flex items-center justify-center gap-2 mt-2">
              {loading ? 'Searching...' : 'Track Package'} <Search size={20} />
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Package size={32} className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-500 font-bold">Order #{orderData.id}</p>
                {/* Assumes your Prisma order model has a status field, defaults to pending if not */}
                <p className="text-xl font-extrabold text-black uppercase tracking-wide">
                  {orderData.status || 'PENDING'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-black border-b border-gray-200 pb-2 mb-3">Order Details</h3>
              <p className="text-sm text-gray-700"><strong>Name:</strong> {orderData.customerName}</p>
              <p className="text-sm text-gray-700"><strong>Address:</strong> {orderData.address}</p>
              <p className="text-sm text-gray-700 mt-2"><strong>Total Paid:</strong> ₦{orderData.totalAmount.toFixed(2)}</p>
            </div>

            <button onClick={() => setOrderData(null)} className="w-full bg-gray-100 text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors border border-gray-300">
              Track Another Order
            </button>
          </div>
        )}

      </div>
    </div>
  );
}