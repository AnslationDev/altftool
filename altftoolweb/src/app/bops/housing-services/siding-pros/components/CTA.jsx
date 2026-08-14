import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";

export default function CTA() {
  return (
    <section className="pt-4 pb-6 lg:pt-6 lg:pb-8 px-5 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#0D3B66] via-[#1E5AA8] to-[#00AEEF] p-10 lg:p-16 text-white shadow-premium"
        >
          {/* Decorative */}
          <div className="absolute inset-0 bg-grid opacity-[0.07]" />
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-[28rem] h-[28rem] rounded-full bg-[#00AEEF]/30 blur-3xl" />

          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark text-white text-xs font-bold tracking-wider uppercase mb-5">
                Limited Spring Booking
              </div>
              <h2 className="font-display font-extrabold text-3xl lg:text-5xl leading-tight">
                Ready to Upgrade Your<br />Home's Exterior?
              </h2>
              <p className="mt-5 text-lg text-white/85 max-w-lg">
                Join thousands of homeowners who trust EliteShield to protect what matters most.
                Free in-home estimate, no pressure, lifetime warranty.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:items-end">
              <a
                href="#contact"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-[#0D3B66] font-bold shadow-xl hover:scale-[1.04] transition-transform"
              >
                Request Free Estimate
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#demo-only"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full glass-dark text-white font-semibold hover:bg-white/15 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Demo only
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
