'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function ProductDetailsPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${params.id}`);
        setProduct(res.data);
        if (res.data.images && res.data.images.length > 0) {
          setActiveImage(res.data.images[0].url);
        }
      } catch (error) {
        console.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-red-500">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 transition-colors">
        <ArrowLeft size={20} /> Back to store
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery Section */}
        <div className="space-y-4">
          <div className="h-96 md:h-[500px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
            )}
          </div>
          
          {/* Thumbnails row */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img: any, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(img.url)}
                  className={`h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img.url ? 'border-blue-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col">
          <span className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
            {product.category?.name || 'Uncategorized'}
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-3xl font-black text-gray-900 mb-6">₦{product.price.toFixed(2)}</p>
          
          <div className="prose text-gray-600 mb-8">
            <p>{product.description || 'No description available for this product.'}</p>
          </div>

          <div className="mt-auto space-y-4">
            <p className="text-sm text-gray-500">
              Availability: <span className="font-semibold text-green-600">{product.stockQuantity} in stock</span>
            </p>
            <button 
              onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image: activeImage, quantity: 1 })}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 px-8 rounded-xl hover:bg-gray-800 active:scale-95 transition-all font-bold text-lg"
            >
              <ShoppingCart size={24} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}