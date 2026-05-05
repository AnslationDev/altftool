"use client";

const Loader = () => (
  <div className="py-3 sm:py-4 md:py-6 text-center flex flex-col items-center">
    
    <div className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 animate-spin rounded-full border-b-2 border-pink-400"></div>

    <p className="mt-2 text-xs sm:text-sm md:text-base text-(--muted-foreground)">
      Fetching rates...
    </p>

  </div>
);

export default Loader;