import { useCountUp } from "../hooks/useCountUp.jsx";

function StatItem({ value, label, prefix = "", suffix = "" }) {
  const { count, ref } = useCountUp(value, 2000);
  return (
    <div ref={ref} className="stat-item">
      <div className="stat-value">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="stat-label">
        {label}
      </div>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section id="stats" className="stats-section">
      <div className="container">
        <div className="stats-grid">
          <StatItem value={5200} suffix="+" label="Homes Powered" />
          <StatItem value={98} suffix="%" label="Customer Satisfaction" />
          <StatItem value={25} suffix=" yr" label="Warranty Coverage" />
          <StatItem value={2400} prefix="$" label="Avg. Annual Savings" />
        </div>
      </div>
    </section>
  );
}
