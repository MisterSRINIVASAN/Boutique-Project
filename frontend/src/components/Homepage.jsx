import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import Lookbook from './Lookbook';

export default function Homepage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [toast, setToast] = useState(null);
  const [showLookbook, setShowLookbook] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchData = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s for free-tier cold starts
      try {
        const prodRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/products`, { signal: controller.signal });
        if (!prodRes.ok) throw new Error('Failed to fetch products');
        setProducts(await prodRes.json());

        const catRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/products/categories`, { signal: controller.signal });
        if (!catRes.ok) throw new Error('Failed to fetch categories');
        setCategories(await catRes.json());
      } catch (err) {
        console.error("API Fetch Error:", err);
        showToast("Backend connection failed or timed out.");
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const categoryList = ['All', ...categories.map(c => c.name)];

  const sortedAndFilteredProducts = (() => {
    let result = activeCategory === 'All' 
      ? [...products] 
      : products.filter(p => p.category_obj?.name === activeCategory);
    
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'new') result.reverse(); // Mock new arrivals
    
    return result;
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 right-10 bg-black text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounceIn text-sm font-bold tracking-wider">
          {toast}
        </div>
      )}

      {/* Lookbook Modal */}
      {showLookbook && <Lookbook onClose={() => setShowLookbook(false)} />}

      {/* Hero Section */}
      <div className="mb-12 md:mb-16 glass-vibrant rounded-[2rem] md:rounded-[3rem] py-16 md:py-24 px-4 md:px-8 text-center animate-fadeIn relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-50/20 via-purple-50/20 to-orange-50/20 -z-10"></div>
        <h1 className="text-4xl md:text-7xl font-serif font-black mb-4 md:mb-6 tracking-tighter leading-tight scale-105">
          <span className="text-vibrant-gradient animate-pulse">Vibrant</span> Boutique <br/>
          <span className="text-gray-900">Elegance</span>
        </h1>
        <p className="max-w-2xl mx-auto text-sm md:text-xl text-gray-600 font-bold leading-relaxed uppercase tracking-widest opacity-80 px-2">
          Handcrafted Fashion from Madurai • Shipped Globally • Tailored for You
        </p>
        <div className="mt-8 md:mt-12 flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
          <button 
            onClick={() => scrollToSection('shop-section')}
            className="bg-colorful-gradient text-white px-8 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-black shadow-2xl hover:scale-105 transition-all w-full sm:w-auto"
          >
            Shop Collection
          </button>
          <button 
            onClick={() => setShowLookbook(true)}
            className="glass px-8 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-gray-900 shadow-xl hover:bg-white/50 transition-all w-full sm:w-auto"
          >
            View Lookbook
          </button>
        </div>
      </div>

      {/* Collections Section */}
      {categories.length > 0 && (
        <div className="mb-20 pt-8">
           <div className="flex justify-between items-end mb-10">
              <h2 className="text-4xl font-serif font-black text-gray-900 tracking-tighter">Boutique <span className="text-vibrant-gradient">Collections</span></h2>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hidden sm:block">Explore Curated Styles</span>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {categories.map(cat => (
                 <a 
                    key={cat.id} 
                    href={`/category/${cat.id}`}
                    className="group relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 block"
                 >
                    {cat.image_url ? (
                       <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
                    ) : (
                       <div className="w-full h-full bg-gradient-to-tr from-pink-100 to-purple-200"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>
                    <div className="absolute bottom-6 left-6 right-6 flex flex-col transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                       <span className="text-white font-serif font-black text-xl md:text-2xl leading-tight">{cat.name}</span>
                       <span className="text-pink-300 font-bold text-[10px] uppercase tracking-widest mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                          Explore Collection <span className="text-lg">→</span>
                       </span>
                    </div>
                 </a>
              ))}
           </div>
        </div>
      )}

      {/* Category Navigation & Sort */}
      <div id="shop-section" className="mb-12 pt-8 border-t border-gray-100">
        <h3 className="text-2xl font-serif font-black text-center mb-8">All Designs</h3>
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categoryList.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 md:px-10 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black transition-all border-2 uppercase tracking-widest
                  ${activeCategory === cat 
                    ? 'bg-colorful-gradient border-transparent text-white shadow-xl scale-110' 
                    : 'bg-white/40 border-white text-gray-500 hover:text-purple-600 hover:border-purple-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-gray-400 border-t pt-8 w-full justify-center">
            <span className="text-xs uppercase tracking-widest font-bold">{sortedAndFilteredProducts.length} items</span>
            <span className="text-gray-200">|</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-none bg-transparent font-bold text-xs uppercase tracking-wider focus:ring-0 cursor-pointer text-gray-500 hover:text-gray-900"
            >
              <option value="popular">Popularity</option>
              <option value="new">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-40">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender"></div>
        </div>
      ) : sortedAndFilteredProducts.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-medium">No results found for "{activeCategory}"</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {sortedAndFilteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onAdded={() => showToast(`Added ${product.name} to Bag`)} />
          ))}
        </div>
      )}

      {/* Boutique SEO / Trust Section */}
      <div className="mt-24 border-t-2 border-dashed border-purple-100 pt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="text-center px-4 glass p-8 rounded-3xl group hover:bg-pink-50/50 transition-all duration-500">
          <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform">
            <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h4 className="font-serif font-black text-xl mb-4 text-pink-600">Precision Tailoring</h4>
          <p className="text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-widest">Custom fit based on your unique measurements for maximum comfort and style.</p>
        </div>
        <div className="text-center px-4 glass p-8 rounded-3xl group hover:bg-purple-50/50 transition-all duration-500">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:-rotate-12 transition-transform">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </div>
          <h4 className="font-serif font-black text-xl mb-4 text-purple-600">Global Boutique</h4>
          <p className="text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-widest">Worldwide express delivery from our Madurai atelier directly to your door.</p>
        </div>
        <div className="text-center px-4 glass p-8 rounded-3xl group hover:bg-orange-50/50 transition-all duration-500">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>
          <h4 className="font-serif font-black text-xl mb-4 text-orange-600">Pure Craft</h4>
          <p className="text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-widest">Premium fabrics and ethical practices. Supporting local looms and honest craft.</p>
        </div>
      </div>
    </div>
  );
}
