import { motion } from "framer-motion";

export default function AgeCards({ age }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center  bg-(--background) text-(--secondary) p-4"
    >
      {["Years", "Months", "Days"].map((label, i) => (
        <div
          key={label}
          className="bg-(--background) text-(--muted-foreground)  rounded-lg p-4 border border(--border)"
        >
          <div className="text-3xl font-bold bg-(--background )">
            {label === "Years" ? age.years : label === "Months" ? age.months : age.days}
          </div>
          <div className="text-sm text-(--secondary)">{label}</div>
        </div>
      ))}
    </motion.div>
  );
}
