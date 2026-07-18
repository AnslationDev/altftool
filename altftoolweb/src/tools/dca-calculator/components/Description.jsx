import { TrendingUp, BarChart3, Calendar, PiggyBank, ShieldCheck, Wallet } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Dollar Cost Averaging",
    description:
      "Understand how regular, fixed-amount investments reduce the impact of market volatility over time.",
  },
  {
    icon: Calendar,
    title: "Flexible Frequencies",
    description:
      "Choose from weekly, bi-weekly, monthly, quarterly, or yearly investment schedules.",
  },
  {
    icon: BarChart3,
    title: "Return Scenarios",
    description:
      "Compare best case, average case, and worst case scenarios to understand potential outcomes.",
  },
  {
    icon: PiggyBank,
    title: "Inflation Adjustment",
    description:
      "See the real purchasing power of your portfolio after accounting for inflation.",
  },
  {
    icon: ShieldCheck,
    title: "Year-wise Breakdown",
    description:
      "Detailed annual summary showing invested amount, portfolio value, and profit progression.",
  },
  {
    icon: Wallet,
    title: "Multi-Currency Support",
    description:
      "Calculate in INR, USD, EUR, or GBP with proper currency formatting throughout.",
  },
];

export default function Description() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-12">
      <div className="mb-8 text-center">
        <h2 className="subheading">Why Use This DCA Calculator?</h2>
        <p className="description mt-3">
          Plan your systematic investment strategy and see how consistent investing builds long-term wealth.
        </p>
      </div>

      <div className="tool-feature-grid">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-lg border border-(--border) bg-(--card) p-5"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-(--foreground)">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
