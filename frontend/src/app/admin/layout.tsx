'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { LayoutDashboard, ShoppingBag, Tags, LogOut, ShieldAlert, Menu, Package } from 'lucide-react';
import Link from 'next/link';
import { Pacifico } from 'next/font/google';

const pacifico = Pacifico({ weight: '400', subsets: ['latin'] });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const cookieToken = Cookies.get('token');
    const localToken = localStorage.getItem('admin-token');
    
    if (!cookieToken && !localToken) {
      router.push('/auth');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('token');
    localStorage.removeItem('admin-token');
    router.push('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <ShieldAlert className="animate-pulse text-gray-400 mb-4" size={48} />
        <p className="text-gray-500 font-medium">Verifying access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Collapsible Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} shrink-0 bg-white shadow-md flex flex-col border-r border-gray-200 transition-all duration-300 ease-in-out relative`}>
        
        <div className={`p-6 border-b border-gray-200 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <h1 className={`${pacifico.className} text-3xl text-blue-600 tracking-wide whitespace-nowrap overflow-hidden`}>
              Lotty's <span className="text-gray-800">Admin</span>
            </h1>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors"
            title="Toggle Sidebar"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-x-hidden">
          <Link href="/admin" className={`flex items-center p-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`} title="Dashboard">
            <LayoutDashboard size={20} className="shrink-0" /> 
            {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
          </Link>
          
          {/* NEW: Orders Link */}
          <Link href="/admin/orders" className={`flex items-center p-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`} title="Orders">
            <Package size={20} className="shrink-0" /> 
            {!isCollapsed && <span className="whitespace-nowrap">Orders</span>}
          </Link>

          <Link href="/admin/categories" className={`flex items-center p-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`} title="Categories">
            <Tags size={20} className="shrink-0" /> 
            {!isCollapsed && <span className="whitespace-nowrap">Categories</span>}
          </Link>
          
          <Link href="/admin/products" className={`flex items-center p-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`} title="Products">
            <ShoppingBag size={20} className="shrink-0" /> 
            {!isCollapsed && <span className="whitespace-nowrap">Products</span>}
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className={`flex items-center p-3 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`} title="Logout">
            <LogOut size={20} className="shrink-0" /> 
            {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Dynamic Page Content */}
      <main className="flex-1 p-8 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}