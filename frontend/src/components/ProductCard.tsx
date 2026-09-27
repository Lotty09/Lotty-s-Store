'use client';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductImage { url: string; }
interface Product {
  id: number; name: string; price: number; category: { name: string }; images: ProductImage[];
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  
  // CHANGED: Cloudinary already returns a full 'https://...' URL.
  // We no longer need to prefix it with localhost:3001.
  const imageUrl = product.images?.[0]?.url || null;

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      quantity: 1
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-56 bg-gray-100 relative w-full">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="object-cover w-full h-full" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">No Image</div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          {product.category?.name || 'Uncategorized'}
        </span>
        
        {/* Added a subtle UI indicator if a product has multiple images */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{product.name}</h3>
          {product.images && product.images.length > 1 && (
             <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full whitespace-nowrap ml-2">
               {product.images.length} photos
             </span>
          )}
        </div>

        <p className="text-xl font-extrabold text-gray-900 mt-auto mb-4">₦{product.price.toFixed(2)}</p>
        
        {/* Button now triggers the context */}
        <button onClick={handleAdd} className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 px-4 rounded-lg hover:bg-gray-800 active:scale-95 transition-all font-medium">
          <ShoppingCart size={18} /> Add to Cart
        </button>
      </div>
    </div>
  );
}