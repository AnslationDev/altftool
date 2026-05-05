import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Input component
 * @param {Object} props
 * @param {string} [props.label] - Input label
 * @param {string} [props.error] - Error message
 * @param {React.ReactNode} [props.icon] - Icon component
 * @param {string} [props.prefix] - Prefix text
 * @param {string} [props.className] - Additional CSS classes
 */
const Input = React.forwardRef(({ label, error, icon, prefix, className = '', ...props }, ref) => {
    return (
        <div className="relative w-full">
            {label && (
                <label className="block text-sm font-medium text-(--secondary) mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
                        {icon}
                    </div>
                )}
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">
                        {prefix}
                    </span>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'w-full bg-(--card) border border-(--border) rounded-xl px-4 py-3 text-(--foreground)',
                        'transition-all duration-200 outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary)/50',
                        'disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-500 dark:placeholder:text-white/30',
                        (icon || prefix) && 'pl-10',
                        error ? 'border-red-500/50 focus:ring-red-500/20' : 'hover:border-(--primary)/30',
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
