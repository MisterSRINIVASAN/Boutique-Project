import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

const ProductCard = React.memo(function ProductCard({ product, onAdded }) {
    const [isHovered, setIsHovered] = useState(false);
    
    const getFirstImage = () => {
        let imgs = product.images;
        if (typeof imgs === 'string') {
            try { imgs = JSON.parse(imgs); } catch(e) { imgs = []; }
        }
        return (imgs && imgs.length > 0) ? imgs[0] : 'https://via.placeholder.com/400x533/E8E8E8/A0A0A0?text=Attire+By+Sush';
    };
    const imageUrl = getFirstImage();

    const { addToCart } = useCart();
    const { toggleFavorite, isFavorited } = useFavorites();
    const favorited = isFavorited(product.id);
    
    // Determine badges
    const isNew = true; // Mock: everything is "JUST IN" for now
    const hasLowStock = product.sizes && product.sizes.some(s => s.stock > 0 && s.stock < 5);

    return (
        <div 
            className="group relative flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/product/${product.id}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {isNew && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                Just In
                            </span>
                        )}
                        {hasLowStock && (
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                Last Few Left
                            </span>
                        )}
                    </div>

                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(product.id);
                        }}
                        className={`absolute top-3 right-3 transition-all duration-300 transform hover:scale-110 active:scale-95 z-20 p-2 rounded-full backdrop-blur-md ${favorited ? 'bg-white/90 text-red-500 shadow-lg' : 'bg-black/10 text-white/70 hover:text-red-500 hover:bg-white/50'}`}
                    >
                        <svg className={`w-5 h-5 ${favorited ? 'fill-current' : 'fill-none'}`} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>

                    {/* Size Tray on Hover */}
                    <div className={`absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm p-4 transition-transform duration-300 transform 
                        ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest text-center">Quick Add</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {product.sizes?.map(size => (
                                <button
                                    key={size.id}
                                    disabled={size.stock === 0}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        addToCart(product, size.size_label);
                                        if (onAdded) onAdded();
                                    }}
                                    className={`h-8 w-8 text-xs font-bold rounded border flex items-center justify-center transition-all
                                        ${size.stock > 0 
                                            ? 'border-gray-200 hover:border-black hover:bg-black hover:text-white' 
                                            : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'}`}
                                >
                                    {size.size_label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Link>

            <div className="mt-4 flex flex-col">
                <h3 className="text-sm font-medium text-gray-700 font-sans tracking-tight leading-tight">
                    <Link to={`/product/${product.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                    </Link>
                </h3>
                <p className="mt-1 text-xs text-gray-400">{product.fabric}</p>
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 font-sans">₹{product.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-green-600 font-medium">Free Shipping</span>
                </div>
            </div>
        </div>
    );
});

export default ProductCard;
