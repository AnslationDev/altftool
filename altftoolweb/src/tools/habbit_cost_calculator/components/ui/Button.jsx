import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button component
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'ghost' | 'danger'} [props.variant='primary'] - Button variant
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Button size
 * @param {boolean} [props.isLoading=false] - Loading state
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Disabled state
 */
export const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-[#0a0a0f] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variantStyles = {
    primary:
      'bg-(--primary) text-white hover:opacity-90 focus:ring-(--primary) shadow-lg shadow-(--primary)/25 hover:shadow-(--primary)/40',
    secondary:
      'bg-transparent border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white/90 hover:bg-slate-200/50 dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-white/30 focus:ring-slate-300 dark:focus:ring-white/30',
    ghost:
      'bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 focus:ring-slate-300 dark:focus:ring-white/20',
    danger:
      'bg-(--primary) text-white hover:opacity-90 focus:ring-(--primary) shadow-lg shadow-(--primary)/25 hover:shadow-(--primary)/40',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
