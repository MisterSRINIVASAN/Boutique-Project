import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
    const [isHovered, setIsHovered] = useState(false);
    const { addToCart } = useCart();
    
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
                        src={product.images?.[0] || 'https://via.placeholder.com/400x533/E8E8E8/A0A0A0?text=Attire+By+Sush'}
                        alt={product.name}
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

                    <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
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
}
