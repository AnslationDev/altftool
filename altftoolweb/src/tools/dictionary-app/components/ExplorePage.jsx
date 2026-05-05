import { Search } from 'lucide-react'
import React from 'react'

export default function ExplorePage() {
  return (
    <div className="mx-4 sm:mx-6 mt-6 sm:mt-8 bg-(--background) text-(--foreground) backdrop-blur-xl rounded-md shadow-xl py-8 sm:py-12 text-center border border-(--border) animate-in fade-in slide-in-from-bottom duration-700 px-4">
      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-linear-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-bounce">
        <Search className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-600" />
      </div>
      <h3 className="subheading animate-bounce mb-3 sm:mb-5 text-lg sm:text-xl lg:text-2xl">
        Ready to Explore?
      </h3>
      <p className="description text-sm sm:text-base px-2">
        Type any word in the search bar above to discover its meaning,{" "}
        <br className="hidden sm:block" />
        pronunciation, and usage instantly!
      </p>
    </div>
  );
}