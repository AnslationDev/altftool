import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <h1 className="heading flex justify-center gap-2 animate-fade-up">
        Ishihara Color Blind Test
      </h1>
      <p className="description opacity-90 mt-2 text-(--secondary) text-xl animate-fade-up">
        Professional screening experience inspired by medical Ishihara plates
      </p>
      <div className="mt-4 inline-block px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium border border-red-200">
        ⚠️ This is not a medical diagnosis tool.
      </div>
    </motion.div>
  );
}
