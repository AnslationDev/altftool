"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, LayoutGrid, Table, History as HistoryIcon } from 'lucide-react';
import Home from './pages/Home';
import BulkChecker from './pages/BulkChecker';
import ApiTester from './pages/ApiTester';
import Result from './pages/Result';
import History from './pages/History';
import './index.css';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.25,
  ease: 'easeInOut',
};

function AnimatedRoute({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

const NAV_TABS = [
  { to: '/', label: 'Tracer', icon: Activity },
  { to: '/bulk', label: 'Bulk Check', icon: Table },
  { to: '/tester', label: 'API Tester', icon: LayoutGrid },
  { to: '/history', label: 'History', icon: HistoryIcon },
];

export default function WheregoesEntry() {
  const [activeTab, setActiveTab] = useState('/');
  const [resultState, setResultState] = useState(null);

  const navigate = (path, options) => {
    setActiveTab(path);
    if (options && options.state) {
      setResultState(options.state);
    }
  };

  // Which nav tab is "active" — /result maps back to /
  const activeNavTab = activeTab === '/result' ? '/' : activeTab;

  const renderContent = () => {
    switch (activeTab) {
      case '/':        return <Home navigate={navigate} />;
      case '/result':  return <Result navigate={navigate} resultState={resultState} />;
      case '/bulk':    return <BulkChecker navigate={navigate} />;
      case '/tester':  return <ApiTester navigate={navigate} />;
      case '/history': return <History navigate={navigate} />;
      default:         return <Home navigate={navigate} />;
    }
  };

  return (
    <div className="wheregoes-app">
      {/* ── Tab Bar ─────────────────────────────────────────── */}
      <div className="wheregoes-tabbar">
        {NAV_TABS.map(({ to, label, icon: Icon }) => {
          const isActive = activeNavTab === to;
          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`wheregoes-tab${isActive ? ' wheregoes-tab--active' : ''}`}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Page Content ────────────────────────────────────── */}
      <main className="wheregoes-content">
        <AnimatePresence mode="wait">
          <AnimatedRoute key={activeTab}>
            {renderContent()}
          </AnimatedRoute>
        </AnimatePresence>
      </main>
    </div>
  );
}
