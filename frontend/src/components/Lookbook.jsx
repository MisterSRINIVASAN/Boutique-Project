import React, { useState, useEffect } from 'react';

const fallbackLookbook = [
  { image_url: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/uploads/vibrant_anarkali.png`, title: 'Royal Zari Anarkali', description: 'Hand-woven silk with traditional zari work.' },
  { image_url: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/uploads/electric_blue_lehanga.png`, title: 'Mirror Work Lehanga', description: 'Electric blue georgette with artisan mirror accents.' },
  { image_url: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/uploads/neon_pink_kurti.png`, title: 'Neon Pink Designer Kurti', description: 'Modern silhouette meets traditional craft.' },
  { image_url: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/uploads/emerald_gown.png`, title: 'Emerald Party Gown', description: 'Rich velvet drape for evening elegance.' },
  { image_url: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/uploads/lavender_sharara.png`, title: 'Lavender Sharara Set', description: 'Delicate organic cotton with intricate threadwork.' },
  { image_url: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/uploads/maroon_velvet.png`, title: 'Maroon Velvet Ensemble', description: 'Luxurious heavy velvet for a festive statement.' },
  { image_url: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/uploads/pastel_mint.png`, title: 'Pastel Mint Dhoti Set', description: 'Contemporary twist on a classic ethnic silhouette.' },
  { image_url: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/uploads/gold_suit.png`, title: 'Gold Embroidered Suit', description: 'Tussar silk with opulent golden embroidery.' },
];

export default function Lookbook({ onClose }) {
  const [lookbookImages, setLookbookImages] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/products/lookbook/all`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setLookbookImages(data);
        } else {
          setLookbookImages(fallbackLookbook);
        }
      })
      .catch(err => {
        console.error("DEBUG - Lookbook fetch failed:", err);
        setLookbookImages(fallbackLookbook);
      });
  }, []);
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl animate-fadeIn overflow-y-auto pb-20">
      <button 
        onClick={onClose}
        className="fixed top-8 right-8 z-[110] bg-white text-black w-12 h-12 rounded-full flex items-center justify-center font-black shadow-2xl hover:scale-110 transition-all active:scale-95"
      >
        ✕
      </button>

      <div className="max-w-6xl mx-auto px-6 pt-32 text-center">
        <p className="text-vibrant-gradient text-xs font-black uppercase tracking-[0.4em] mb-4">Collection 2026</p>
        <h2 className="text-5xl md:text-7xl font-serif font-black text-white mb-8 tracking-tighter">Boutique Lookbook</h2>
        <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mb-20 rounded-full"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          {lookbookImages.map((img, i) => (
            <div key={i} className={`group animate-slideUp`}>
              <div className="relative overflow-hidden rounded-[2rem] shadow-2xl aspect-[4/5] bg-gray-900 mb-8 transform transition-transform duration-700 group-hover:scale-[1.02]">
                <img 
                  src={img.image_url} 
                  alt={img.title} 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700" 
                />
                <div className="absolute inset-x-6 bottom-6 p-8 glass text-left rounded-3xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <h3 className="text-xl font-serif font-black mb-2 text-white">{img.title}</h3>
                  <p className="text-xs text-gray-300 font-bold uppercase tracking-wider">{img.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-40 border-t border-white/10 pt-20">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Attire By Sush • Madurai • Worldwide</p>
        </div>
      </div>
    </div>
  );
}
