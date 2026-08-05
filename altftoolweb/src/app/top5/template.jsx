"use client";

import { motion } from "framer-motion";

// template.jsx (unlike layout.jsx) remounts on every navigation within
// /top5, which is what makes this page-enter animation fire on each route
// change instead of only on first load.
export default function Top5Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
