import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', variant = 'glass', hover = false, onClick, noPadding = false }) => {
  const baseStyles = `rounded-[2rem] ${noPadding ? 'p-0' : 'p-6'} transition-all duration-300 overflow-hidden`;

  const variantStyles = {
    default: 'bg-(--card) shadow-lg border border-(--border)',
    glass: 'bg-(--card)/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl shadow-indigo-500/5',
    gradient: 'bg-gradient-to-br from-(--primary)/5 to-transparent backdrop-blur-2xl border border-white/20 shadow-xl',
    outline: 'border border-(--border) bg-transparent',
    flat: 'bg-slate-50/50 dark:bg-white/5 backdrop-blur-md shadow-lg'
  };

  const hoverStyles = hover
    ? 'hover:-translate-y-2 hover:shadow-indigo-500/20 cursor-pointer'
    : '';

  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.01, transition: { duration: 0.3 } } : undefined}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.glass} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default Card;
