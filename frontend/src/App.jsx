import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';

const Homepage = lazy(() => import('./components/Homepage'));
const ProductPage = lazy(() => import('./components/ProductPage'));
const CategoryPage = lazy(() => import('./components/CategoryPage'));
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const CartPage = lazy(() => import('./components/CartPage'));
const CheckoutPage = lazy(() => import('./components/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./components/OrderSuccessPage'));
const UserLogin = lazy(() => import('./components/UserLogin'));
const UserRegister = lazy(() => import('./components/UserRegister'));
const UserOrders = lazy(() => import('./components/UserOrders'));
const FavoritesPage = lazy(() => import('./components/FavoritesPage'));

function TopNav() {
  const { cartCount } = useCart();
  const { user, role, logout, isLoggedIn } = useAuth();
  const { favoritesCount } = useFavorites();
  
  return (
    <nav className="fixed top-2 md:top-4 inset-x-2 md:inset-x-4 h-14 md:h-16 glass-vibrant rounded-xl md:rounded-2xl z-50 flex items-center justify-between px-3 md:px-6 shadow-2xl transition-all hover:bg-white/90">
      <Link to="/" className="text-lg md:text-2xl font-serif text-gray-900 font-extrabold tracking-tight group truncate max-w-[150px] md:max-w-none">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 group-hover:from-orange-500 group-hover:via-pink-600 group-hover:to-purple-600 transition-all duration-1000 bg-[length:200%_auto] animate-gradient">Attire By Sush</span>
      </Link>
      <div className="flex items-center gap-2 md:gap-6">
        {isLoggedIn ? (
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-[10px] uppercase tracking-widest font-black text-purple-400 hidden lg:block">Hello, {user?.name || (role === 'admin' ? 'Admin' : 'User')}</span>
            {role === 'user' && <Link to="/orders" className="text-[10px] md:text-xs font-black text-gray-500 hover:text-pink-600 transition-colors uppercase tracking-tight hidden sm:block">Orders</Link>}
            {role === 'admin' && <Link to="/admin" className="text-[10px] md:text-xs font-black text-purple-600 hover:text-purple-700 transition-colors uppercase tracking-tight hidden sm:block">Admin</Link>}
            <button onClick={logout} className="text-[10px] md:text-xs font-black text-red-400 hover:text-red-500 transition-colors uppercase tracking-tight hidden sm:block">Logout</button>
            
            {/* Mobile Dropdown Replacement (Simple Icons for mobile instead of text) */}
            <div className="flex items-center gap-1 sm:hidden">
               {role === 'user' && <Link to="/orders" className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg></Link>}
               {role === 'admin' && <Link to="/admin" className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></Link>}
               <button onClick={logout} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
            </div>
          </div>
        ) : (
          <Link to="/login" className="text-[10px] md:text-xs font-black text-gray-600 hover:text-pink-600 transition-colors uppercase tracking-tight">Sign In</Link>
        )}
        
        <div className="flex items-center gap-1 md:gap-4 border-l border-gray-200/50 pl-2 md:pl-4">
          <Link to="/favorites" className="relative group">
            <div className="p-2 rounded-xl hover:bg-white/50 transition-all duration-300">
              <svg 
                className={`w-5 h-5 transition-colors ${favoritesCount > 0 ? 'text-red-500 fill-current' : 'text-gray-700 group-hover:text-red-500'}`} 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black rounded-full h-3.5 w-3.5 flex items-center justify-center shadow-md">
                  {favoritesCount}
                </span>
              )}
            </div>
          </Link>

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
      </div>
    </nav>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <BrowserRouter>
          <div className="min-h-screen font-sans text-[#1A1A1A] selection:bg-pink-100 selection:text-pink-900 overflow-x-hidden">
            <TopNav />
            {/* Ambient Background Elements - Totally Colorful */}
            <div className="fixed -top-[10%] -left-[10%] w-[50%] h-[50%] bg-pink-200/40 blur-[150px] rounded-full -z-10 pointer-events-none animate-pulse"></div>
            <div className="fixed top-[20%] right-[0%] w-[40%] h-[40%] bg-purple-200/30 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
            <div className="fixed -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-orange-100/40 blur-[180px] rounded-full -z-10 pointer-events-none"></div>
            <div className="fixed bottom-[10%] left-[10%] w-[30%] h-[30%] bg-blue-100/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

            <div className="pt-28 pb-20">
              <Suspense fallback={
                <div className="min-h-[50vh] flex flex-col items-center justify-center">
                   <div className="w-16 h-16 border-4 border-t-pink-500 border-r-purple-500 border-b-orange-500 border-l-transparent rounded-full animate-spin"></div>
                   <p className="mt-6 text-gray-500 font-medium tracking-widest uppercase text-xs animate-pulse">Loading Boutique...</p>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/login" element={<UserLogin />} />
                  <Route path="/register" element={<UserRegister />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<UserOrders />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/success" element={<OrderSuccessPage />} />
                  <Route path="/category/:id" element={<CategoryPage />} />
                </Routes>
              </Suspense>
            </div>
          </div>
          </BrowserRouter>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
