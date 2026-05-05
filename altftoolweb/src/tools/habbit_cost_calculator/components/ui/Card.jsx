import React from 'react';

/**
 * Card component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {'default' | 'glass' | 'gradient'} [props.variant='glass'] - Card variant
 * @param {boolean} [props.hover=false] - Enable hover effect
 * @param {Function} [props.onClick] - Click handler
 */
export const Card = ({ children, className = '', variant = 'glass', hover = false, onClick }) => {
  const baseStyles = 'rounded-2xl p-6 transition-all duration-300';

  const variantStyles = {
    default: 'bg-(--card)',
    glass: 'bg-(--card) backdrop-blur-xl shadow-2xl',
    gradient: 'bg-gradient-to-br from-blue-500/5 to-blue-600/5 backdrop-blur-xl shadow-2xl',
  };

  const hoverStyles = hover
    ? 'hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-(--primary)/10 cursor-pointer'
    : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
