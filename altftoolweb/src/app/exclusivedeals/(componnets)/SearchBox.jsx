import React from 'react';
import { X } from 'lucide-react';
import data from "../(data)/db.json"
import Image from 'next/image';
import Link from 'next/link';

function SearchBox({ onClose }) {

  const storedata = data.store.slice(0, 4)
  const categoryData = data.categories.slice(0, 4)

   
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header with close button */}
      <div className="flex justify-between items-center px-3 sm:px-5 py-2 sm:py-3 border-b">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800">Search Results</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-72 sm:max-h-96 overflow-y-auto">
        {/* Stores Section */}
        <div className="px-3 sm:px-5 py-3 sm:py-4">
          <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase mb-2 sm:mb-3">Stores</p>
          <div className="space-y-1 sm:space-y-2">
            {storedata?.map((store) => (
              <Link href={`exclusivedeals/${store.slug}`} key={store.id}>
                <div 
                  className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 relative border rounded-full flex items-center justify-center bg-gray-100 flex-shrink-0">
                    <Image src={store.image} alt={store.slug} fill className='object-cover rounded-full' />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{store.categoryName}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t"></div>

        {/* Categories Section */}
        <div className="px-3 sm:px-5 py-3 sm:py-4">
          <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase mb-2 sm:mb-3">Categories</p>
          <div className="space-y-1 sm:space-y-2">
            {categoryData.map((category) => (
              <Link href={`exclusivedeals/${category.slug}`} key={category.id}>
                <div 
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{category.categoryName}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 sm:px-5 py-2 sm:py-3 bg-gray-50 border-t text-center">
        <p className="text-xs sm:text-sm text-gray-500">
          Press <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-white border rounded">ESC</kbd> to close
        </p>
      </div>
    </div>
  );
}

export default SearchBox;