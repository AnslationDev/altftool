import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Container from "../ui/Container";
import { goTo } from "../../utils/nav";
import aboutHeroTeam from "../../assets/about-hero-team.jpg";

/**
 * Full-bleed About hero — team photo background with a heading overlay,
 * two-column description and an "Explore Our Services" CTA.
 */
export default function AboutHero() {
  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden">
      {/* Background image */}
      <img
        src={aboutHeroTeam}
        alt="The ApexBoost marketing team"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Lighter gradient overlay — keeps image visible while text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-slate-950/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/45 to-transparent" />

      {/* Content */}
      <Container className="relative flex min-h-[88vh] flex-col justify-end pb-14 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-brand-cyan" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-cyan">
              About ApexBoost
            </span>
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            We help brands grow through Digital, Affiliate &amp; Advertising marketing
          </h1>
        </motion.div>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-white/20" />

        {/* Description + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid items-end gap-8 lg:grid-cols-[1fr_1fr_auto]"
        >
          <p className="text-sm leading-relaxed text-white/80">
            ApexBoost is a performance marketing partner for ambitious brands that grow
            through results: expert content, search visibility, affiliate partnerships
            and profitable paid acquisition.
          </p>
          <p className="text-sm leading-relaxed text-white/80">
            We help leadership teams see where demand is already forming, then build the
            campaigns, pages, content and reporting needed to convert that attention into
            measurable revenue.
          </p>
          <button
            onClick={() => goTo("/services")}
            className="btn btn-p shrink-0 justify-self-start lg:justify-self-end"
          >
            Explore Our Services <ArrowUpRight size={16} />
          </button>
        </motion.div>
      </Container>
    </section>
  );
}
