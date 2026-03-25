import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, toggleCheck, setAllChecked } = useCart();
  const navigate = useNavigate();
  
  const total = getCartTotal();
  const allChecked = cartItems.length > 0 && cartItems.every(item => item.checked);
  const selectedCount = cartItems.filter(item => item.checked).length;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-serif text-gray-900 mb-6">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-10">Looks like you haven't added any premium styles to your cart yet.</p>
        <Link to="/" className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-all shadow-sm">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-baseline justify-between mb-10">
        <h1 className="text-4xl font-serif font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-sm text-gray-500">{cartItems.length} items in total</p>
      </div>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-3 py-4 border-b border-gray-200 mb-2">
            <input 
              type="checkbox" 
              checked={allChecked}
              onChange={(e) => setAllChecked(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">Select All ({cartItems.length})</span>
          </div>

          <ul className="divide-y divide-gray-100">
            {cartItems.map((item, idx) => (
              <li key={`${item.product_id}-${item.size_label}-${idx}`} className="flex py-8 group">
                <div className="flex items-center pr-6">
                  <input 
                    type="checkbox" 
                    checked={item.checked}
                    onChange={() => toggleCheck(item.product_id, item.size_label)}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="shrink-0 w-24 h-32 sm:w-32 sm:h-40 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm relative">
                  <img src={item.image || 'https://via.placeholder.com/200x300'} alt={item.name} className="w-full h-full object-cover"/>
                  {!item.checked && <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>}
                </div>
                
                <div className="ml-6 flex flex-1 flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                        <Link to={`/product/${item.product_id}`}>{item.name}</Link>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 font-medium">Size: <span className="text-gray-900">{item.size_label}</span></p>
                      <p className="mt-2 text-xl font-bold text-gray-900">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product_id, item.size_label)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                      <button 
                        onClick={() => updateQuantity(item.product_id, item.size_label, item.quantity - 1)}
                        className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                      >-</button>
                      <span className="px-4 py-1 text-sm font-bold min-w-[40px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product_id, item.size_label, item.quantity + 1)}
                        className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                      >+</button>
                    </div>
                    <p className="text-sm font-medium text-gray-400">Total: <span className="text-gray-900 font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span></p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-16 rounded-3xl bg-gray-50 px-6 py-8 sm:p-10 lg:col-span-4 lg:mt-0 border border-gray-100 shadow-sm sticky top-24 h-fit">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-5">Order Summary</h2>
          <dl className="mt-8 space-y-6">
            <div className="flex justify-between text-gray-600">
              <dt className="text-sm">Selected Items ({selectedCount})</dt>
              <dd className="text-sm font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</dd>
            </div>
            <div className="flex justify-between text-gray-600">
              <dt className="text-sm">Shipping</dt>
              <dd className="text-green-600 font-bold text-sm uppercase tracking-wider">Free</dd>
            </div>
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-between items-baseline">
                <dt className="text-lg font-bold text-gray-900">Grant Total</dt>
                <dd className="text-3xl font-black text-indigo-600">₹{total.toLocaleString('en-IN')}</dd>
              </div>
              <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest text-right">Taxes included</p>
            </div>
          </dl>
          
          <button 
            onClick={() => navigate('/checkout')}
            disabled={selectedCount === 0}
            className={`w-full mt-10 px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2
              ${selectedCount === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] shadow-indigo-100'
              }`}
          >
            <span>Proceed to Buy</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
          
          <p className="mt-6 text-center text-xs text-gray-400 font-medium">100% Secure Checkout Guaranteed</p>
        </div>
      </div>
    </div>
  );
}
