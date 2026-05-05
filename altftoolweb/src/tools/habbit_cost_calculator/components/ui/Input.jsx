import React from 'react';

/**
 * Input component
 * @param {Object} props
 * @param {string} [props.label] - Input label
 * @param {string} [props.error] - Error message
 * @param {React.ReactNode} [props.icon] - Icon component
 * @param {string} [props.prefix] - Prefix text
 * @param {string} [props.className] - Additional CSS classes
 */
export const Input = React.forwardRef(({ label, error, icon, prefix, className = '', ...props }, ref) => {
  return (
    <div className="relative">
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
          className={`
            w-full border border-(--border) rounded-lg px-4 py-2 focus:ring-2 text-(--secondary) cursor-pointer
            transition-all duration-200
            focus:outline-none focus:ring-(--primary)/50 focus:border-(--primary)/50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon || prefix ? 'pl-10' : ''}
            ${error
              ? 'border-(--primary)/40 dark:border-(--primary)/50 focus:ring-(--primary)/50 focus:border-(--primary)/50'
              : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-(--primary) flex items-center gap-1">
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
