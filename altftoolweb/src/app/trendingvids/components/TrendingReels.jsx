"use client";
import { useState, useRef } from "react";
import { reels } from "../data/reels";
import ReelItem from "./ReelItem";
import { ChevronUp, ChevronDown, ArrowLeft } from "lucide-react";

const TrendingReels = ({ onBack }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);

    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, clientHeight } = containerRef.current;
            const index = Math.round(scrollTop / clientHeight);
            if (index !== activeIndex) setActiveIndex(index);
        }
    };

    const scrollToIndex = (index) => {
        if (containerRef.current && index >= 0 && index < reels.length) {
            containerRef.current.scrollTo({
                top: index * containerRef.current.clientHeight,
                behavior: "smooth"
            });
        }
    };

    return (
        /* Mobile: Full-screen overlay | Desktop: Contained in page flow */
        <div className="fixed inset-0 z-[50] bg-black md:relative md:inset-auto md:z-10 md:w-full md:max-w-[420px] md:h-[80vh] md:mx-auto md:my-10">

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-[60] md:top-4 md:left-4">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        onBack();
                    }}
                    className="flex items-center justify-center p-3 rounded-full bg-black/40 backdrop-blur-xl text-white border border-white/10 hover:bg-blue-600 transition-all shadow-2xl"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            <div className="relative h-full w-full bg-black md:rounded-[2.5rem] overflow-hidden md:border-[6px] md:border-slate-900 shadow-2xl">
                <div
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
                >
                    {reels.map((reel, index) => (
                        <div key={reel.id} className="w-full h-full min-h-full snap-start snap-always relative">
                            <ReelItem reel={reel} isActive={index === activeIndex} />
                        </div>
                    ))}
                </div>

                {/* Desktop Navigation Arrows */}
                <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30 hidden lg:flex">
                    <button onClick={() => scrollToIndex(activeIndex - 1)} className="p-3 rounded-full bg-white/10 text-white hover:bg-blue-600 transition-all"><ChevronUp /></button>
                    <button onClick={() => scrollToIndex(activeIndex + 1)} className="p-3 rounded-full bg-white/10 text-white hover:bg-blue-600 transition-all"><ChevronDown /></button>
                </div>
            </div>
        </div>
    );
};

export default TrendingReels;