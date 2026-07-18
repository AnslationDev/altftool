import { Landmark, TrendingDown, Calendar, PiggyBank, BarChart3, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: TrendingDown,
    title: "Interest Savings",
    description:
      "See exactly how much interest you save by making extra payments toward your loan principal.",
  },
  {
    icon: Calendar,
    title: "Time Reduction",
    description:
      "Understand how prepayment reduces your loan tenure and when you can become debt-free.",
  },
  {
    icon: BarChart3,
    title: "Multiple Frequencies",
    description:
      "Compare one-time, monthly, quarterly, half-yearly, and yearly prepayment strategies.",
  },
  {
    icon: PiggyBank,
    title: "Side-by-Side Comparison",
    description:
      "View amortization schedules with and without prepayment to see the real difference.",
  },
  {
    icon: ShieldCheck,
    title: "Amortization Schedule",
    description:
      "Detailed month-by-month breakdown of principal, interest, balance, and prepayment impact.",
  },
  {
    icon: Landmark,
    title: "Multi-Currency Support",
    description:
      "Calculate in INR, USD, EUR, or GBP with proper currency formatting throughout.",
  },
];

export default function Description() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-12">
      <div className="mb-8 text-center">
        <h2 className="subheading">Why Use This Loan Prepayment Calculator?</h2>
        <p className="description mt-3">
          Plan your prepayment strategy to save thousands in interest and shorten your loan tenure.
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
