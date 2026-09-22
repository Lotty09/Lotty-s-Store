'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      Cookies.set('token', response.data.token, { expires: 7 });
      
      if (response.data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Secure store setup</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <input required type="text" className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-black" onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <input required type="text" className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-black" onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email address</label>
            <input required type="email" className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-black" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <input required type="tel" className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-black" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input required type="password" className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-black" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}