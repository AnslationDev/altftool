import { motion } from "framer-motion";

/**
 * Removed here for the same reason as in src/app/siding/components/TrustBar.jsx,
 * which this file was a copy of:
 *
 * A counter row claiming "5,000+ Projects Completed", "98% Customer
 * Satisfaction", "25+ Years of Experience" and "50+ Industry Experts", and a
 * badge strip claiming BBB "A+ Accredited", GAF "MasterElite", ENERGY STAR
 * "Partner", NARI "Certified Remodeler", EPA "Lead-Safe Certified",
 * InstallShield "Pro Network", HomeAdvisor "Elite Service" and Angi "Certified
 * Pro". None of it is real. EPA Lead-Safe certification is a legal requirement
 * for renovation work on pre-1978 US housing; BBB and ENERGY STAR are actively
 * enforced marks.
 *
 * This lander is noindex, so search never sent anyone here — but it is reachable
 * from the Housing Services directory, and a visitor who arrived was shown
 * accreditations that do not exist, next to a form asking for their phone
 * number.
 *
 * The palette here is deliberately not AltFTool's: these landers demonstrate a
 * template for a notional contractor, and the hardcoded #0D3B66/#00AEEF is kept
 * so this section matches the rest of the page rather than half-converting one
 * component. That is an exception for the mock-brand landers, not a pattern to
 * copy elsewhere.
 */
export default function TrustBar() {
  return (
    <section className="relative -mt-20 z-10 px-5 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-3xl shadow-premium border border-slate-100 p-8 lg:p-12"
        >
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-[#00AEEF] mb-3">
              Template preview
            </div>
            <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-[#0D3B66]">
              This is a layout demonstration
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Siding Pros is a sample provider, used to show how a contractor
              listing could be put together. No company stands behind it, so the
              page carries no project count, no customer rating and no trade
              accreditation — and the estimate form does not send anything.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
