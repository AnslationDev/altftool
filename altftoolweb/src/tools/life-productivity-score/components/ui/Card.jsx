import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Card component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {'default' | 'glass' | 'gradient' | 'outline'} [props.variant='glass'] - Card variant
 * @param {boolean} [props.hover=false] - Enable hover effect
 * @param {Function} [props.onClick] - Click handler
 */
const Card = ({ children, className = '', variant = 'glass', hover = false, onClick }) => {
    const baseStyles = 'rounded-2xl p-6 transition-all duration-300 relative overflow-hidden';

    const variantStyles = {
        default: 'bg-(--card)',
        glass: 'bg-(--card) backdrop-blur-xl border border-white/10',
        gradient: 'bg-gradient-to-br from-blue-500/5 to-blue-600/5 backdrop-blur-xl border border-white/10',
        outline: 'bg-transparent border border-slate-200 dark:border-white/10',
    };

    const hoverStyles = hover
        ? 'hover:translate-y-[-4px] cursor-pointer'
        : '';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                baseStyles,
                variantStyles[variant],
                hoverStyles,
                className
            )}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
};

export default Card;
