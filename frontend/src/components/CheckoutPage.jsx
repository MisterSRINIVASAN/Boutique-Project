import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const { cartItems, getCartTotal } = useCart();
  const { user, token, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  const [address, setLocalAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const selectedItems = cartItems.filter(item => item.checked);
  const total = getCartTotal();
  
  // Calculate estimated delivery date (Today + 25 days)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 25);
  const deliveryStr = deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;
    
    setProcessing(true);
    setError('');
    
    const items = selectedItems.map(item => ({
      product_id: item.product_id,
      size_label: item.size_label,
      quantity: item.quantity
    }));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: user.email, address: address, items: items })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Checkout Failed');
      }
      
      const orderData = await res.json();
      
      // Clear purchased items
      const remainingItems = cartItems.filter(item => !item.checked);
      localStorage.setItem('boutique_cart', JSON.stringify(remainingItems));
      
      setTimeout(() => navigate('/success', { state: { order: orderData } }), 600);
      
    } catch(err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (!isLoggedIn) return null;

  if (selectedItems.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-serif text-gray-900 mb-4">No items selected for checkout</h2>
        <button onClick={() => navigate('/cart')} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-indigo-700 transition-all">Return to Cart</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
        <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">Finalize Purchase</h1>
        <div className="bg-amber-50 border border-amber-100 px-6 py-3 rounded-2xl flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-sm font-bold text-amber-800">Est. Dispatch: {deliveryStr}</span>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-12 gap-12">
        <form onSubmit={handleCheckout} className="lg:col-span-7 space-y-10">
          <section className="bg-white p-8 rounded-3xl border border-amber-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -z-10 opacity-50"></div>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-amber-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 font-serif">Shipping & Contact</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 ml-1">Contact Phone</label>
                <div className="px-5 py-4 bg-amber-50/30 border border-amber-100 rounded-2xl text-gray-900 font-bold flex items-center gap-3">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {user?.phone_number || 'Not provided - Edit in Profile'}
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 ml-1">Delivery Location</label>
                <textarea
                  required
                  rows="3"
                  value={address}
                  onChange={e => setLocalAddress(e.target.value)}
                  placeholder="Street address, City, State, ZIP..."
                  className="block w-full px-5 py-4 bg-amber-50/30 border border-amber-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold"
                ></textarea>
              </div>
            </div>
          </section>
          
          <section className="bg-white p-8 rounded-3xl border border-amber-50 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-amber-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 font-serif">Payment Option</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all 
                ${paymentMethod === 'Online' ? 'border-amber-600 bg-amber-50/30 ring-2 ring-amber-100' : 'border-gray-100 hover:border-gray-200'}`}>
                <input type="radio" name="payment" value="Online" checked={paymentMethod === 'Online'} onChange={e => setPaymentMethod(e.target.value)} className="h-5 w-5 text-amber-600 focus:ring-amber-500" />
                <div className="ml-4">
                  <span className="block font-bold text-gray-900">Online Gateway</span>
                  <span className="text-xs text-amber-600 font-bold uppercase tracking-widest mt-0.5 block">Secure & Fast</span>
                </div>
              </label>
              <label className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all 
                ${paymentMethod === 'COD' ? 'border-amber-600 bg-amber-50/30 ring-2 ring-amber-100' : 'border-gray-100 hover:border-gray-200'}`}>
                <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={e => setPaymentMethod(e.target.value)} className="h-5 w-5 text-amber-600 focus:ring-amber-500" />
                <div className="ml-4">
                  <span className="block font-bold text-gray-900">Cash on Delivery</span>
                  <span className="text-xs text-gray-400 font-medium font-bold">Pay at door</span>
                </div>
              </label>
            </div>
          </section>
          
          {error && <div className="text-red-500 font-bold p-5 bg-red-50 rounded-2xl border border-red-100">{error}</div>}
          
          <button 
            type="submit" 
            disabled={processing}
            className={`w-full py-5 px-4 rounded-full shadow-2xl text-xl font-black text-white transition-all transform hover:scale-[1.02]
              ${processing ? 'bg-amber-400 cursor-not-allowed opacity-75' : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-amber-200'}`}
          >
            {processing ? 'Processing Order...' : paymentMethod === 'Online' ? `Pay ₹${total.toLocaleString('en-IN')} & Confirm` : 'Place Your Order'}
          </button>
        </form>
        
        <div className="lg:col-span-5">
          <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white sticky top-28 shadow-2xl border border-gray-800">
            <h2 className="text-2xl font-serif font-bold mb-8 flex justify-between items-center">
              <span>Order Summary</span>
              <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-indigo-400 uppercase tracking-widest">{selectedItems.length} items</span>
            </h2>
            <ul className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedItems.map(item => (
                <li key={item.product_id+item.size_label} className="flex gap-4">
                  <div className="h-20 w-16 shrink-0 rounded-xl overflow-hidden border border-gray-800">
                    <img src={item.image || 'https://via.placeholder.com/100'} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-sm font-bold line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Size: {item.size_label} × {item.quantity}</p>
                    <p className="text-sm font-black text-indigo-400 mt-2">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-10 pt-10 border-t border-gray-800">
              <div className="flex justify-between items-center text-gray-400 mb-4">
                <span className="text-sm font-medium">Subtotal</span>
                <span className="font-bold">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400 mb-8">
                <span className="text-sm font-medium">Shipping</span>
                <span className="text-amber-400 font-bold uppercase tracking-widest text-xs">Free</span>
              </div>
              <div className="flex justify-between items-baseline pt-4 border-t border-gray-800">
                <span className="text-xl font-bold">Total Pay</span>
                <span className="text-4xl font-black text-amber-400">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <p className="mt-4 text-[10px] text-gray-600 uppercase tracking-widest text-center italic">Crafted with precision, delivered with care</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
