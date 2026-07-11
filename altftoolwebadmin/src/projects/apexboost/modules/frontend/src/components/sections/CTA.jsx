import { ArrowRight, CalendarCheck } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import { goTo } from "../../utils/nav";

export default function CTA() {
  return (
    <section className="sec">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 anim-blob rounded-full bg-brand/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 anim-blob rounded-full bg-brand-purple/40 blur-3xl" style={{ animationDelay: "3s" }} />
            <div className="pointer-events-none absolute inset-0 bg-g opacity-40" />
            <div className="relative mx-auto max-w-2xl">
              <span className="chp-b mb-5 bg-white/10 text-brand-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Your growth starts today
              </span>
              <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Ready to turn marketing into your biggest growth lever?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-white/70">Join 520+ brands scaling with ApexBoost. Get a free, no-obligation strategy session with our senior growth team.</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button onClick={() => goTo("/contact")} className="btn btn-p"><CalendarCheck size={16} /> Book Free Consultation</button>
                <button onClick={() => goTo("/services")} className="btn btn-l">Explore Services <ArrowRight size={16} /></button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
