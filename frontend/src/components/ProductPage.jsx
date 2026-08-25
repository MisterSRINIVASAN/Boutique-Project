import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import SizeSelector from './SizeSelector';
import { fetchProduct, keys, parseImages, sizedImage, PLACEHOLDER_IMG } from '../lib/api';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState(null);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  // Router reuses this component across /product/:id changes, so per-product
  // selections must be cleared or product B renders product A's thumbnail and
  // a size B may not even stock. Resetting during render (rather than in an
  // effect) avoids painting one frame of the previous product's state.
  const [renderedId, setRenderedId] = useState(id);
  if (renderedId !== id) {
    setRenderedId(id);
    setActiveImage(null);
    setSelectedSize(null);
  }

  // ProductCard prefetches this key on hover, so arriving from the grid
  // usually resolves from cache with no request at all.
  const { data: product, isLoading } = useQuery({
    queryKey: keys.product(id),
    queryFn: () => fetchProduct(id),
    staleTime: 60_000,
  });

  const images = useMemo(() => parseImages(product?.images), [product]);
  const mainImage = activeImage ?? images[0] ?? null;

  if (isLoading) return <div className="text-center py-20 text-gray-500">Loading product details...</div>;
  if (!product) return <div className="text-center py-20 text-xl font-serif text-gray-900">Product not found</div>;

  const handleAddToCart = (shouldRedirect = false) => {
    if (!selectedSize) return;
    setAdding(true);
    addToCart(product, selectedSize.size_label, 1);
    setTimeout(() => {
      setAdding(false);
      if (shouldRedirect) navigate('/checkout');
      else navigate('/cart');
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
        
        {/* Images */}
        <div className="flex flex-col-reverse lg:flex-row gap-4 mb-10 lg:mb-0">
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:w-24 shrink-0">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={sizedImage(img, 160)}
                alt={`${product.name} view ${idx + 1}`}
                width="80"
                height="112"
                loading="lazy"
                decoding="async"
                onClick={() => setActiveImage(img)}
                className={`w-20 h-28 object-cover rounded-md cursor-pointer border-2 transition-all
                  ${mainImage === img ? 'border-lavender shadow-md scale-105' : 'border-transparent hover:border-lavender/50'}`}
              />
            ))}
          </div>
          <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm relative group">
            <img
              src={mainImage ? sizedImage(mainImage, 800) : PLACEHOLDER_IMG}
              alt={product.name}
              width="800"
              height="1066"
              fetchpriority="high"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {(product.category_obj?.name || product.category) && (
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-sm px-4 py-1.5 rounded-full text-sm font-semibold text-gray-800 uppercase tracking-wider">
                {product.category_obj?.name || product.category}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-10 px-4 sm:px-0 lg:mt-0 flex flex-col justify-center">
          <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">{product.name}</h1>
          <div className="mt-3">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl text-gray-900 font-sans font-medium">₹{product.price.toLocaleString('en-IN')}</p>
          </div>
          
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-medium text-gray-900">About this design</h3>
            <div className="mt-3 prose prose-sm text-gray-600 font-sans leading-relaxed">
              <p>{product.base_description}</p>
              <ul className="mt-4 space-y-2">
                <li><span className="font-semibold text-gray-900">Fabric:</span> {product.fabric}</li>
                <li><span className="font-semibold text-gray-900">Fit:</span> Tailored fit</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8">
            <SizeSelector 
              sizes={product.sizes} 
              selectedSize={selectedSize} 
              onSelect={setSelectedSize} 
            />
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleAddToCart(false)}
              disabled={!selectedSize}
              className={`
                flex-1 flex items-center justify-center rounded-full border-2 border-gray-900 px-8 py-4 text-base font-semibold transition-all
                ${!selectedSize 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'text-gray-900 hover:bg-gray-50 hover:scale-[1.02]'
                }
              `}
            >
              {adding ? 'Adding...' : 'Add to bag'}
            </button>
            <button
              onClick={() => handleAddToCart(true)}
              disabled={!selectedSize}
              className={`
                flex-1 flex items-center justify-center rounded-full border border-transparent px-8 py-4 text-base font-semibold text-white shadow-md transition-all
                ${!selectedSize 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] shadow-indigo-200'
                }
              `}
            >
              Buy it now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
