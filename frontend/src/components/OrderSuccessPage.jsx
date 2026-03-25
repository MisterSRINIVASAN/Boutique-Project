import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';

export default function OrderSuccessPage() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
        <div className="bg-green-500 px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -tr-translate-x-4 -translate-y-4 opacity-10">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-48 h-48 text-white"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"/></svg>
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white text-green-500 mb-4 shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M20 6L9 17L4 12"/></svg>
          </div>
          <h2 className="text-3xl font-serif font-bold text-white mb-2">Order Confirmed</h2>
          <p className="text-green-100 font-medium">Thank you for shopping with Attire By Sush</p>
        </div>
        
        <div className="px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-xl mb-8 border border-gray-100">
            <div className="text-center sm:text-left mb-2 sm:mb-0">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Order ID</p>
              <p className="text-lg font-bold text-indigo-600 mt-1">{order.id}</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Est. Dispatch</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{order.dispatch_date}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Shipping To</h3>
              <p className="text-gray-900 font-medium leading-relaxed bg-gray-50 p-4 rounded-lg">{order.address}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Billing Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-100">
                <span className="text-gray-600 font-medium">Total Price Paid</span>
                <span className="text-xl font-bold text-gray-900">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-10 border-t border-dashed border-gray-300 pt-8 text-center">
            <p className="text-sm text-gray-500 mb-6 font-medium">We've sent an email and SMS confirmation with these details.</p>
            <Link to="/" className="inline-block bg-gray-900 text-white font-medium px-8 py-3 rounded-full hover:bg-gray-800 transition-all shadow-md">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
