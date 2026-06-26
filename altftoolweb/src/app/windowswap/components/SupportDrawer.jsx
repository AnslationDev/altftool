"use client";

import React from "react";
import { X, Heart, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import "../style/SupportDrawer.css";

export default function SupportDrawer({ isOpen, onClose }) {
  const triggerCoffeeTip = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      colors: ["#dfc7a7", "#c56543", "#ffffff"]
    });
    alert("Thank you so much! This is a demonstration copy. Your warm support is highly appreciated.");
  };

  const triggerServerTip = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      colors: ["#dfc7a7", "#c56543", "#ffffff"]
    });
    alert("Thank you so much! This is a demonstration copy. Your warm support is highly appreciated.");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">

          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="windowswap-support-drawer relative w-full max-w-lg bg-windowswap-teal h-full shadow-[0_0_50px_-5px_rgba(0,0,0,0.5)] border-l border-teal-950/40 p-8 overflow-y-auto flex flex-col text-left windowswap-support-scroll"
          >

            {/* Header bar */}
            <div className="windowswap-support-header flex items-center justify-between pb-6 border-b border-teal-950">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-windowswap-cream" />
                <span className="font-serif text-xl font-bold tracking-wide">Support the Creators</span>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Support drawer panel information */}
            <div className="mt-8 flex-1 flex flex-col gap-6 text-sm text-zinc-300 leading-relaxed font-light">
              <p>
                Window-Swap started as a creative quarantine project to help people cope with global travel restrictions, and has grown into a therapeutic community sharing visual calm.
              </p>

              <p>
                To maintain server operations, process video feeds, and preserve a completely ad-free, calming experience, we rely entirely on the support of our global community.
              </p>

              <div className="flex flex-col gap-3 mt-4">
                <span className="font-semibold text-white uppercase tracking-wider text-[10px] block mb-1">Make a donation (Tip Jar)</span>

                <button
                  onClick={triggerCoffeeTip}
                  className="w-full windowswap-primary-button py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Coffee className="h-4 w-4" /> Buy us a Coffee ($5)
                </button>

                <button
                  onClick={triggerServerTip}
                  className="w-full bg-white hover:bg-zinc-100 text-zinc-950 py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md"
                >
                  🌱 Support Server Costs ($15)
                </button>
              </div>

              <div className="h-[1px] w-full bg-teal-950/80 my-4" />

              <div className="flex flex-col gap-2">
                <span className="font-semibold text-white uppercase tracking-wider text-[10px] block mb-1">Take our survey</span>
                <p className="text-xs mb-3">
                  Tell us about your ambient preferences and help us make the Window-Swap experience even better. It takes less than 2 minutes!
                </p>

                <button
                  onClick={() => alert("Thank you! Survey links are disabled for this demonstration clone.")}
                  className="w-full bg-transparent hover:bg-white/5 border border-teal-950 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  📋 Launch Feedback Survey
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
