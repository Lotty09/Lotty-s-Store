'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders');
    } finally {
      setFetching(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      // Update the UI immediately without reloading
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SHIPPED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Order Management</h2>
        <p className="mt-2 text-sm text-gray-600">Track and update customer purchases.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {fetching ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders have been placed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Order ID</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Customer Details</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Items</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-gray-500 text-xs">{order.customerEmail}</div>
                      <div className="text-gray-500 text-xs mt-1 max-w-[200px] truncate" title={order.address}>
                        {order.address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 max-w-[200px]">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="truncate">
                            {item.quantity}x {item.product?.name || 'Unknown Product'}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">
                      ₦{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {order.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status || 'PENDING'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
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