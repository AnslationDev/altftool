"use client";

import { ChevronRight } from "lucide-react";

export default function DesignerToolkitsSection({ toolkits }) {
  return (
    <section className="px-4 py-16 sm:py-20 bg-[#F3F4FD]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="text-[28px] sm:text-[32px] font-bold text-[#0A0523]">Designer Toolkits</h2>
          <p className="mt-2 text-[#0A0523]/60">Curated starting points for every kind of design role.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {toolkits.map((toolkit) => {
            const Icon = toolkit.icon;
            return (
              <a
                key={toolkit.name}
                href={toolkit.href}
                className="group flex flex-col items-center justify-center p-8 rounded-[24px] bg-white/80 shadow-[inset_1.5px_1.5px_1.5px_rgba(255,255,255,0.66),0_20px_40px_rgba(10,5,35,0.03)] hover:shadow-[inset_1.5px_1.5px_1.5px_rgba(255,255,255,0.66),0_20px_40px_rgba(10,5,35,0.1)] transition-shadow text-center"
              >
                <div className="p-4 rounded-xl bg-white group-hover:bg-white/60 transition-colors mb-4">
                  <Icon className="w-8 h-8 text-[#0A0523]/70" />
                </div>
                <h3 className="font-bold text-[#0A0523]">{toolkit.name}</h3>
                <ChevronRight className="w-4 h-4 text-[#0A0523]/40 mt-2 group-hover:translate-x-1 transition-transform" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
