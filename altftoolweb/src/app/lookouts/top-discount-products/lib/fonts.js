import { Baloo_2 } from "next/font/google";

// One shared instance so every component that needs the playful display
// font imports the same object instead of each calling the font loader
// separately (next/font dedupes per call site, not per font — importing a
// single exported instance is the documented way to reuse one across files).
export const baloo2 = Baloo_2({ subsets: ["latin"], weight: ["500", "600", "700", "800"], display: "swap" });
