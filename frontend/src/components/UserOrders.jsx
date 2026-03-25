import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/orders/mine', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          if (res.status === 401) {
            logout();
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch orders');
        }
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, isLoggedIn, navigate, logout]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500 font-medium">Loading your orders...</div>;
  
  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-red-500 font-bold mb-4">{error}</p>
      <button onClick={() => window.location.reload()} className="text-indigo-600 font-bold hover:underline">Try Again</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-vibrant w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative animate-slideUp border border-white/40">
             <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center font-black hover:scale-110 transition-all z-10"
             >✕</button>
             
             <div className="p-10 overflow-y-auto custom-scrollbar">
                <div className="mb-10 text-center">
                  <p className="text-vibrant-gradient text-[10px] font-black uppercase tracking-[0.4em] mb-2">Order Specifics</p>
                  <h2 className="text-3xl font-serif font-black text-gray-900 tracking-tight">#{selectedOrder.id}</h2>
                  <div className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-white/50 rounded-full border border-gray-100">
                     <div className={`h-2 w-2 rounded-full ${selectedOrder.status.includes('Placed') ? 'bg-amber-400' : 'bg-green-500'}`}></div>
                     <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{selectedOrder.status}</span>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="glass p-8 rounded-[2rem] border-white/60">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Delivery Instruction</h4>
                      <p className="text-sm font-bold text-gray-800 leading-relaxed">{selectedOrder.address}</p>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Your Items</h4>
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="glass p-6 rounded-[2rem] flex flex-col md:flex-row gap-6 border-white/60 group hover:bg-white/40 transition-all">
                           <div className="h-24 w-20 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 border border-white/80">
                              <div className="h-full w-full flex items-center justify-center text-indigo-300">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10z" /></svg>
                              </div>
                           </div>
                           <div className="flex-1 space-y-3">
                              <div className="flex justify-between items-start">
                                 <div>
                                   <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Product ID: {item.product_id}</p>
                                   <p className="text-sm font-bold text-gray-900">Size: {item.size_label} (Qty: {item.quantity})</p>
                                 </div>
                                 <p className="text-sm font-black text-gray-900">₹{item.price.toLocaleString()}</p>
                              </div>
                              
                              <div className="pt-3 border-t border-gray-100/50 flex flex-wrap gap-4">
                                 <div className="space-y-0.5"><p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Chest</p><p className="text-[11px] font-black text-gray-900">{item.chest}"</p></div>
                                 <div className="space-y-0.5"><p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Waist</p><p className="text-[11px] font-black text-gray-900">{item.waist}"</p></div>
                                 <div className="space-y-0.5"><p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Hip</p><p className="text-[11px] font-black text-gray-900">{item.hip}"</p></div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="bg-colorful-gradient p-8 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Value</p>
                        <p className="text-2xl font-black italic">Fully Authorized</p>
                      </div>
                      <p className="text-3xl font-black">₹{selectedOrder.total.toLocaleString()}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-baseline mb-12">
        <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">Your Orders</h1>
        <p className="text-sm font-medium text-gray-500">{orders.length} orders placed</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-16 rounded-[2.5rem] border border-gray-100 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">No orders yet</h2>
          <p className="text-gray-500 max-w-sm mx-auto">You haven't placed any orders with Attire By Sush yet. Start exploring our latest коллекции!</p>
          <Link to="/" className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 shadow-indigo-100">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:border-indigo-100 group">
              <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-10">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Placed</p>
                    <p className="text-sm font-bold text-gray-700">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-sm font-bold text-indigo-600">₹{order.total.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ship To</p>
                    <p className="text-sm font-bold text-gray-700 truncate max-w-[150px]">{order.address}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-right">Order ID</p>
                  <p className="text-sm font-mono font-bold text-gray-900">#{order.id}</p>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${order.status.includes('Placed') ? 'bg-amber-400' : 'bg-green-500'}`}></div>
                      <h3 className="text-lg font-bold text-gray-900">{order.status}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                          <div className="h-16 w-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                             {/* Image placeholder for simplicity in history */}
                             <div className="h-full w-full flex items-center justify-center text-indigo-200">
                               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10z" /></svg>
                             </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">Product ID: {item.product_id}</p>
                            <p className="text-xs text-gray-500">Size: {item.size_label} | Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="md:border-l md:pl-8 flex flex-col justify-center min-w-[200px] space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Est. Dispatch</p>
                      <p className="text-sm font-bold text-indigo-700">{order.dispatch_date}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="w-full py-3 px-4 rounded-xl border-2 border-gray-900 text-xs font-bold text-gray-900 hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      View full details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
