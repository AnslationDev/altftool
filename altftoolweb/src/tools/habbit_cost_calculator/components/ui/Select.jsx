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
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-(--secondary) mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full bg-slate-100 dark:bg-white/5 border rounded-xl px-4 py-3 pr-10
            text-(--foreground) placeholder:text-(--muted-foreground) appearance-none cursor-pointer
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-(--primary)/50 focus:border-(--primary)/50
            disabled:opacity-50 disabled:cursor-not-allowed dark:text-black
            ${error
              ? 'border-(--primary)/40 dark:border-(--primary)/50 focus:ring-(--primary)/50 focus:border-(--primary)/50'
              : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20'
            }
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-black"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-950 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-2 text-sm text-(--primary) flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"q
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
