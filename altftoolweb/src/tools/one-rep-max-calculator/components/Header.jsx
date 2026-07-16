import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-(--background) text-(--primary) text-center mb-5"
    >
      <h1 className="heading flex justify-center gap-2 animate-fade-up">
        One Rep Max Calculator
      </h1>
      <p className="description opacity-90 mt-1 text-(--secondary) text-2xl animate-fade-up mb-6">
        Estimate your true max strength with proven formulas
      </p>
    </motion.div>
  );
}
