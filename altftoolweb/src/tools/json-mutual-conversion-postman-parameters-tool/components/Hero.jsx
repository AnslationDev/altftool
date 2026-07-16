import { motion } from "framer-motion";
import { Braces } from "lucide-react";

export default function Hero() {
  return (
    <motion.section
      className="postman-hero pp-hero pp-glass pp-neon relative mb-8 overflow-hidden rounded-3xl p-5 sm:p-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="text-center">
        <div className="postman-hero-pill mb-7 inline-flex flex-wrap items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black">
          <Braces className="h-4 w-4" />
          <span>JSON Mutual Conversion Postman Parameters Tool</span>
          <span className="postman-hero-pill-extra">JSON to Params | Headers | cURL</span>
        </div>
        <h1 className="postman-hero-title mx-auto max-w-5xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
          JSON Mutual Conversion Postman Parameters Tool
        </h1>
        <p className="postman-hero-copy mx-auto mt-7 max-w-4xl text-lg leading-8 sm:text-2xl">
          Convert JSON, query params, form-data, x-www-form-urlencoded bodies, headers, and cURL in real time with local parsing.
        </p>
      </div>
    </motion.section>
  );
}
