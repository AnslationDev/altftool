import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export default function TodayInfo({ today }) {
  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center gap-2 bg--(background) border border-(--border)  text-(--primary) rounded-lg p-3 text-center"
    >
      <Calendar className="text-(--primary) w-5 h-5" />
      <p className="text-sm  text-(--muted-foreground) description">
        <strong>Today:</strong> {formatDate(today)}
      </p>
    </motion.div>
  );
}
