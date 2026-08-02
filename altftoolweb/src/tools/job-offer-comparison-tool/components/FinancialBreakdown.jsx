import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { DollarSign } from "lucide-react";

const FinancialBreakdown = ({ offers }) => {
  if (offers.length === 0) return null;

  const calculateFinancials = (offer) => {
    const inHandMonthly =
      (offer.baseSalary + offer.baseSalary * (offer.bonus / 100)) / 12;
    // The ESOP grant vests over 4 years, so dividing by 4 alone yields an
    // ANNUAL vested amount. It must also be divided by 12 to line up with
    // the other two figures here, which are true monthly amounts —
    // otherwise it overstates "Total Monthly Value" by 12x and can flip
    // which offer looks financially best.
    const esopValue = (offer.baseSalary * (offer.esop / 100)) / 4 / 12;
    const joiningMonthly = offer.joiningBonus / 12;
    const totalMonthly = inHandMonthly + esopValue + joiningMonthly;
    const annualSavings = totalMonthly * 12 * 0.15;
    const estimatedTax = totalMonthly * 12 * 0.2;

    return {
      inHandMonthly: Math.round(inHandMonthly),
      esopValue: Math.round(esopValue),
      joiningMonthly: Math.round(joiningMonthly),
      totalMonthly: Math.round(totalMonthly),
      annualSavings: Math.round(annualSavings),
      estimatedTax: Math.round(estimatedTax),
    };
  };

  const best = offers.reduce((a, b) => {
    const aFinancials = calculateFinancials(a);
    const bFinancials = calculateFinancials(b);
    return aFinancials.totalMonthly > bFinancials.totalMonthly ? a : b;
  });

  const financials = calculateFinancials(best);
  const chartData = [
    { name: "In-hand Salary", value: financials.inHandMonthly },
    { name: "ESOP Value", value: financials.esopValue },
    { name: "Joining Bonus", value: financials.joiningMonthly },
  ];

  const colors = ["#2563EB", "#7C3AED", "#10B981"];

  return (
    <div className="job-comparison-section">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <DollarSign size={24} style={{ color: "var(--job-primary)" }} />
        <h2 className="job-section-title" style={{ margin: 0 }}>
          Financial Analysis
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "var(--job-surface-hover)",
            padding: "16px",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--job-text-sub)",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Monthly In-hand
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--job-primary)",
            }}
          >
            ₹{(financials.inHandMonthly / 100000).toFixed(1)}L
          </div>
        </div>

        <div
          style={{
            background: "var(--job-surface-hover)",
            padding: "16px",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--job-text-sub)",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Monthly Total
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--job-success)",
            }}
          >
            ₹{(financials.totalMonthly / 100000).toFixed(1)}L
          </div>
        </div>

        <div
          style={{
            background: "var(--job-surface-hover)",
            padding: "16px",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--job-text-sub)",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Annual Savings
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--job-warning)",
            }}
          >
            ₹{(financials.annualSavings / 100000).toFixed(1)}L
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
        }}
      >
        <div>
          <div style={{ marginBottom: "16px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Salary Composition
            </h3>
          </div>
          <div
            style={{
              width: "100%",
              height: "250px",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--job-surface)",
                    border: `1px solid var(--job-border)`,
                    borderRadius: "8px",
                  }}
                  formatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div style={{ marginBottom: "16px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Financial Summary
            </h3>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div className="job-financial-item">
              <span className="job-financial-label">Monthly In-hand</span>
              <span className="job-financial-value">
                ₹{(financials.inHandMonthly / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="job-financial-item">
              <span className="job-financial-label">Monthly ESOP Value</span>
              <span className="job-financial-value">
                ₹{(financials.esopValue / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="job-financial-item">
              <span className="job-financial-label">
                Joining Bonus (Monthly Avg)
              </span>
              <span className="job-financial-value">
                ₹{(financials.joiningMonthly / 100000).toFixed(1)}L
              </span>
            </div>
            <div
              className="job-financial-item"
              style={{
                paddingTop: "12px",
                borderTop: "1px solid var(--job-border)",
              }}
            >
              <span className="job-financial-label" style={{ fontWeight: 700 }}>
                Total Monthly Value
              </span>
              <span className="job-financial-value job-financial-highlight">
                ₹{(financials.totalMonthly / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="job-financial-item">
              <span className="job-financial-label">Estimated Annual Tax</span>
              <span className="job-financial-value">
                ₹{(financials.estimatedTax / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="job-financial-item">
              <span className="job-financial-label">
                Estimated Annual Savings
              </span>
              <span className="job-financial-value job-financial-highlight">
                ₹{(financials.annualSavings / 100000).toFixed(1)}L
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialBreakdown;
