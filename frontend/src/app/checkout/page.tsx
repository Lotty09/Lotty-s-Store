'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import { ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePaystackPayment } from 'react-paystack';

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // NEW: Store the order ID after payment
  const [orderId, setOrderId] = useState<number | null>(null); 

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- PAYSTACK CONFIGURATION ---
  const paystackConfig = {
    reference: `LOTTY_${new Date().getTime().toString()}`,
    email: formData.customerEmail,
    // Paystack calculates in kobo, so we multiply Naira by 100
    amount: cartTotal * 100, 
    // Replace this with your ACTUAL Paystack Public Key later
    publicKey: 'pk_test_00d42013b646ba5bb50d90c6a3d88979d6cf79b3', 
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  // What happens when the payment is successful
  const onSuccess = async (reference: any) => {
    try {
      const payload = {
        ...formData,
        totalAmount: cartTotal,
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      // NEW: Save order to Fastify database and capture the returned ID
      const response = await api.post('/orders', payload);
      setOrderId(response.data.id);
      
      localStorage.removeItem('techstore-cart');
      setSuccess(true);
    } catch (error) {
      console.error('Database save failed:', error);
      alert('Payment successful, but order saving failed. Contact support.');
    } finally {
      setLoading(false);
    }
  };

  // What happens if the user closes the Paystack modal
  const onClose = () => {
    alert('Payment window closed.');
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Trigger Paystack Popup instead of instantly saving
    initializePayment({ onSuccess, onClose } as any);
  };

  // Success Screen (Also themed)
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white p-12 rounded-2xl shadow-2xl flex flex-col items-center text-center">
          <CheckCircle size={80} className="text-green-500 mb-6" />
          <h2 className="text-4xl font-extrabold text-black mb-2">Payment Successful!</h2>
          <p className="text-lg text-black font-medium mb-6 max-w-md">
            Thank you for shopping at Lotty's Store.
          </p>
          
          {/* NEW: Order Tracking ID Display */}
          <div className="bg-slate-100 border border-slate-300 p-6 rounded-xl w-full max-w-xs mb-8">
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Your Order ID</p>
            <p className="text-4xl font-extrabold text-blue-600">#{orderId}</p>
            <p className="text-xs text-slate-500 mt-2 font-medium">Save this ID to track your delivery</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link href="/track" className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center">
              Track Order
            </Link>
            <Link href="/" className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center">
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-black">Your cart is empty. <Link href="/" className="text-blue-600 underline">Go shopping</Link></p>
      </div>
    );
  }

  return (
    // NEW: Blue to Yellow background for checkout
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-200 to-yellow-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="text-black hover:text-white transition-colors bg-white/30 p-2 rounded-full backdrop-blur-sm">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-4xl font-extrabold text-black drop-shadow-md">Secure Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Checkout Form */}
          <div className="flex-1 bg-white p-8 rounded-2xl shadow-2xl border-none">
            <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-yellow-200 pb-4">Delivery Details</h2>
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Full Name</label>
                  <input required type="text" name="customerName" onChange={handleChange} className="w-full text-black bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Email Address</label>
                  <input required type="email" name="customerEmail" onChange={handleChange} className="w-full text-black bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400" placeholder="john@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">Phone Number</label>
                <input required type="tel" name="customerPhone" onChange={handleChange} className="w-full text-black bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400" placeholder="09012345678" />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">Full Delivery Address</label>
                <textarea required name="address" rows={3} onChange={handleChange} className="w-full text-black bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none placeholder-gray-400" placeholder="123 Tech Street, Lagos..."></textarea>
              </div>

            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-6 rounded-2xl shadow-2xl border-none sticky top-24">
              <h2 className="text-xl font-bold text-black mb-4">Order Summary</h2>
              
              <div className="max-h-64 overflow-y-auto mb-4 border-b-2 border-yellow-200 pb-4 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-black font-medium line-clamp-1 pr-4">{item.quantity}x {item.name}</span>
                    <span className="font-bold text-black">₦{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-black font-bold">Total to Pay</span>
                <span className="text-3xl font-extrabold text-blue-600">₦{cartTotal.toFixed(2)}</span>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? 'Processing...' : 'Pay with Paystack'}
                {!loading && <ShieldCheck size={20} />}
              </button>
              
              <p className="text-xs text-center text-black font-medium mt-4 flex items-center justify-center gap-1">
                <ShieldCheck size={14} className="text-green-600" /> Secured by Paystack
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}