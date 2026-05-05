import { motion, AnimatePresence } from 'framer-motion';
import { Activity, History, Home, Menu, X, Table } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function Navbar({ activeTab, navigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={15} />, end: true },
    { to: '/bulk', label: 'Bulk Check', icon: <Table size={15} />, end: false },
    { to: '/tester', label: 'API Tester', icon: <Activity size={15} />, end: false },
    { to: '/history', label: 'History', icon: <History size={15} />, end: false },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity size={16} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-foreground">
            Where<span className="gradient-text">Goes</span>
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          <nav className="flex items-center gap-1 mr-2">
            {navLinks.map(({ to, label, icon }) => {
              const isActive = activeTab === to;
              return (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  disabled={isActive}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {icon}
                  {label}
                </button>
              );
            })}
          </nav>
          <div className="w-px h-6 bg-border mx-2"></div>
        </div>

        {/* Mobile Toggle */}
        <div className="sm:hidden">
          <button
            className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-t border-border/50 bg-background overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label, icon }) => {
                const isActive = activeTab === to;
                return (
                  <button
                    key={to}
                    onClick={() => {
                      navigate(to);
                      setMobileOpen(false);
                    }}
                    disabled={isActive}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 w-full",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {icon}
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
