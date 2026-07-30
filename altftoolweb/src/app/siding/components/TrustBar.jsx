import { motion } from "framer-motion";

/**
 * What used to be here, and why none of it is:
 *
 * A counter row — "5,000+ Projects Completed", "98% Customer Satisfaction",
 * "25+ Years of Experience", "50+ Industry Experts" — under the heading
 * "Trusted by Thousands of Homeowners". No project, no customer and no year of
 * that exists.
 *
 * And a scrolling badge strip labelled "Certified Partners & Industry
 * Standards": BBB "A+ Accredited", GAF "MasterElite", ENERGY STAR "Partner",
 * NARI "Certified Remodeler", EPA "Lead-Safe Certified", InstallShield "Pro
 * Network", HomeAdvisor "Elite Service", Angi "Certified Pro". None of those
 * accreditations is held. EPA Lead-Safe certification is a legal requirement
 * for renovation work on pre-1978 US housing, so claiming it is a federal
 * matter rather than a marketing choice; BBB and ENERGY STAR are actively
 * enforced marks. The page also collects a homeowner's phone number, which is
 * what turns a false badge into a real harm.
 *
 * Nothing replaces them. A softened version — "industry standards", "trusted by
 * homeowners" — is the same claim with deniability. What the section says now is
 * true of the page as it actually is: a template, with nothing behind it yet.
 *
 * If a real business ever stands behind this page, each badge goes back only
 * once the accreditation exists, and the counters only once something counts
 * them.
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
          className="bg-surface rounded-3xl shadow-premium border border-border p-8 lg:p-12"
        >
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-secondary mb-3">
              Template preview
            </div>
            <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-primary">
              This is a layout demonstration
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foreground/75">
              The page shows how a siding contractor&apos;s site could be put
              together. There is no company behind it, so it carries no project
              count, no customer rating and no trade accreditation — and the
              estimate form below does not send anything.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
