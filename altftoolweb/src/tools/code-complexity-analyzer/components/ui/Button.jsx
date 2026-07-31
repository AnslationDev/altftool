import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

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
      'bg-(--primary) text-(--primary-foreground) hover:brightness-110 focus:ring-(--primary) shadow-lg shadow-(--primary)/20',
    secondary:
      'bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 focus:ring-slate-400',
    ghost:
      'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 focus:ring-slate-300',
    danger:
      'bg-(--danger) text-white hover:brightness-110 focus:ring-(--danger)',
    outline:
      'bg-transparent border-2 border-(--primary) text-(--primary) hover:bg-(--primary)/10 focus:ring-(--primary)',
  };

  const sizeStyles = {
    xs: 'px-3 py-1.5 text-[10px]',
    sm: 'px-5 py-2 text-xs',
    md: 'px-7 py-3 text-sm',
    lg: 'px-9 py-4 text-base',
  };

  const shapeStyles = pill ? 'rounded-full' : 'rounded-2xl';

  return (
    <motion.button
      ref={ref}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${shapeStyles} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className={size === 'sm' || size === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      ) : null}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
