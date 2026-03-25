import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Homepage from './components/Homepage';
import ProductPage from './components/ProductPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrderSuccessPage from './components/OrderSuccessPage';

import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import UserLogin from './components/UserLogin';
import UserRegister from './components/UserRegister';
import UserOrders from './components/UserOrders';

function TopNav() {
  const { cartCount } = useCart();
  const { user, role, logout, isLoggedIn } = useAuth();
  
  return (
    <nav className="fixed top-4 inset-x-4 h-16 glass-vibrant rounded-2xl z-50 flex items-center justify-between px-6 shadow-2xl transition-all hover:bg-white/80">
      <Link to="/" className="text-2xl font-serif text-gray-900 font-extrabold tracking-tight group">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 group-hover:from-orange-500 group-hover:via-pink-600 group-hover:to-purple-600 transition-all duration-1000 bg-[length:200%_auto] animate-gradient">Attire By Sush</span>
      </Link>
      <div className="flex items-center gap-6">
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-widest font-black text-purple-400 hidden sm:block">Hello, {user?.name || (role === 'admin' ? 'Admin' : 'User')}</span>
            {role === 'user' && <Link to="/orders" className="text-xs font-black text-gray-500 hover:text-pink-600 transition-colors uppercase tracking-tight">Orders</Link>}
            {role === 'admin' && <Link to="/admin" className="text-xs font-black text-purple-600 hover:text-purple-700 transition-colors uppercase tracking-tight">Admin</Link>}
            <button onClick={logout} className="text-xs font-black text-red-400 hover:text-red-500 transition-colors uppercase tracking-tight">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="text-xs font-black text-gray-600 hover:text-pink-600 transition-colors uppercase tracking-tight">Sign In</Link>
        )}
        <Link to="/cart" className="relative group">
          <div className="p-2 rounded-xl hover:bg-white/50 transition-all duration-300">
            <svg className="w-5 h-5 text-gray-700 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-pink-500 to-purple-600 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-lg animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
        </Link>
      </div>
    </nav>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen font-sans text-[#1A1A1A] selection:bg-pink-100 selection:text-pink-900 overflow-x-hidden">
            <TopNav />
            {/* Ambient Background Elements - Totally Colorful */}
            <div className="fixed -top-[10%] -left-[10%] w-[50%] h-[50%] bg-pink-200/40 blur-[150px] rounded-full -z-10 pointer-events-none animate-pulse"></div>
            <div className="fixed top-[20%] right-[0%] w-[40%] h-[40%] bg-purple-200/30 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
            <div className="fixed -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-orange-100/40 blur-[180px] rounded-full -z-10 pointer-events-none"></div>
            <div className="fixed bottom-[10%] left-[10%] w-[30%] h-[30%] bg-blue-100/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

            <div className="pt-28 pb-20">
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/login" element={<UserLogin />} />
                <Route path="/register" element={<UserRegister />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<UserOrders />} />
                <Route path="/success" element={<OrderSuccessPage />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
