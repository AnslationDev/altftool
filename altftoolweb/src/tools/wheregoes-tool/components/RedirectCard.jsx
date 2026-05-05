import { motion } from 'framer-motion';
import { ExternalLink, Clock, AlertTriangle, Info, Globe, Search, ArrowDownRight, Activity } from 'lucide-react';
import HeaderInspector from './HeaderInspector';
import { cn } from '../lib/utils';

export default function RedirectCard({ step, index, isLast }) {
  const isSuccess = step.status >= 200 && step.status < 300;
  const isRedirect = step.status >= 300 && step.status < 400;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative flex gap-4 sm:gap-6"
    >
      {/* Structural Timeline Connector */}
      <div className="relative flex-shrink-0 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.1, type: 'spring', stiffness: 300 }}
          className={cn(
            "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 flex-shrink-0 bg-background shadow-xs",
            isSuccess ? "border-emerald-500 text-emerald-500" :
            isRedirect ? "border-amber-500 text-amber-500" :
            step.status >= 400 ? "border-rose-500 text-rose-500" :
            "border-muted-foreground text-muted-foreground"
          )}
        >
          {index + 1}
        </motion.div>
        {!isLast && <div className="w-px flex-1 bg-border my-1" style={{ minHeight: '3rem' }} />}
      </div>

      {/* Card Body */}
      <div className={cn(
        "flex-1 mb-8 glass-card p-5 transition-all duration-300",
        isLast && "ring-2 ring-primary/20 border-primary/40 shadow-xl shadow-primary/5"
      )}>
        {/* Top Header Group */}
        <div className="flex items-start justify-between gap-4 flex-wrap pb-1">
          <div className="flex items-center gap-3 flex-wrap">
            {step.status && (
              <span className={cn(
                "px-2.5 py-0.5 rounded-lg text-[13px] font-bold font-mono",
                isSuccess ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                isRedirect ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              )}>
                {step.status}
              </span>
            )}
            
            {isLast && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono uppercase bg-primary/10 text-primary border border-primary/20">
                Final Destination
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {step.dnsTime !== undefined && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-[var(--muted)] px-2 py-0.5 rounded border border-border/50" title="DNS Lookup Time">
                <Globe size={10} />
                <span>DNS: {step.dnsTime}ms</span>
              </div>
            )}
            {step.ttfb !== undefined && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-[var(--muted)] px-2 py-0.5 rounded border border-border/50" title="Time to First Byte">
                <Activity size={10} />
                <span>TTFB: {step.ttfb}ms</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium bg-[var(--muted)] px-2.5 py-1 rounded-md border border-border/20 shadow-xs">
              <Clock size={12} className="text-primary/70" />
              <span>{step.responseTime}ms</span>
            </div>
          </div>
        </div>

        {/* URL Link */}
        <div className="mt-3 flex items-start gap-2 group">
          <a
            href={step.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 font-mono text-[14px] text-foreground break-all leading-snug hover:text-primary transition-colors flex items-start gap-2"
          >
            <span className="flex-1">{step.url}</span>
            <ExternalLink size={14} className="flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
          </a>
        </div>

        {/* Suggestion */}
        {step.suggestion && (
          <div className="mt-3 flex items-start gap-2 text-[12px] bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 px-3 py-2 rounded-lg border border-sky-200 dark:border-sky-500/20">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <span className="font-medium italic">{step.suggestion}</span>
          </div>
        )}

        {/* SEO Insights */}
        {step.seo && (
          <div className="mt-5 pt-4 border-t border-border/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <Search size={10} /> SEO Insights
            </p>
            <div className="space-y-3 bg-muted/20 rounded-xl p-4 border border-border/20">
              {step.seo.title && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Title Tag</p>
                  <p className="text-[13px] text-foreground font-medium leading-tight">{step.seo.title}</p>
                </div>
              )}
              {step.seo.description && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Description</p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed italic">{step.seo.description}</p>
                </div>
              )}
              {step.seo.h1 && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Primary H1</p>
                    <p className="text-[13px] text-foreground font-medium truncate">{step.seo.h1}</p>
                  </div>
                </div>
              )}
              {step.seo.canonical && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Canonical URL</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-primary break-all">
                    <ArrowDownRight size={10} />
                    <span className="font-mono">{step.seo.canonical}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Errors */}
        {step.error && (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 rounded-lg px-4 py-3 border border-rose-200 dark:border-rose-500/20 shadow-xs">
            <AlertTriangle size={14} className="flex-shrink-0" />
            <span className="font-medium">{step.error}</span>
          </div>
        )}

        {/* Header Inspector */}
        <div className="mt-2">
          <HeaderInspector headers={step.headers} />
        </div>
      </div>
    </motion.div>
  );
}
