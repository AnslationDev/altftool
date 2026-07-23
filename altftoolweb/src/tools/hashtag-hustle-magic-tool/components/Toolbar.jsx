"use client";

import { Copy, Trash2, Wand2, Columns, SquareSplitHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "./ui/button";
export const Toolbar = ({ onFormat, onCopy, onClear, onToggleView, isSplitView = true }) => {
  const handleCopy = () => {
    onCopy();
    toast.success("Code copied to clipboard!", {
      duration: 2e3
    });
  };
  const handleClear = () => {
    onClear();
    toast.info("Editor cleared", {
      duration: 2e3
    });
  };
  const handleFormat = () => {
    onFormat();
    toast.success("Code formatted!", {
      duration: 2e3
    });
  };
  return <motion.div
    className="flex flex-wrap gap-3"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
      <Button
    onClick={handleFormat}
    className="glass-panel hover:scale-105 smooth-transition hover:glow-effect bg-primary/90 hover:bg-primary text-(--foreground) shadow-lg"
    variant="default"
    size="lg"
  >
        <Wand2 className="w-4 h-4 mr-2" />
        Format
      </Button>

      <Button
    onClick={handleCopy}
    className="glass-panel hover:scale-105 smooth-transition hover:glow-effect bg-secondary/90 hover:bg-secondary text-(--foreground) shadow-lg"
    variant="secondary"
    size="lg"
  >
        <Copy className="w-4 h-4 mr-2" />
        Copy
      </Button>

      <Button
    onClick={handleClear}
    className="glass-panel hover:scale-105 smooth-transition hover:glow-effect bg-destructive/90 hover:bg-destructive text-(--foreground) shadow-lg"
    variant="outline"
    size="lg"
  >
        <Trash2 className="w-4 h-4 mr-2" />
        Clear
      </Button>

      {onToggleView && <Button
    onClick={onToggleView}
    className="glass-panel hover:scale-105 smooth-transition hover:glow-effect bg-accent/90 hover:bg-accent text-(--foreground) shadow-lg"
    variant="ghost"
    size="lg"
  >
          {isSplitView ? <>
              <SquareSplitHorizontal className="w-4 h-4 mr-2" />
              Single View
            </> : <>
              <Columns className="w-4 h-4 mr-2" />
              Split View
            </>}
        </Button>}
    </motion.div>;
};
