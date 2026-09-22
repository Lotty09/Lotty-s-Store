'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Trash2, PlusCircle, Tags } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/categories', { name, description });
      setName('');
      setDescription('');
      fetchCategories();
    } catch (error) {
      alert('Failed to create category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (error: any) {
      // Show the backend error if products are attached
      alert(error.response?.data?.error || 'Failed to delete category');
    }
  };

  if (loading) return <div className="p-8">Loading categories...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Manage Categories</h2>
        <p className="mt-2 text-sm text-gray-600">Organize your store inventory.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-blue-600" /> New Category
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="e.g. Laptops" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600 outline-none resize-none" placeholder="Optional details..." />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors">
              Add Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 space-y-4">
          {categories.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl border border-gray-200">
              <Tags size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No categories created yet.</p>
            </div>
          ) : (
            categories.map(category => (
              <div key={category.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center group hover:border-blue-300 transition-colors">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{category.description || 'No description'}</p>
                </div>
                <button 
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                  title="Delete category"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}