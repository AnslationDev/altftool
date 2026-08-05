"use client";

import ScrollReveal from "./ScrollReveal";
import { WHY_CHOOSE_US } from "../data/staticContent";
import { baloo2 } from "../lib/fonts";

export default function WhyChooseUs() {
  return (
    <section className="border-t-[3px] border-[#171717] bg-[#ffffff] px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-[#FF5A5F]">Why choose us</p>
          <h2 className={`${baloo2.className} mt-2 text-2xl font-extrabold text-[#171717] sm:text-3xl`}>
            Built for fast, honest deal-hunting
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {WHY_CHOOSE_US.map((item, i) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.title} delay={i * 60}>
                <div className="tdp-neo-card h-full bg-[#ffffff] p-5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#171717] bg-[#FFE566] text-[#171717]">
                    <Icon size={18} strokeWidth={2.1} />
                  </span>
                  <h3 className={`${baloo2.className} mt-3.5 text-sm font-bold text-[#171717]`}>{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#5b5648]">{item.text}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
