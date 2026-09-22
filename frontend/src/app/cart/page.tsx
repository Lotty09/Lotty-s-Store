'use client';

import { useCart } from '@/context/CartContext';
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Looks like you haven't added any products yet.</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {cart.map((item) => (
              <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                
                {/* Product Image */}
                <div className="h-24 w-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                </div>
                
                {/* Product Details */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                  <p className="text-gray-500 mt-1 font-medium">Qty: {item.quantity}</p>
                </div>
                
                {/* Price & Remove */}
                <div className="text-xl font-extrabold text-gray-900">
                  ₦{(item.price * item.quantity).toFixed(2)}
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                  title="Remove item"
                >
                  <Trash2 size={20} />
                </button>

              </li>
            ))}
          </ul>
          
          {/* Checkout Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* The missing closing div was added below this block */}
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">Subtotal</p>
              <p className="text-3xl font-extrabold text-gray-900">₦{cartTotal.toFixed(2)}</p>
            </div>
            
            <Link 
              href="/checkout"
              className="w-full sm:w-auto bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-700 active:scale-95 transition-all shadow-sm text-center"
            >
              Proceed to Checkout
            </Link>
            
          </div>
        </div>

      </div>
    </div>
  );
}