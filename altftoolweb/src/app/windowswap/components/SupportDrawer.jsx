"use client";

import React from "react";
import { X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "../style/SupportDrawer.css";

export default function SupportDrawer({ isOpen, onClose }) {
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
                <span className="font-serif text-xl font-bold tracking-wide">Unavailable Demo Features</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close feature notice"
                className="text-zinc-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Support drawer panel information */}
            <div className="mt-8 flex-1 flex flex-col gap-6 text-sm text-zinc-300 leading-relaxed font-light">
              <p className="text-foreground">
                This page demonstrates a calm video interface. It does not run
                a membership, creator-payment, donation, waitlist, or survey
                service.
              </p>

              <div className="flex flex-col gap-3 mt-4">
                <div className="rounded-xl border border-border bg-surface-soft p-4">
                  <span className="font-semibold text-foreground">Tips and donations are unavailable</span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    There is no checkout or payment processor. Clicking around
                    this demo never charges you or transfers money.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface-soft p-4">
                  <span className="font-semibold text-foreground">Feedback survey is unavailable</span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    No response form or submission endpoint is connected yet.
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
