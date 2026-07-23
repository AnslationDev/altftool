"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import {
  BearAvatar,
  DinoAvatar,
  KittyAvatar,
  AlienAvatar,
  FlowerReward,
  BingoLogoTarget,
} from "./GameAssets";

export default function MascotTrack() {
  return (
    <div className="relative mx-auto mt-6 w-full max-w-lg select-none px-2 py-4">
      {/* Twisted Golden Rope Progress Bar */}
      <div className="relative flex items-center justify-between">
        {/* Rope Background Line */}
        <div className="absolute top-1/2 left-8 right-8 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 shadow-inner border border-amber-300/40" />

        {/* Center Heart Node */}
        <div className="absolute top-1/2 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-md border-2 border-white">
          <Heart className="h-4 w-4 fill-white text-white" />
        </div>

        {/* Center Flower Reward Node */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute top-1/2 left-1/3 z-20 -translate-x-1/2 -translate-y-1/2"
        >
          <FlowerReward className="h-12 w-12" />
        </motion.div>

        {/* Left Mascots */}
        <div className="relative z-10 flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.15 }}>
            <BearAvatar className="h-13 w-13" />
          </motion.div>

          <motion.div whileHover={{ scale: 1.15 }}>
            <DinoAvatar className="h-13 w-13" />
          </motion.div>
        </div>

        {/* Right Mascots */}
        <div className="relative z-10 flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.15 }}>
            <KittyAvatar className="h-13 w-13" />
          </motion.div>

          <motion.div whileHover={{ scale: 1.15 }}>
            <AlienAvatar className="h-13 w-13" />
          </motion.div>
        </div>
      </div>

      {/* Bingo Blitz Plus Vibrant 3D Logo */}
      <div className="mt-5 flex flex-col items-center justify-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative flex flex-col items-center cursor-pointer"
        >
          {/* Target Logo Badge */}
          <BingoLogoTarget className="h-16 w-16" />

          {/* Banner Title */}
          <div className="-mt-3 flex flex-col items-center leading-none">
            <span className="text-2xl font-black uppercase tracking-wider text-amber-500 dark:text-yellow-300 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              BINGO
            </span>
            <span className="text-xl font-black uppercase tracking-widest text-pink-600 dark:text-pink-400 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              BLITZ <span className="text-white text-xs bg-pink-500 px-1.5 py-0.5 rounded-full">PLUS</span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
