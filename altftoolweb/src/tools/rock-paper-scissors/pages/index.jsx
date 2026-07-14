"use client";

import { useState } from "react";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import Dashboard from "../components/Dashboard";
import RpsGame from "../components/RpsGame";
import CoinGame from "../components/CoinGame";

export default function ToolHome() {
  const [view, setView] = useState("home"); // home | rps | coin

  const goHome = () => setView("home");

  return (
    <div className="min-h-screen bg-(--background) p-4 text-(--foreground) md:p-8">
      <Toaster position="top-center" richColors />

      <div className="mb-6 pt-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-(--primary)/30 bg-(--primary)/10 px-4 py-1.5 text-xs font-semibold text-(--primary)">
          Game Hub
        </div>
        <h1 className="section-title tool-heading-accent">Rock Paper Scissors</h1>
        <p className="description mx-auto mt-3 max-w-xl text-(--muted-foreground)">
          Two premium games in one hub — a classic Rock Paper Scissors showdown
          and a realistic 3D Flip Coin, with live stats, streaks, and sound.
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {view === "home" && <Dashboard onPlay={setView} />}
          {view === "rps" && <RpsGame onBack={goHome} />}
          {view === "coin" && <CoinGame onBack={goHome} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
