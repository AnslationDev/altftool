import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button component
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'} [props.variant='primary'] - Button variant
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Button size
 * @param {boolean} [props.isLoading=false] - Loading state
 * @param {boolean} [props.pill=false] - Pill shape
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Disabled state
 * @param {React.ReactNode} [props.icon] - Icon component
 */
export const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  pill = false,
  children,
  className = '',
  disabled,
  icon: Icon,
  ...props
}, ref) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-(--background) disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] gap-2 tracking-tight';

  const variantStyles = {
    primary:
      'bg-(--primary) text-white hover:brightness-110 focus:ring-(--primary)',
    secondary:
      'bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-950 dark:text-white hover:bg-slate-300 dark:hover:bg-white/20 focus:ring-slate-400',
    ghost:
      'bg-transparent text-slate-600 dark:text-(--secondary) hover:text-(--foreground) hover:bg-slate-100 dark:hover:bg-white/5 focus:ring-slate-300',
    danger:
      'bg-[#ef4444] text-white hover:bg-red-600 focus:ring-red-500',
    outline:
      'bg-transparent border-2 border-(--primary) text-(--primary) hover:bg-(--primary)/5 focus:ring-(--primary)',
  };

  const sizeStyles = {
    sm: 'px-5 py-2 text-xs',
    md: 'px-7 py-3 text-sm',
    lg: 'px-9 py-4 text-base',
  };

  const shapeStyles = pill ? 'rounded-full' : 'rounded-2xl';

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${shapeStyles} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
