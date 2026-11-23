'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import api from '@/lib/api';
import { Trash2, PlusCircle, Tags } from 'lucide-react';

type Category = {
  id: number;
  name: string;
  description: string | null;
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setError(null);

    try {
      const res = await api.get<Category[]>('/categories');
      setCategories(res.data);
    } catch (error: unknown) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchCategories();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchCategories]);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('A category name is required.');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      await api.post('/categories', {
        name: trimmedName,
        description: description.trim(),
      });
      setName('');
      setDescription('');
      await fetchCategories();
    } catch (error: unknown) {
      console.error('Failed to create category:', error);
      setError('Failed to create category. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    setDeletingId(id);
    setError(null);

    try {
      await api.delete(`/categories/${id}`);
      setCategories(currentCategories => currentCategories.filter(category => category.id !== id));
    } catch (error: unknown) {
      console.error('Failed to delete category:', error);
      setError('Failed to delete category. It may still be assigned to products.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-8">Loading categories...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Manage Categories</h2>
        <p className="mt-2 text-sm text-gray-600">Organize your store inventory.</p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-blue-600" /> New Category
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input id="category-name" required value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="e.g. Laptops" />
            </div>
            <div>
              <label htmlFor="category-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="category-description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600 outline-none resize-none" placeholder="Optional details..." />
            </div>
            <button type="submit" disabled={creating || deletingId !== null} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60">
              {creating ? 'Adding category...' : 'Add Category'}
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
                  type="button"
                  onClick={() => handleDelete(category.id)}
                  disabled={creating || deletingId !== null}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Delete category"
                  aria-label={`Delete ${category.name}`}
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
