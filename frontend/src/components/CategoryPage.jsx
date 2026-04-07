import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from './ProductCard';

export default function CategoryPage() {
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchCategoryData = async () => {
            setLoading(true);
            try {
                // Fetch the specific category to get its title and image
                const catRes = await fetch(`${API_URL}/api/products/categories`);
                if (catRes.ok) {
                    const cats = await catRes.json();
                    const currentCat = cats.find(c => c.id === id);
                    if (currentCat) {
                        setCategory(currentCat);
                    }
                }

                // Fetch products filtered by category
                const prodRes = await fetch(`${API_URL}/api/products?category_id=${id}`);
                if (prodRes.ok) {
                    const data = await prodRes.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to fetch category data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [id, API_URL]);

    if (loading) {
        return <div className="text-center py-32 text-gray-400 font-medium">Loading collection...</div>;
    }

    if (!category) {
        return (
            <div className="text-center py-32">
                <h2 className="text-2xl font-serif text-gray-900 mb-4">Collection not found.</h2>
                <Link to="/" className="text-pink-600 underline font-bold">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Category Hero Banner */}
            <div className="relative w-full h-[40vh] sm:h-[50vh] bg-gray-100 flex items-center justify-center overflow-hidden">
                {category.image_url ? (
                    <img 
                        src={category.image_url} 
                        alt={category.name} 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-pink-100 to-purple-200"></div>
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                
                <div className="relative z-10 text-center px-4 max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-white tracking-tight drop-shadow-lg mb-4">
                        {category.name}
                    </h1>
                    {category.description && (
                        <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex justify-between items-center mb-10">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                        {products.length} {products.length === 1 ? 'Design' : 'Designs'}
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 border border-gray-100 rounded-3xl">
                        <p className="text-gray-500 text-lg">We are currently crafting new designs for this collection.</p>
                        <p className="text-gray-400 mt-2">Check back soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                        {products.map(product => (
                            <div key={product.id} className="animate-fade-in">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
