import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

export default function URLInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onSubmit(url.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit(e);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative group">
        <div
          className={cn(
            "relative flex items-center bg-[var(--card)] rounded-xl border shadow-sm transition-all duration-300",
            focused && "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary"
          )}
        >
          {/* Globe icon */}
          <div className="flex-shrink-0 pl-4 pr-3">
            <Globe
              size={18}
              className={cn(
                "transition-colors duration-200",
                focused ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>

          {/* Input */}
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com or any URL with redirects..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground py-4 pr-3 outline-none text-base font-mono min-w-0"
            disabled={isLoading}
            autoComplete="off"
            spellCheck="false"
          />

          {/* Submit button */}
          <div className="flex-shrink-0 pr-1.5 py-1.5">
            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="btn-primary h-10 px-5 gap-2 rounded-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span className="hidden sm:inline">Tracing</span>
                </div>
              ) : (
                <>
                  <Search size={16} />
                  <span className="hidden sm:inline">Trace</span>
                  <ArrowRight size={14} className="hidden sm:inline" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hint text */}
        <p className="mt-3 text-center text-[13px] text-muted-foreground">
          Enter any URL to trace its full redirect chain • Supports HTTP & HTTPS
        </p>
      </form>
    </motion.div>
  );
}
