import React, { useState } from 'react';

export default function SizeSelector({ sizes, selectedSize, onSelect }) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-serif font-medium text-gray-900">Select Size</h3>
        <button 
          onClick={() => setShowSizeGuide(true)}
          className="text-sm text-lavender underline font-medium hover:text-purple-700"
        >
          View Size Guide
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {sizes.map(size => {
          const isSelected = selectedSize?.size_label === size.size_label;
          const isOOS = size.stock === 0;
          return (
            <button
              key={size.size_label}
              disabled={isOOS}
              onClick={() => onSelect(size)}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center border-2 font-medium transition-all
                ${isSelected ? 'border-lavender bg-lavender/10 text-lavender' : 'border-gray-200 text-gray-700 hover:border-lavender/50'}
                ${isOOS ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-100' : ''}
              `}
            >
              {size.size_label}
              {size.stock > 0 && size.stock < 3 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full animate-pulse"></span>
              )}
            </button>
          )
        })}
      </div>

      {/* Dynamic Measurements Display */}
      <div className={`transition-all duration-300 overflow-hidden ${selectedSize ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        {selectedSize && (
          <div className="bg-lavender/5 border border-lavender/20 rounded-lg p-5">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b border-lavender/20 pb-2">
              Size {selectedSize.size_label} Tailoring Details
            </h4>
            <div className="flex gap-6 mb-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Chest</span>
                <span className="font-medium text-gray-900">{selectedSize.chest}"</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Waist</span>
                <span className="font-medium text-gray-900">{selectedSize.waist}"</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Hip</span>
                <span className="font-medium text-gray-900">{selectedSize.hip}"</span>
              </div>
            </div>
            {selectedSize.note && (
              <p className="text-sm text-gold bg-gold/10 px-3 py-2 rounded">
                <span className="font-semibold mr-1">Note:</span> {selectedSize.note}
              </p>
            )}
            {selectedSize.stock > 0 && selectedSize.stock < 3 && (
              <p className="text-sm text-red-500 mt-2 font-medium flex items-center">
                <span className="mr-1">⚠️</span> Only {selectedSize.stock} left in this size!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slideUp relative">
            <div className="p-8">
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold"
              >
                ✕
              </button>
              
              <h2 className="text-3xl font-serif font-black text-gray-900 mb-2">Boutique Size Guide</h2>
              <p className="text-gray-500 font-medium mb-8">All measurements are listed in inches. Fits may vary slightly by fabric and cut.</p>
              
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Size</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Label</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Chest</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Waist</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Hip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">Small</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">S</span></td>
                      <td className="px-6 py-4 text-gray-600">34-36</td>
                      <td className="px-6 py-4 text-gray-600">28-30</td>
                      <td className="px-6 py-4 text-gray-600">36-38</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">Medium</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">M</span></td>
                      <td className="px-6 py-4 text-gray-600">38-40</td>
                      <td className="px-6 py-4 text-gray-600">32-34</td>
                      <td className="px-6 py-4 text-gray-600">40-42</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">Large</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">L</span></td>
                      <td className="px-6 py-4 text-gray-600">42-44</td>
                      <td className="px-6 py-4 text-gray-600">36-38</td>
                      <td className="px-6 py-4 text-gray-600">44-46</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">X-Large</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">XL</span></td>
                      <td className="px-6 py-4 text-gray-600">46-48</td>
                      <td className="px-6 py-4 text-gray-600">40-42</td>
                      <td className="px-6 py-4 text-gray-600">48-50</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-8 bg-purple-50 p-6 rounded-2xl border border-purple-100">
                <h4 className="text-sm font-bold text-purple-900 flex items-center mb-2">✂️ Custom Tailoring</h4>
                <p className="text-xs text-purple-700 font-medium leading-relaxed">Don't see your size? All our pieces are handcrafted and can be tailored to your absolute custom measurements free of charge. Include your exact measurements in the order notes!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
