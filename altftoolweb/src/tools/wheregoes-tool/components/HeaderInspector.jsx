import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';

const HEADER_GROUPS = {
  'Content': ['content-type', 'content-encoding', 'transfer-encoding', 'content-security-policy'],
  'Caching': ['cache-control', 'expires', 'pragma', 'etag', 'last-modified', 'vary'],
  'Security': ['strict-transport-security', 'x-frame-options', 'x-content-type-options', 'x-xss-protection', 'referrer-policy'],
  'Redirect': ['location'],
  'Server': ['server', 'x-powered-by', 'x-cache', 'cf-ray', 'cf-cache-status', 'date', 'connection', 'set-cookie'],
  'CORS': ['access-control-allow-origin'],
};

function getHeaderGroup(key) {
  for (const [group, keys] of Object.entries(HEADER_GROUPS)) {
    if (keys.includes(key.toLowerCase())) return group;
  }
  return 'Other';
}

const GROUP_COLORS = {
  Content: 'text-sky-500 dark:text-sky-400',
  Caching: 'text-purple-500 dark:text-purple-400',
  Security: 'text-rose-500 dark:text-rose-400',
  Redirect: 'text-amber-500 dark:text-amber-400',
  Server: 'text-slate-500 dark:text-slate-400',
  CORS: 'text-emerald-500 dark:text-emerald-400',
  Other: 'text-slate-500 dark:text-slate-400',
};

export default function HeaderInspector({ headers }) {
  const [isOpen, setIsOpen] = useState(false);

  const headerEntries = Object.entries(headers || {}).filter(([, v]) => v !== undefined);

  if (headerEntries.length === 0) {
    return (
      <p className="text-muted-foreground text-[13px] mt-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></span>
        No headers captured
      </p>
    );
  }

  const grouped = {};
  for (const [key, value] of headerEntries) {
    const group = getHeaderGroup(key);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push({ key, value });
  }

  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors group"
      >
        <span className="font-mono bg-[var(--muted)] text-foreground px-2 py-0.5 rounded-md border text-xs font-medium">
          {headerEntries.length} headers
        </span>
        <div className="flex items-center gap-1">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span className="font-medium">{isOpen ? 'Hide' : 'View'}</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-[var(--muted)]/30 rounded-lg border p-4 space-y-5 max-h-[300px] overflow-y-auto scrollbar-thin" style={{ backgroundColor: 'color-mix(in srgb, var(--muted), transparent 70%)' }}>
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <p className={cn("text-[11px] font-bold uppercase tracking-wider mb-2", GROUP_COLORS[group] || 'text-muted-foreground')}>
                    {group}
                  </p>
                  <div className="space-y-2">
                    {items.map(({ key, value }) => (
                      <div key={key} className="flex gap-4 text-[13px] font-mono leading-relaxed">
                        <span className="text-muted-foreground flex-shrink-0 min-w-[140px] select-none">{key}:</span>
                        <span className="text-foreground break-all">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
