import { motion } from "framer-motion";
import { Workflow } from "lucide-react";
import { batchGenerationConfig } from "../config/batchGenerationConfig";

export default function Header({ outputsCount, generatedCount, successRate, exportReady, Stat }) {
  const { header, labels } = batchGenerationConfig;

  return (
    <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <section className="mb-5 overflow-hidden rounded-xl border border-(--border) bg-(--card) p-5 shadow-lg sm:p-6">
        <div className="mx-auto flex max-w-4xl min-w-0 flex-col items-center text-center">
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-(--border) bg-(--background) px-3.5 py-1.5 text-xs font-bold text-(--primary)">
            <Workflow className="h-4 w-4 shrink-0" />
            <span className="break-words">{header.eyebrow}</span>
          </div>
          <h1 className="heading max-w-3xl break-words text-center">
            {header.title}
          </h1>
          <p className="description mt-3 max-w-2xl break-words text-center">
            {header.description}
          </p>
        </div>

        <div className="mx-auto mt-5 grid w-full max-w-3xl min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label={labels.total} value={outputsCount} compact />
          <Stat label={labels.generated} value={generatedCount} compact />
          <Stat label={labels.health} value={`${successRate}%`} compact />
          <Stat label={labels.export} value={exportReady ? labels.ready : labels.blocked} compact />
        </div>
      </section>
    </motion.header>
  );
}
