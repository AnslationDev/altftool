"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const features = [
  {
    asset: "/assets/why-icons/curated-trusted.svg",
    title: "Curated & Trusted",
    text: "We review and handpick only the best tools.",
  },
  {
    asset: "/assets/why-icons/privacy-first.svg",
    title: "Privacy First",
    text: "Your data is safe with us. Always.",
  },
  {
    asset: "/assets/why-icons/works-everywhere.svg",
    title: "Works Everywhere",
    text: "Use on any device, in any browser.",
  },
  {
    asset: "/assets/why-icons/no-signup.svg",
    title: "No Signup Needed",
    text: "Instant access to all tools. No hassle.",
  },
];

export default function WhyUsersLove() {
  return (
    <section className="section">
      <div className="home-why-shell grid overflow-hidden rounded-[1.45rem] bg-white shadow-[0_22px_58px_rgba(55,49,120,0.08)] ring-1 ring-[var(--home-border)] dark:bg-[var(--card)] lg:grid-cols-[0.9fr_1.18fr_0.9fr]">
        <div className="p-7 md:p-9 lg:p-10">
          <p className="home-kicker">Why choose AltF?</p>
          <h2 className="max-w-sm text-[2rem] font-black leading-[1.12] text-[var(--foreground)]">
            Everything you need. All in one place.
          </h2>
          <p className="mt-5 max-w-md text-[0.95rem] font-semibold leading-7 text-[var(--muted-foreground)]">
            AltF brings the best tools, extensions, and resources together so
            you can focus on what matters most.
          </p>
          <Link href="/tools/all" className="home-why-button">
            Learn more about us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-x-6 gap-y-8 border-y border-[var(--home-border)] p-7 md:grid-cols-2 md:p-9 lg:border-x lg:border-y-0 lg:p-10">
          {features.map((feature) => (
            <article key={feature.title} className="flex gap-4">
              <span className="home-why-icon">
                <Image
                  src={feature.asset}
                  alt=""
                  aria-hidden
                  width={72}
                  height={72}
                  className="h-12 w-12"
                  unoptimized
                />
              </span>
              <span>
                <span className="block text-[0.95rem] font-black text-[var(--foreground)]">
                  {feature.title}
                </span>
                <span className="mt-1.5 block text-[0.8rem] font-semibold leading-6 text-[var(--muted-foreground)]">
                  {feature.text}
                </span>
              </span>
            </article>
          ))}
        </div>

        <div className="relative min-h-[285px] overflow-hidden lg:min-h-0">
          <Image
            src="https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1100&auto=format&fit=crop"
            alt="Professionals using AltF tools"
            fill
            sizes="(min-width: 1024px) 28vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
