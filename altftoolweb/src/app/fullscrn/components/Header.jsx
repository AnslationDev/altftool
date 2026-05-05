import React from "react";

const Header = () => {
  return (
    /* mt-[35px] kyunki 86px (blue) + 35px = 121px (Figma Top) */
    <div className="w-[646px] h-[120px] flex flex-col items-center justify-center gap-[12px] text-center mt-[35px] opacity-100">
      {/* Title */}
      <h1 className="text-[44px] font-black text-slate-800 leading-none tracking-tight uppercase">
        Display Text In Full Screen
      </h1>
      
      {/* Subtitle */}
      <p className="text-[19px] font-medium text-slate-500 leading-none">
        Show text, media, clock, and more on full screen, fast!
      </p>
    </div>
  );
};

export default Header;