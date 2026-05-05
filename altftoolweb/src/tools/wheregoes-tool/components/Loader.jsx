import { motion } from 'framer-motion';

const MESSAGES = [
  'Resolving DNS...',
  'Sending request...',
  'Following redirects...',
  'Capturing headers...',
  'Analyzing chain...',
];

export default function Loader({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      {/* SaaS style sleek spinner */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 w-12 h-12 border-[3px] border-muted rounded-full border-t-primary"
        />
        <div className="w-2 h-2 rounded-full bg-primary" />
      </div>

      {/* Rotating messages */}
      <div className="text-center">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-foreground font-medium text-sm"
        >
          {message || 'Tracing redirects...'}
        </motion.p>
        <p className="text-muted-foreground text-[13px] mt-1.5">This may take a few seconds</p>
      </div>
    </div>
  );
}

export { MESSAGES };
