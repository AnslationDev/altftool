import React from "react";

const Header = () => {
  return (
    /* mt-[35px] kyunki 86px (blue) + 35px = 121px (Figma Top) */
    <div className="w-full max-w-[646px] min-h-[120px] px-4 flex flex-col items-center justify-center gap-[12px] text-center mt-[35px] opacity-100">
      {/* Title */}
      <h1 className="text-[44px] font-black text-slate-800 leading-none tracking-tight uppercase">
        Display Text In Full Screen
      </h1>

      {/* Subtitle — the first sentence after the <h1>. Answer engines lift a
          self-contained sentence from exactly this slot, so it states what the
          tool does rather than selling it. min-h + leading-snug above let it
          wrap to two lines without colliding with the tool card. */}
      <p className="text-[19px] font-medium text-slate-500 leading-snug">
        Type any text and show it in big letters across your whole screen — or
        display a clock, stopwatch, countdown or image instead.
      </p>
    </div>
  );
};

export default Header;