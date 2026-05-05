"use client";
import { Play, Clock, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const VideoCard = ({ video, onClick }) => {
  const handleClick = () => {
    if (typeof onClick === "function") {
      onClick(video);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className="group cursor-pointer rounded-[2rem] border border-(--border)/50 bg-(--background) text-(--foreground) overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden m-2 rounded-[1.5rem] bg-slate-200 dark:bg-slate-800">
        <img
          src={video.thumbnail || "/placeholder.jpg"}
          alt={video.title || "Video thumbnail"}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 scale-105 group-hover:scale-110 group-hover:rotate-1"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px] flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-all duration-500 ease-out">
            <Play className="w-6 h-6 fill-current ml-1" />
          </div>
        </div>

        {/* Duration */}
        {video.duration && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[9px] font-black tracking-widest uppercase border border-white/10">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-primary" />
              {video.duration}
            </div>
          </div>
        )}

        {/* Category */}
        {video.category && (
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
            {video.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 pt-4">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-primary font-black text-lg md:text-xl line-clamp-2 leading-[1.1] group-hover:text-primary transition-colors duration-300 uppercase tracking-tighter">
            {video.title || "Untitled Video"}
          </h3>

          <div className="shrink-0 p-2 rounded-full border border-(--border) group-hover:bg-primary group-hover:text-white transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {video.description && (
          <p className="mt-4 text-sm text-(--muted-foreground) line-clamp-2 font-secondary font-medium leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
            “{video.description}”
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <div className="h-[1px] flex-1 bg-(--border)/50" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
            View Details
          </span>
          <div className="h-[1px] w-4 bg-primary group-hover:w-12 transition-all duration-500" />
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCard;