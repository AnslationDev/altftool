"use client";

import React from "react";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-(--background) text-(--primary) text-center mb-5"
    >
      

      <h1 className="heading flex justify-center gap-2 animate-fade-up">
        PDF Annotation Tool
      </h1>

      <p className="description opacity-90 mt-3 text-(--secondary) text-2xl">
        The Ultimate Toolkit for Professional PDF Workflows.
      </p>

    </motion.div>
  );
}