import { Target, TrendingUp, Users, Zap } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";

const impacts = [
  {
    title: "Data-Driven Strategy",
    desc: "We don't guess. We analyze market trends and audience behavior to craft campaigns that guarantee high ROI.",
    icon: <Target className="h-6 w-6" />,
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Explosive Growth",
    desc: "Scale your revenue fast. Our paid advertising and SEO strategies are designed to skyrocket your brand's visibility.",
    icon: <TrendingUp className="h-6 w-6" />,
    color: "from-purple-500 to-fuchsia-500",
  },
  {
    title: "Audience Engagement",
    desc: "Turn casual visitors into loyal brand advocates. We build meaningful connections that drive long-term retention.",
    icon: <Users className="h-6 w-6" />,
    color: "from-cyan-500 to-blue-500",
  },
  {
    title: "Rapid Execution",
    desc: "Speed is a competitive advantage. We deploy, test, and optimize campaigns faster than traditional agencies.",
    icon: <Zap className="h-6 w-6" />,
    color: "from-emerald-500 to-teal-500",
  },
];

export default function MarketingImpact() {
  return (
    <section className="sec relative overflow-hidden bg-soft dark:bg-slate-900">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="anim-blob absolute -left-[10%] top-[10%] h-[500px] w-[500px] rounded-full bg-brand/10 mix-blend-multiply blur-3xl filter dark:bg-brand/20 dark:mix-blend-screen" />
        <div className="anim-blob absolute -right-[10%] bottom-[10%] h-[400px] w-[400px] rounded-full bg-brand-purple/10 mix-blend-multiply blur-3xl filter dark:bg-brand-purple/20 dark:mix-blend-screen" style={{ animationDelay: "2s" }} />
      </div>

      <Container className="relative z-10">
        <SectionHeading
          eyebrow="Market Domination"
          title={
            <>
              Transforming Clicks into <span className="gt">Revenue</span>
            </>
          }
          subtitle="Stop wasting ad spend. We engineer predictable growth engines tailored to your specific market demands, turning your marketing budget into a powerful investment."
        />

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {impacts.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.1}>
              <div className="group crd relative overflow-hidden h-full">
                {/* Hover gradient effect */}
                <div className={`absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br ${item.color} opacity-10 blur-2xl transition-all duration-500 group-hover:scale-[2.5] group-hover:opacity-20`} />
                
                <div className="relative z-10 flex flex-col sm:flex-row gap-6">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-ink dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
