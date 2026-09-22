'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
// IMPORTED Trash2 icon for the delete button
import { Plus, ShoppingBag, Tag, Image as ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface Category { id: number; name: string; }
interface ProductImage { url: string; }
interface Product {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  category: { name: string };
  images: ProductImage[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', originalPrice: '', stockQuantity: '', categoryId: '', sku: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      if (categoriesRes.data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: categoriesRes.data[0].id.toString() }));
      }
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stockQuantity: parseInt(formData.stockQuantity),
        categoryId: parseInt(formData.categoryId)
      };

      const productRes = await api.post('/products', payload);
      const newProductId = productRes.data.id;

      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        await api.post(`/products/${newProductId}/image`, imageFormData);
      }
      
      fetchData();
      setFormData(prev => ({ ...prev, name: '', description: '', price: '', originalPrice: '', stockQuantity: '', sku: '' }));
      setImageFile(null);
      (document.getElementById('image-upload') as HTMLInputElement).value = '';
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process product');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Delete handling function
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete product. Ensure it is not linked to existing orders.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Products</h2>
        <p className="mt-2 text-sm text-gray-600">Manage your store's inventory and pricing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-1 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Plus size={20} className="text-blue-600" /> Add New Product
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Image</label>
              <input 
                id="image-upload"
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md p-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select required value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-black">
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₦)</label>
                <input required type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input required type="number" value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
              {loading ? 'Saving...' : 'Save Product & Image'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <ShoppingBag size={20} className="text-blue-600" /> Inventory List
          </h3>

          {fetching ? (
            <p className="text-gray-500 text-sm animate-pulse">Loading products...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 table-fixed">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      
                      <td className="px-4 py-3 whitespace-nowrap" style={{ width: '96px' }}>
                        {product.images && product.images.length > 0 ? (
                          <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', flexShrink: 0 }}>
                            <img 
                              src={product.images[0].url} 
                              alt={product.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          </div>
                        ) : (
                          <div style={{ width: '64px', height: '64px', borderRadius: '8px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', border: '1px solid #e5e7eb', flexShrink: 0 }}>
                            <ImageIcon size={24} />
                          </div>
                        )}
                      </td>
                      
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 truncate">{product.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                          <Tag size={12} /> {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₦{product.price.toFixed(2)}</td>
                      
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Product"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}