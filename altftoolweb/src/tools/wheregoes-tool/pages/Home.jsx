import { useState, useEffect, useRef } from 'react';
// Removed react-router-dom
import { motion } from 'framer-motion';
import { Activity, Shield, Zap, Globe, Github } from 'lucide-react';
import URLInput from '../components/URLInput';
import Loader, { MESSAGES } from '../components/Loader';
import { checkUrl } from '../services/api';
import { saveResult } from '../services/firebase';

const EXAMPLE_URLS = [
  'http://google.com',
  'http://github.com',
  'http://twitter.com',
  'http://t.co',
];

const FEATURES = [
  {
    icon: <Globe size={18} />,
    title: 'Full Redirect Chain',
    desc: 'Track every single HTTP hop from the source to the final destination',
  },
  {
    icon: <Zap size={18} />,
    title: 'Response Times',
    desc: 'Measure exact latency and performance at every redirect step',
  },
  {
    icon: <Shield size={18} />,
    title: 'Header Analysis',
    desc: 'Inspect security headers, cache controls, and CORS policies per step',
  },
  {
    icon: <Activity size={18} />,
    title: 'Loop Detection',
    desc: 'Automatically detect infinite redirect loops and limit thresholds',
  },
];

export default function Home({ navigate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadMsg, setLoadMsg] = useState(MESSAGES[0]);
  const msgIntervalRef = useRef(null);

  useEffect(() => {
    document.title = 'WhereGoes | Free URL Redirect Tracer & Link Analyzer';
    return () => clearInterval(msgIntervalRef.current);
  }, []);

  const handleTrace = async (url) => {
    setError('');
    setIsLoading(true);
    let msgIdx = 0;
    setLoadMsg(MESSAGES[0]);
    msgIntervalRef.current = setInterval(() => {
      msgIdx = (msgIdx + 1) % MESSAGES.length;
      setLoadMsg(MESSAGES[msgIdx]);
    }, 1200);

    const { data, error: apiError } = await checkUrl(url);

    clearInterval(msgIntervalRef.current);
    setIsLoading(false);

    if (apiError) {
      setError(apiError);
      return;
    }

    // Save to Firebase (non-blocking so ad-blockers don't break the trace)
    saveResult(url, data);

    // Navigate to result page
    navigate('/result', { state: { result: data, url } });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 max-w-5xl mx-auto w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          <span className="text-primary text-[13px] font-semibold tracking-wide">WhereGoes Tracer API v1.0</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-center mb-6 tracking-tight leading-[1.1]"
        >
          Where Does{' '}
          <span className="text-primary">Your URL</span>
          <br />
          <span className="text-foreground">Actually Go?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-lg sm:text-xl text-center max-w-2xl mb-12 font-medium"
        >
          Trace the complete redirect chain of any URL. Visualize every hop,
          inspect response headers, and detect redirect loops in real-time.
        </motion.p>

        {/* Input */}
        <div className="w-full max-w-3xl">
          <URLInput onSubmit={handleTrace} isLoading={isLoading} />
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-lg px-4 py-3 text-rose-600 dark:text-rose-400 text-sm max-w-2xl mx-auto text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Loader */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 w-full max-w-2xl">
            <Loader message={loadMsg} />
          </motion.div>
        )}

        {/* Example URLs */}
        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-3 justify-center items-center"
          >
            <span className="text-muted-foreground text-[13px] font-medium uppercase tracking-widest">Try it</span>
            {EXAMPLE_URLS.map((ex) => (
              <button
                key={ex}
                onClick={() => handleTrace(ex)}
                className="text-[13px] font-mono text-muted-foreground hover:text-primary bg-muted/50 hover:bg-primary/10 px-3 py-1.5 rounded-md border hover:border-primary/30 transition-all duration-200"
              >
                {ex}
              </button>
            ))}
          </motion.div>
        )}

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="glass-card-hover p-6 group flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <p className="font-bold text-foreground text-lg mb-2">{f.title}</p>
              <p className="text-[14px] text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
