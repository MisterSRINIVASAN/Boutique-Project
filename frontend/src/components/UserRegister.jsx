import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function UserRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Registration failed');
      }
      
      navigate('/login');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-xl w-full space-y-10 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">Create Account</h2>
          <p className="mt-3 text-gray-500 font-medium tracking-wide">Join Attire By Sush for a premium boutique experience</p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 bg-red-50 p-4 rounded-xl text-sm font-medium border border-red-100">{error}</div>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 ml-1">Full Name</label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-2 block w-full px-5 py-4 bg-amber-50/30 border border-amber-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder-gray-400 font-medium"
                placeholder="John Doe"
              />
            </div>
            
            <div className="sm:col-span-1">
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 ml-1">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-2 block w-full px-5 py-4 bg-amber-50/30 border border-amber-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder-gray-400 font-medium"
                placeholder="you@example.com"
              />
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="phone_number" className="block text-sm font-bold text-gray-700 ml-1">Phone Number</label>
              <input
                id="phone_number"
                type="tel"
                required
                value={formData.phone_number}
                onChange={handleChange}
                className="mt-2 block w-full px-5 py-4 bg-amber-50/30 border border-amber-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder-gray-400 font-medium"
                placeholder="+91 9876543210"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 ml-1">Password</label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-2 block w-full px-5 py-4 bg-amber-50/30 border border-amber-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder-gray-400 font-medium"
                placeholder="••••••••"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-bold text-gray-700 ml-1">Default Shipping Address (Optional)</label>
              <textarea
                id="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
                className="mt-2 block w-full px-5 py-4 bg-amber-50/30 border border-amber-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder-gray-400 font-medium"
                placeholder="House No, Street, City, State, ZIP..."
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-lg font-bold text-white transition-all transform hover:scale-[1.02]
                ${loading ? 'bg-amber-400 cursor-not-allowed opacity-75' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'}`}
            >
              {loading ? 'Processing...' : 'Register Account'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
