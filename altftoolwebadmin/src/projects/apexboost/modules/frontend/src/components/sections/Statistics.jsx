import Container from "../ui/Container";
import AnimatedCounter from "../ui/AnimatedCounter";
import { stats } from "../../data/stats";
import { Smile, Rocket, DollarSign, TrendingUp, Target, Handshake, Globe, Heart } from "lucide-react";

const icons = { Smile, Rocket, DollarSign, TrendingUp, Target, Handshake, Globe, Heart };

export default function Statistics() {
  return (
    <section className="relative sec overflow-hidden bg-slate-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[30rem] w-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[100px]" />

      <Container>
        <div className="mx-auto max-w-xl text-center mb-14">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Numbers that drive <span className="text-brand-cyan">Confidence</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          {stats.map((s, i) => {
            const Icon = icons[s.icon] || TrendingUp;
            return (
              <div
                key={s.label}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:bg-white/10"
              >
                {/* Glow effect on hover */}
                <div className="absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 rounded-full bg-brand/30 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-brand-cyan transition-transform duration-300 group-hover:scale-110">
                  <Icon size={24} strokeWidth={2} />
                </div>
                <div className="text-3xl font-bold text-white sm:text-4xl">
                  <AnimatedCounter
                    value={s.value}
                    decimals={s.decimals || 0}
                    prefix={s.prefix || ""}
                    suffix={s.suffix || ""}
                  />
                </div>
                <div className="mt-2 text-sm font-medium text-slate-400 group-hover:text-slate-300">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
