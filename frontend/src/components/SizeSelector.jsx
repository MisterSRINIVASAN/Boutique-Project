import React from 'react';

export default function SizeSelector({ sizes, selectedSize, onSelect }) {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-serif font-medium text-gray-900">Select Size</h3>
        <button className="text-sm text-lavender underline font-medium hover:text-purple-700">View Size Guide</button>
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
    </div>
  );
}
