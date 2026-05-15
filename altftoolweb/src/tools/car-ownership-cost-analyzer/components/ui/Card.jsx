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
  const baseStyles = 'rounded-[2rem] p-6 transition-all duration-300';

  const variantStyles = {
    default: 'bg-(--card) border border-(--border)',
    glass: 'bg-(--card) backdrop-blur-xl border border-(--border)',
    gradient: 'bg-gradient-to-br from-(--primary)/5 to-transparent backdrop-blur-xl border border-(--border)',
  };

  const hoverStyles = hover
    ? 'hover:translate-y-[-4px] cursor-pointer'
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
