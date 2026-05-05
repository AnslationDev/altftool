import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select component
 * @param {Object} props
 * @param {string} [props.label] - Select label
 * @param {string} [props.error] - Error message
 * @param {Array<{value: string, label: string}>} props.options - Select options
 * @param {string} [props.className] - Additional CSS classes
 */
export const Select = React.forwardRef(({ label, error, options, className = '', ...props }, ref) => {
  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-xs font-bold text-(--secondary) mb-2 uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          ref={ref}
          className={`
            w-full bg-slate-50 dark:bg-white/5 border rounded-2xl px-5 py-3.5 pr-12
            text-(--foreground) placeholder:text-(--muted-foreground) appearance-none cursor-pointer
            transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-(--primary)/10 focus:border-(--primary)
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? 'border-red-500/50 focus:ring-red-500/10 focus:border-red-500'
              : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
            }
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-(--primary) transition-colors pointer-events-none" />
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

Select.displayName = 'Select';

export default Select;
