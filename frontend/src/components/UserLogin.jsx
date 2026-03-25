import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/auth/login`, {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Login failed');
      }
      
      const data = await res.json();
      login(data.user || null, data.access_token, data.role);
      
      if (data.role === 'admin') navigate('/admin');
      else navigate('/'); // User goes to homepage as requested
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-md w-full space-y-10 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="mt-3 text-gray-500 font-medium tracking-wide">Enter your details to access your account</p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 bg-red-50 p-4 rounded-xl text-sm font-medium border border-red-100">{error}</div>}
          
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 ml-1">Email / Username</label>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-2 block w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 font-medium"
                placeholder="email or 'admin'"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 ml-1">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-2 block w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-lg font-bold text-white transition-all transform hover:scale-[1.02]
                ${loading ? 'bg-indigo-400 cursor-not-allowed opacity-75' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 font-medium">
            New to Attire By Sush?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
