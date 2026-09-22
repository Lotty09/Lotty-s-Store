'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Package, DollarSign, ListTree, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes, categoriesRes] = await Promise.all([
          api.get('/orders'),
          api.get('/products'),
          api.get('/categories')
        ]);
        
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      // Optimistically update UI
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // FIXED: Switched to api.put to prevent CORS Network Errors
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update order status. Please refresh and try again.');
    }
  };

  const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="mt-2 text-sm text-gray-600">Monitor your store's inventory and recent orders.</p>
      </div>

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-lg"><DollarSign size={28} /></div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">₦{totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-lg"><Package size={28} /></div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Products</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-lg"><ListTree size={28} /></div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Categories</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{categories.length}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Clock size={20} /> Recent Orders</h3>
        </div>
        
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders have been placed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Order ID</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Customer</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Contact</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{order.customerName}</div>
                      <div className="text-gray-500 text-xs truncate max-w-[200px]">{order.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{order.customerEmail}</div>
                      <div className="text-gray-500 text-xs">{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2 py-1.5 border-2 outline-none cursor-pointer transition-colors ${
                          order.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200 text-yellow-800 focus:border-yellow-400' : 
                          order.status === 'PAID' ? 'bg-blue-50 border-blue-200 text-blue-800 focus:border-blue-400' :
                          order.status === 'SHIPPED' ? 'bg-purple-50 border-purple-200 text-purple-800 focus:border-purple-400' :
                          'bg-green-50 border-green-200 text-green-800 focus:border-green-400'
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-gray-900">
                      ₦{order.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}