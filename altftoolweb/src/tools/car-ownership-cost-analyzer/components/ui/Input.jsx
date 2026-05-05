import React from 'react';

/**
 * Input component
 * @param {Object} props
 * @param {string} [props.label] - Input label
 * @param {string} [props.error] - Error message
 * @param {React.ReactNode} [props.icon] - Icon component
 * @param {string} [props.prefix] - Prefix text
 * @param {string} [props.suffix] - Suffix text
 * @param {string} [props.className] - Additional CSS classes
 */
export const Input = React.forwardRef(({ label, error, icon, prefix, suffix, className = '', ...props }, ref) => {
  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-xs font-black text-slate-700 dark:text-(--secondary) mb-2 uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-(--primary) transition-colors">
            {icon}
          </div>
        )}
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          className={`
            w-full border rounded-2xl px-5 py-3.5 focus:ring-4 text-(--foreground) bg-white dark:bg-white/5
            transition-all duration-300
            focus:outline-none focus:ring-(--primary)/10 focus:border-(--primary)
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-(--muted-foreground)/50
            ${icon || prefix ? 'pl-12' : ''}
            ${suffix ? 'pr-14' : ''}
            ${error
              ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500'
              : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20'
            }
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1 uppercase tracking-tighter">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
