'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Pacifico } from 'next/font/google';

const pacifico = Pacifico({ weight: '400', subsets: ['latin'] });

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { cartCount } = useCart(); 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Public Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="text-blue-600" size={28} />
            <span className={`${pacifico.className} text-3xl text-gray-900 tracking-wide`}>Lotty's <span className="text-blue-600">Store</span></span>
          </Link>
          
          <nav className="flex items-center gap-6">
            {/* NEW: Track Order Link */}
            <Link href="/track" className="text-sm font-extrabold text-blue-700 hover:text-blue-900 transition-colors uppercase tracking-wider">
              Track Order
            </Link>

            {/* Live Cart Icon */}
            <Link href="/cart" className="flex items-center gap-2 text-gray-900 hover:opacity-80 transition-opacity">
              <ShoppingCart size={24} />
              <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full transition-all">
                {cartCount}
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Latest Arrivals</h1>
          <p className="mt-2 text-lg text-gray-600">Discover our newest inventory.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      
    </div>
  );
}