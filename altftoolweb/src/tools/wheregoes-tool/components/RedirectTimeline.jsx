import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle, Link2, Download } from 'lucide-react';
import RedirectCard from './RedirectCard';

export default function RedirectTimeline({ chain, totalTime, finalUrl, warnings }) {
  if (!chain || chain.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="font-medium text-lg text-foreground mb-1">No Trace Data</p>
        <p className="text-sm">There is no redirect data to display for this URL.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Summary bar */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[var(--card)] border shadow-sm rounded-xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
      >
        <div className="flex flex-wrap gap-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Link2 size={16} />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Hops</p>
              <p className="font-bold text-foreground font-mono leading-none">{chain.length}</p>
            </div>
          </div>
          
          <div className="w-px h-8 bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Time</p>
              <p className="font-bold text-foreground font-mono leading-none">{totalTime}ms</p>
            </div>
          </div>
        </div>

        {/* Final URL Box */}
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-4 py-3 sm:max-w-md w-full sm:w-auto">
          <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-0.5">Final</p>
            <a
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 dark:text-emerald-300 font-mono text-[13px] truncate block hover:underline"
            >
              {finalUrl}
            </a>
          </div>
        </div>
      </motion.div>

      {/* global warnings */}
      {warnings && warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-3"
        >
          {warnings.map((warning, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg px-4 py-3 text-[13px] shadow-sm"
            >
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-amber-800 dark:text-amber-300 font-medium">{warning}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* The actual timeline */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
        className="relative ml-2 sm:ml-4"
      >
        {chain.map((step, index) => (
          <RedirectCard
            key={index}
            step={step}
            index={index}
            isLast={index === chain.length - 1}
          />
        ))}
      </motion.div>
    </div>
  );
}
