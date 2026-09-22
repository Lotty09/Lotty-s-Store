'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Pacifico } from 'next/font/google';

const pacifico = Pacifico({ weight: '400', subsets: ['latin'] });

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;
        
      const response = await api.post(endpoint, payload);
      
      const token = response.data.token || response.data.accessToken;
      localStorage.setItem('admin-token', token);
      
      router.push('/admin');
    } catch (error) {
      console.error(error);
      alert(isLogin ? 'Login failed. Check credentials.' : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // NEW: Blue to Yellow gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-200 to-yellow-400 flex flex-col items-center justify-center p-4">
      
      <Link href="/" className={`${pacifico.className} mb-8 text-5xl text-black drop-shadow-md tracking-wide`}>
        Lotty's <span className="text-white">Store</span>
      </Link>

      <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-yellow-100 text-black rounded-full mb-3 shadow-sm">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-black">
            {isLogin ? 'Admin Login' : 'Register Admin'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* NEW: text-black explicitly applied to all inputs */}
                <input required name="firstName" onChange={handleChange} placeholder="First Name" className="w-full text-black placeholder-gray-500 border border-gray-300 bg-gray-50 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                <input required name="lastName" onChange={handleChange} placeholder="Last Name" className="w-full text-black placeholder-gray-500 border border-gray-300 bg-gray-50 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <input required name="phone" onChange={handleChange} placeholder="Phone Number" className="w-full text-black placeholder-gray-500 border border-gray-300 bg-gray-50 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </>
          )}
          
          <input required type="email" name="email" onChange={handleChange} placeholder="Email Address" className="w-full text-black placeholder-gray-500 border border-gray-300 bg-gray-50 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
          <input required type="password" name="password" onChange={handleChange} placeholder="Password" className="w-full text-black placeholder-gray-500 border border-gray-300 bg-gray-50 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />

          <button disabled={loading} type="submit" className="w-full bg-black text-white py-3.5 rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors shadow-md disabled:bg-gray-400">
            {loading ? 'Processing...' : (isLogin ? 'Secure Login' : 'Create Account')}
          </button>
        </form>

        <p className="text-center mt-6 text-sm font-medium text-black">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-extrabold hover:underline">
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
}