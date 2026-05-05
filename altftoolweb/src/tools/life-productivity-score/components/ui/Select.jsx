import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Select component
 * @param {Object} props
 * @param {string} [props.label] - Select label
 * @param {string} [props.error] - Error message
 * @param {Array<{value: string, label: string}>} props.options - Select options
 * @param {string} [props.className] - Additional CSS classes
 */
const Select = React.forwardRef(({ label, error, options, className = '', ...props }, ref) => {
    return (
        <div className="relative w-full">
            {label && (
                <label className="block text-sm font-medium text-(--secondary) mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    ref={ref}
                    className={cn(
                        'w-full bg-(--card) border border-(--border) rounded-xl px-4 py-3 pr-10',
                        'text-(--foreground) appearance-none cursor-pointer outline-none transition-all duration-200',
                        'focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary)/50',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error ? 'border-red-500/50 focus:ring-red-500/20' : 'hover:border-(--primary)/30',
                        className
                    )}
                    {...props}
                >
                    {options.map((option) => (
                        <option 
                            key={option.value} 
                            value={option.value}
                            className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
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

Select.displayName = 'Select';

export default Select;
