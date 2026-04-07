import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';

export default function FavoritesPage() {
    const { favorites, favoritesCount } = useFavorites();
    const [categories, setCategories] = React.useState([]);

    React.useEffect(() => {
        const fetchCats = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
                const res = await fetch(`${API_URL}/api/products/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCats();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                <div>
                    <h1 className="text-4xl font-serif font-black text-gray-900 tracking-tight mb-2">
                        My Favorites
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {favoritesCount === 0 
                            ? "You haven't saved any items yet." 
                            : `You have ${favoritesCount} item${favoritesCount > 1 ? 's' : ''} in your wishlist.`}
                    </p>
                </div>
                <Link 
                    to="/" 
                    className="text-sm font-bold text-pink-600 hover:text-pink-700 transition-colors uppercase tracking-widest border-b-2 border-pink-100 hover:border-pink-600 pb-1"
                >
                    Continue Shopping
                </Link>
            </div>

            {favoritesCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/30 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-8 max-w-xs text-center">Save items you love to find them easily later and stay updated on their availability.</p>
                    <Link 
                        to="/" 
                        className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl hover:shadow-black/20 transform hover:-translate-y-1"
                    >
                        Explore Collection
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                    {favorites.map((fav) => (
                        <div key={fav.id} className="animate-fade-in">
                            <ProductCard product={fav.product} />
                        </div>
                    ))}
                </div>
            )}

            {/* Recommendations or Browse Categories section can go here */}
            {categories.length > 0 && (
                <div className="mt-24 pt-12 border-t border-gray-100">
                    <h3 className="text-2xl font-serif font-black text-gray-900 mb-8">More to explore</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.map(cat => (
                            <Link 
                                key={cat.id}
                                to={`/category/${cat.id}`}
                                className="group relative rounded-2xl overflow-hidden aspect-square bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-500"
                            >
                                {cat.image_url ? (
                                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-pink-100 to-purple-200"></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                <div className="absolute bottom-4 left-4 right-4 flex flex-col">
                                    <span className="text-white font-bold text-lg leading-tight">{cat.name}</span>
                                    {cat.description && (
                                        <span className="text-white/80 text-xs mt-1 line-clamp-1">{cat.description}</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
