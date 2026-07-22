import { useState } from "react";

/* ─── utils ─── */
const n = (v) => Number(v) || 0;
const fmt = (v, d = 2) => (v === null || isNaN(v)) ? "—" : Number(v).toFixed(d);
const fmtINR = (v) => (v === null || isNaN(v) || v === 0) ? "—" : `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const roasInfo = (r) => {
  if (!r || isNaN(r)) return null;
  if (r < 1)  return { label: "Losing Money",    emoji: "🔴", color: "#ef4444", light: "#fef2f2", border: "#fecaca", bar: 8  };
  if (r < 2)  return { label: "Break-Even Zone", emoji: "🟡", color: "#f59e0b", light: "#fffbeb", border: "#fde68a", bar: 25 };
  if (r < 4)  return { label: "Profitable",      emoji: "🟢", color: "#10b981", light: "#ecfdf5", border: "#a7f3d0", bar: 55 };
  if (r < 8)  return { label: "Strong ROAS",     emoji: "💎", color: "#3b82f6", light: "#eff6ff", border: "#bfdbfe", bar: 80 };
  return           { label: "Excellent ROAS",    emoji: "🚀", color: "#8b5cf6", light: "#f5f3ff", border: "#ddd6fe", bar: 100 };
};

/* ─── shared components ─── */
const InputField = ({ label, prefix, suffix, value, onChange, placeholder, tip }) => (
  <div style={{ marginBottom: "1rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
      <label style={{ fontSize: "0.72rem", fontWeight: "600", color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{label}</label>
      {tip && <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{tip}</span>}
    </div>
    <div style={{ display: "flex", alignItems: "center", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", transition: "border-color 0.2s, box-shadow 0.2s" }}
      onFocusCapture={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
      onBlurCapture={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
      {prefix && <span style={{ padding: "0 0.75rem", color: "#94a3b8", fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", borderRight: "1.5px solid #e2e8f0", lineHeight: "44px", background: "#f1f5f9" }}>{prefix}</span>}
      <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || "0"}
        style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "0 0.875rem", height: "44px", fontSize: "0.95rem", color: "#1e293b", fontFamily: "'DM Mono', monospace" }} />
      {suffix && <span style={{ padding: "0 0.75rem", color: "#94a3b8", fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", borderLeft: "1.5px solid #e2e8f0", lineHeight: "44px", background: "#f1f5f9" }}>{suffix}</span>}
    </div>
  </div>
);

const MetricCard = ({ label, value, sub, color = "#6366f1", icon }) => (
  <div style={{ background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: "12px", padding: "1rem 1.125rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.375rem" }}>
      {icon && <span style={{ fontSize: "0.9rem" }}>{icon}</span>}
      <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
    </div>
    <div style={{ fontSize: "1.5rem", fontWeight: "800", color, fontFamily: "'DM Mono', monospace", lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: "0.67rem", color: "#94a3b8", marginTop: "0.2rem", fontFamily: "'DM Sans', sans-serif" }}>{sub}</div>}
  </div>
);

const SectionCard = ({ title, icon, children, accent = "#6366f1" }) => (
  <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)", border: "1.5px solid #f1f5f9", overflow: "hidden" }}>
    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1.5px solid #f8fafc", display: "flex", alignItems: "center", gap: "0.6rem", background: "linear-gradient(135deg, #fafbff 0%, #f8fafc 100%)" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>{icon}</div>
      <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif" }}>{title}</span>
    </div>
    <div style={{ padding: "1.5rem" }}>{children}</div>
  </div>
);

const ResetBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ width: "100%", marginTop: "0.75rem", padding: "0.65rem", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "10px", color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", letterSpacing: "0.04em", transition: "all .15s" }}
    onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#94a3b8"; }}>
    ↺ Reset
  </button>
);

const RoasBadge = ({ roas }) => {
  const st = roasInfo(roas);
  if (!st) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.75rem", background: st.light, border: `1.5px solid ${st.border}`, borderRadius: "999px" }}>
      <span style={{ fontSize: "0.75rem" }}>{st.emoji}</span>
      <span style={{ fontSize: "0.7rem", fontWeight: "700", color: st.color, fontFamily: "'DM Sans', sans-serif" }}>{st.label}</span>
    </div>
  );
};

const RoasGauge = ({ roas }) => {
  const st = roasInfo(roas);
  if (!roas) return null;
  return (
    <div style={{ marginTop: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
        <span style={{ fontSize: "0.62rem", color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>Performance</span>
        <span style={{ fontSize: "0.62rem", color: st?.color, fontWeight: "700", fontFamily: "'DM Sans', sans-serif" }}>{st?.bar}%</span>
      </div>
      <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${st?.bar || 0}%`, background: `linear-gradient(90deg, ${st?.color}88, ${st?.color})`, borderRadius: "999px", transition: "width .7s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
};

/* ══════ MODES ══════ */

function BasicMode() {
  const [spend, setSpend] = useState("");
  const [rev, setRev] = useState("");
  const [log, setLog] = useState([]);
  const roas = n(spend) && n(rev) ? n(rev) / n(spend) : null;
  const st = roasInfo(roas);
  const mer = roas ? (n(spend) / n(rev)) * 100 : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <SectionCard title="Campaign Inputs" icon="📥" accent="#6366f1">
        <InputField label="Ad Spend" prefix="₹" value={spend} onChange={setSpend} placeholder="50,000" tip="Total money spent on ads" />
        <InputField label="Revenue / Conversion Value" prefix="₹" value={rev} onChange={setRev} placeholder="2,00,000" tip="Total revenue attributed" />
      </SectionCard>

      {/* Big ROAS result */}
      <div style={{ background: roas ? `linear-gradient(135deg, ${st.light}, #fff)` : "#fafbff", border: `2px solid ${roas ? st.border : "#f1f5f9"}`, borderRadius: "20px", padding: "2rem 1.5rem", textAlign: "center", boxShadow: roas ? `0 8px 32px ${st.color}18` : "0 2px 8px rgba(0,0,0,0.04)", transition: "all 0.4s" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", marginBottom: "0.5rem" }}>ROAS</div>
        <div style={{ fontSize: "5rem", fontWeight: "900", color: roas ? st.color : "#e2e8f0", fontFamily: "'DM Mono', monospace", lineHeight: 1, letterSpacing: "-0.03em" }}>
          {roas ? `${fmt(roas)}x` : "—"}
        </div>
        {roas && <div style={{ marginTop: "0.75rem" }}><RoasBadge roas={roas} /></div>}
        <RoasGauge roas={roas} />
      </div>

      {roas && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <MetricCard label="Ad Cost Ratio" value={`${fmt(mer, 1)}%`} sub="of total revenue (MER)" color="#f59e0b" icon="📊" />
          <MetricCard label="Return Per ₹1" value={`₹${fmt(roas, 2)}`} sub="earned per rupee spent" color="#10b981" icon="💰" />
        </div>
      )}

      <div style={{ display: "flex", gap: "0.6rem" }}>
        <button onClick={() => { if (roas) setLog(l => [{ spend, rev, roas: fmt(roas), color: st.color, emoji: st.emoji, time: new Date().toLocaleTimeString() }, ...l.slice(0, 4)]); }}
          disabled={!roas}
          style={{ flex: 1, padding: "0.75rem", background: roas ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#f1f5f9", border: "none", borderRadius: "10px", color: roas ? "#fff" : "#cbd5e1", fontFamily: "'DM Sans', sans-serif", fontWeight: "700", fontSize: "0.8rem", cursor: roas ? "pointer" : "not-allowed", boxShadow: roas ? "0 4px 12px rgba(99,102,241,0.3)" : "none", transition: "all .2s" }}>
          Save to Log
        </button>
        <button onClick={() => { setSpend(""); setRev(""); }} style={{ padding: "0.75rem 1.25rem", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "10px", color: "#64748b", fontFamily: "'DM Sans', sans-serif", fontWeight: "600", fontSize: "0.8rem", cursor: "pointer" }}>Reset</button>
      </div>

      {log.length > 0 && (
        <SectionCard title="Calculation Log" icon="📋" accent="#64748b">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {log.map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.875rem", background: "#f8fafc", border: "1.5px solid #f1f5f9", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.65rem", color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{e.time}</span>
                <span style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{fmtINR(e.spend)} → {fmtINR(e.rev)}</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: e.color, fontFamily: "'DM Mono', monospace" }}>{e.emoji} {e.roas}x</span>
              </div>
            ))}
          </div>
          <button onClick={() => setLog([])} style={{ marginTop: "0.6rem", background: "none", border: "none", color: "#94a3b8", fontSize: "0.65rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Clear log</button>
        </SectionCard>
      )}
    </div>
  );
}

function PLMode() {
  const [spend, setSpend] = useState("");
  const [rev, setRev] = useState("");
  const [cogs, setCogs] = useState("");
  const [over, setOver] = useState("");
  const roas = n(spend) && n(rev) ? n(rev) / n(spend) : null;
  const st = roasInfo(roas);
  const gross = n(rev) - n(cogs);
  const net = n(rev) - n(cogs) - n(spend) - n(over);
  const mer = roas ? (n(spend) / n(rev)) * 100 : null;
  const gm = n(rev) ? (gross / n(rev)) * 100 : null;
  const nm = n(rev) ? (net / n(rev)) * 100 : null;
  const beRoas = n(spend) && n(rev) && n(cogs) ? n(spend) / (n(rev) - n(cogs) - n(over)) : null;

  const bars = n(rev) > 0 ? [
    { label: "COGS",      pct: Math.min(100, (n(cogs) / n(rev)) * 100),  color: "#ef4444" },
    { label: "Ad Spend",  pct: Math.min(100, (n(spend) / n(rev)) * 100), color: "#f59e0b" },
    { label: "Overhead",  pct: Math.min(100, (n(over) / n(rev)) * 100),  color: "#fb923c" },
    { label: "Net Profit",pct: Math.max(0,   (net / n(rev)) * 100),       color: "#10b981" },
  ] : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <SectionCard title="Revenue & Cost Inputs" icon="🧾" accent="#10b981">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 0.75rem" }}>
          <InputField label="Ad Spend" prefix="₹" value={spend} onChange={setSpend} placeholder="50,000" />
          <InputField label="Revenue" prefix="₹" value={rev} onChange={setRev} placeholder="2,00,000" />
          <InputField label="COGS" prefix="₹" value={cogs} onChange={setCogs} placeholder="80,000" />
          <InputField label="Overhead" prefix="₹" value={over} onChange={setOver} placeholder="10,000" />
        </div>
      </SectionCard>

      {roas ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
            <div style={{ gridColumn: "1/-1", background: `linear-gradient(135deg, ${st.light}, #fff)`, border: `2px solid ${st.border}`, borderRadius: "16px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: `0 4px 20px ${st.color}15` }}>
              <div>
                <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>ROAS</div>
                <div style={{ fontSize: "3.5rem", fontWeight: "900", color: st.color, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{fmt(roas)}x</div>
                {beRoas !== null && <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", marginTop: "0.25rem" }}>Break-even: {fmt(beRoas)}x</div>}
              </div>
              <RoasBadge roas={roas} />
            </div>
            <MetricCard label="Gross Profit" value={fmtINR(gross)} sub={`${fmt(gm, 1)}% margin`} color={gross >= 0 ? "#10b981" : "#ef4444"} icon="📈" />
            <MetricCard label="Net Profit"   value={fmtINR(net)}   sub={`${fmt(nm, 1)}% margin`} color={net >= 0 ? "#6366f1" : "#ef4444"} icon="💼" />
            <MetricCard label="MER"           value={`${fmt(mer, 1)}%`} sub="marketing efficiency" color="#f59e0b" icon="📉" />
          </div>

          {n(rev) > 0 && (
            <SectionCard title="Revenue Allocation" icon="🥧" accent="#6366f1">
              <div style={{ display: "flex", height: "12px", borderRadius: "8px", overflow: "hidden", gap: "2px" }}>
                {bars.filter(b => b.pct > 0).map((b, i) => (
                  <div key={i} style={{ width: `${b.pct}%`, background: b.color, transition: "width .6s ease" }} title={`${b.label}: ${b.pct.toFixed(1)}%`} />
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "0.875rem" }}>
                {bars.filter(b => b.pct > 0).map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <div style={{ width: "9px", height: "9px", borderRadius: "3px", background: b.color }} />
                    <span style={{ fontSize: "0.68rem", color: "#64748b", fontFamily: "'DM Sans', sans-serif", fontWeight: "500" }}>{b.label}: <strong style={{ color: "#1e293b" }}>{b.pct.toFixed(1)}%</strong></span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "2.5rem", background: "#fafbff", border: "2px dashed #e2e8f0", borderRadius: "16px", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem" }}>
          Fill in spend + revenue to see P&L breakdown
        </div>
      )}
      <ResetBtn onClick={() => { setSpend(""); setRev(""); setCogs(""); setOver(""); }} />
    </div>
  );
}

function FunnelMode() {
  const [spend, setSpend] = useState("");
  const [clicks, setClicks] = useState("");
  const [convs, setConvs] = useState("");
  const [aov, setAov] = useState("");
  const rev = n(convs) * n(aov);
  const roas = n(spend) && rev ? rev / n(spend) : null;
  const st = roasInfo(roas);
  const cpc = n(spend) && n(clicks) ? n(spend) / n(clicks) : null;
  const cvr = n(clicks) && n(convs) ? (n(convs) / n(clicks)) * 100 : null;
  const cpa = n(spend) && n(convs) ? n(spend) / n(convs) : null;

  const steps = [
    { label: "Clicks", val: n(clicks), color: "#6366f1", icon: "👆" },
    { label: "Conversions", val: n(convs), color: "#10b981", icon: "✅" },
  ].filter(s => s.val > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <SectionCard title="Funnel Inputs" icon="🔽" accent="#6366f1">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 0.75rem" }}>
          <InputField label="Ad Spend" prefix="₹" value={spend} onChange={setSpend} placeholder="50,000" />
          <InputField label="Clicks / Sessions" value={clicks} onChange={setClicks} placeholder="10,000" />
          <InputField label="Conversions" value={convs} onChange={setConvs} placeholder="500" />
          <InputField label="Avg Order Value" prefix="₹" value={aov} onChange={setAov} placeholder="400" />
        </div>
        {n(convs) > 0 && n(aov) > 0 && (
          <div style={{ padding: "0.75rem 1rem", background: "linear-gradient(135deg, #eff6ff, #f5f3ff)", border: "1.5px solid #bfdbfe", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "#6366f1", fontFamily: "'DM Sans', sans-serif" }}>Auto Revenue ({n(convs)} × {fmtINR(n(aov))})</span>
            <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#6366f1", fontFamily: "'DM Mono', monospace" }}>{fmtINR(rev)}</span>
          </div>
        )}
      </SectionCard>

      {roas && (
        <>
          <div style={{ background: `linear-gradient(135deg, ${st.light}, #fff)`, border: `2px solid ${st.border}`, borderRadius: "16px", padding: "1.5rem", textAlign: "center", boxShadow: `0 6px 24px ${st.color}18` }}>
            <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>ROAS</div>
            <div style={{ fontSize: "4rem", fontWeight: "900", color: st.color, fontFamily: "'DM Mono', monospace", lineHeight: 1.1 }}>{fmt(roas)}x</div>
            <div style={{ marginTop: "0.5rem" }}><RoasBadge roas={roas} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <MetricCard label="Cost Per Click" value={fmtINR(cpc)} sub="CPC" color="#6366f1" icon="🖱️" />
            <MetricCard label="Conv. Rate" value={`${fmt(cvr, 2)}%`} sub="clicks → conversions" color="#10b981" icon="🎯" />
            <MetricCard label="Cost Per Acq." value={fmtINR(cpa)} sub="CPA" color="#f59e0b" icon="🛒" />
            <MetricCard label="Avg Order Value" value={fmtINR(n(aov))} sub="AOV" color="#8b5cf6" icon="🎁" />
          </div>
        </>
      )}

      {steps.length > 1 && (
        <SectionCard title="Funnel Drop-off" icon="📉" accent="#6366f1">
          {steps.map((s, i) => {
            const pct = i === 0 ? 100 : (s.val / steps[0].val) * 100;
            return (
              <div key={i} style={{ marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "#475569", fontFamily: "'DM Sans', sans-serif" }}>{s.icon} {s.label}</span>
                  <span style={{ fontSize: "0.7rem", fontWeight: "700", color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.val.toLocaleString("en-IN")} ({pct.toFixed(1)}%)</span>
                </div>
                <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "6px" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${s.color}88, ${s.color})`, borderRadius: "6px", transition: "width .6s ease" }} />
                </div>
              </div>
            );
          })}
        </SectionCard>
      )}

      {!roas && (
        <div style={{ textAlign: "center", padding: "2rem", background: "#fafbff", border: "2px dashed #e2e8f0", borderRadius: "14px", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem" }}>
          Fill all fields to see funnel metrics
        </div>
      )}
      <ResetBtn onClick={() => { setSpend(""); setClicks(""); setConvs(""); setAov(""); }} />
    </div>
  );
}

function CompareMode() {
  const COLORS = ["#6366f1", "#10b981", "#f59e0b"];
  const [camps, setCamps] = useState([
    { name: "Campaign A", spend: "", rev: "" },
    { name: "Campaign B", spend: "", rev: "" },
  ]);
  const upd = (i, f, v) => setCamps(c => c.map((x, idx) => idx === i ? { ...x, [f]: v } : x));
  const computed = camps.map((c, i) => ({ ...c, color: COLORS[i], roas: n(c.spend) && n(c.rev) ? n(c.rev) / n(c.spend) : null }));
  const winner = computed.reduce((b, c) => (c.roas && (!b || c.roas > b.roas)) ? c : b, null);
  const maxRoas = Math.max(...computed.map(c => c.roas || 0));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <SectionCard title="Campaign Inputs" icon="⚔️" accent="#6366f1">
        {computed.map((c, i) => (
          <div key={i} style={{ marginBottom: i < computed.length - 1 ? "1.25rem" : "0", paddingBottom: i < computed.length - 1 ? "1.25rem" : "0", borderBottom: i < computed.length - 1 ? "1.5px solid #f1f5f9" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: c.color, flexShrink: 0 }} />
              <input value={c.name} onChange={e => upd(i, "name", e.target.value)} style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "0.85rem", fontWeight: "700", color: "#1e293b", fontFamily: "'DM Sans', sans-serif" }} />
              {camps.length > 2 && <button onClick={() => setCamps(c => c.filter((_, idx) => idx !== i))} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "5px", color: "#ef4444", cursor: "pointer", fontSize: "0.65rem", padding: "0.2rem 0.4rem", fontFamily: "'DM Sans', sans-serif" }}>Remove</button>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 0.75rem" }}>
              <InputField label="Ad Spend" prefix="₹" value={c.spend} onChange={v => upd(i, "spend", v)} placeholder="50,000" />
              <InputField label="Revenue" prefix="₹" value={c.rev} onChange={v => upd(i, "rev", v)} placeholder="2,00,000" />
            </div>
          </div>
        ))}
        {camps.length < 3 && (
          <button onClick={() => setCamps(c => [...c, { name: `Campaign ${["A","B","C"][c.length]}`, spend: "", rev: "" }])}
            style={{ width: "100%", padding: "0.65rem", background: "#f8fafc", border: "2px dashed #e2e8f0", borderRadius: "10px", color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", fontWeight: "600", fontSize: "0.78rem", cursor: "pointer" }}>
            + Add Campaign
          </button>
        )}
      </SectionCard>

      {computed.some(c => c.roas) && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {computed.map((c, i) => {
              const st = roasInfo(c.roas);
              const isWinner = winner && c.name === winner.name && c.roas;
              return (
                <div key={i} style={{ background: isWinner ? `linear-gradient(135deg, ${st?.light || "#fafbff"}, #fff)` : "#fff", border: `2px solid ${isWinner ? (st?.border || "#f1f5f9") : "#f1f5f9"}`, borderRadius: "14px", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: isWinner ? `0 4px 20px ${c.color}20` : "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: c.color }} />
                    <div>
                      <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.85rem", fontFamily: "'DM Sans', sans-serif" }}>{c.name} {isWinner ? "🏆" : ""}</div>
                      <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{fmtINR(c.spend)} spent</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "2rem", fontWeight: "900", color: c.roas ? c.color : "#e2e8f0", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{c.roas ? `${fmt(c.roas)}x` : "—"}</div>
                    {st && <div style={{ fontSize: "0.6rem", color: st.color, fontFamily: "'DM Sans', sans-serif", fontWeight: "600" }}>{st.label}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          <SectionCard title="ROAS Comparison" icon="📊" accent="#6366f1">
            {computed.filter(c => c.roas).map((c, i) => (
              <div key={i} style={{ marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "#475569", fontFamily: "'DM Sans', sans-serif" }}>{c.name}</span>
                  <span style={{ fontWeight: "800", fontSize: "0.85rem", color: c.color, fontFamily: "'DM Mono', monospace" }}>{fmt(c.roas)}x</span>
                </div>
                <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "6px" }}>
                  <div style={{ height: "100%", width: `${maxRoas ? (c.roas / maxRoas) * 100 : 0}%`, background: `linear-gradient(90deg, ${c.color}77, ${c.color})`, borderRadius: "6px", transition: "width .6s ease" }} />
                </div>
              </div>
            ))}
          </SectionCard>
        </>
      )}
      <ResetBtn onClick={() => setCamps([{ name: "Campaign A", spend: "", rev: "" }, { name: "Campaign B", spend: "", rev: "" }])} />
    </div>
  );
}

function SimulatorMode() {
  const [spend, setSpend] = useState("50000");
  const [rev, setRev] = useState("200000");
  const [sd, setSd] = useState(0);
  const [rd, setRd] = useState(0);
  const base = n(spend) && n(rev) ? n(rev) / n(spend) : null;
  const sS = n(spend) * (1 + sd / 100);
  const sR = n(rev) * (1 + rd / 100);
  const sim = sS && sR ? sR / sS : null;
  const diff = base && sim ? sim - base : null;
  const bSt = roasInfo(base);
  const sSt = roasInfo(sim);

  const Slider = ({ label, value, onChange, color }) => (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
        <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
        <span style={{ fontSize: "0.78rem", fontWeight: "800", color: value >= 0 ? "#10b981" : "#ef4444", fontFamily: "'DM Mono', monospace" }}>{value >= 0 ? "+" : ""}{value}%</span>
      </div>
      <input type="range" min="-80" max="200" step="5" value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer", height: "4px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.2rem" }}>
        <span style={{ fontSize: "0.6rem", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>-80%</span>
        <span style={{ fontSize: "0.6rem", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>+200%</span>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <SectionCard title="Base Values" icon="📌" accent="#6366f1">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 0.75rem" }}>
          <InputField label="Base Spend" prefix="₹" value={spend} onChange={setSpend} placeholder="50,000" />
          <InputField label="Base Revenue" prefix="₹" value={rev} onChange={setRev} placeholder="2,00,000" />
        </div>
      </SectionCard>

      <SectionCard title="Adjust Scenario" icon="🎛️" accent="#8b5cf6">
        <Slider label="Change in Ad Spend" value={sd} onChange={setSd} color="#f59e0b" />
        <Slider label="Change in Revenue" value={rd} onChange={setRd} color="#10b981" />
      </SectionCard>

      {base && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ background: "#fafbff", border: "1.5px solid #f1f5f9", borderRadius: "14px", padding: "1.25rem", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "0.62rem", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", marginBottom: "0.25rem" }}>BASE ROAS</div>
              <div style={{ fontSize: "2.8rem", fontWeight: "900", color: bSt?.color || "#e2e8f0", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{fmt(base)}x</div>
              <div style={{ fontSize: "0.65rem", color: bSt?.color, fontFamily: "'DM Sans', sans-serif", fontWeight: "600", marginTop: "0.25rem" }}>{bSt?.label}</div>
            </div>
            <div style={{ background: sSt ? `linear-gradient(135deg, ${sSt.light}, #fff)` : "#fafbff", border: `2px solid ${sSt?.border || "#f1f5f9"}`, borderRadius: "14px", padding: "1.25rem", textAlign: "center", boxShadow: `0 4px 16px ${sSt?.color || "transparent"}18` }}>
              <div style={{ fontSize: "0.62rem", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", marginBottom: "0.25rem" }}>SIMULATED</div>
              <div style={{ fontSize: "2.8rem", fontWeight: "900", color: sSt?.color || "#e2e8f0", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{sim ? `${fmt(sim)}x` : "—"}</div>
              <div style={{ fontSize: "0.65rem", color: sSt?.color, fontFamily: "'DM Sans', sans-serif", fontWeight: "600", marginTop: "0.25rem" }}>{sSt?.label}</div>
            </div>
          </div>

          {diff !== null && (
            <div style={{ padding: "0.875rem 1.25rem", background: diff >= 0 ? "#ecfdf5" : "#fef2f2", border: `2px solid ${diff >= 0 ? "#a7f3d0" : "#fecaca"}`, borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "600", color: "#64748b", fontSize: "0.8rem", fontFamily: "'DM Sans', sans-serif" }}>ROAS Change</span>
              <span style={{ fontWeight: "900", fontSize: "1.3rem", color: diff >= 0 ? "#10b981" : "#ef4444", fontFamily: "'DM Mono', monospace" }}>{diff >= 0 ? "+" : ""}{fmt(diff)}x</span>
            </div>
          )}

          <SectionCard title="Scenario Breakdown" icon="🔍" accent="#6366f1">
            {[{ label: "Ad Spend", base: n(spend), sim: sS, color: "#f59e0b" }, { label: "Revenue", base: n(rev), sim: sR, color: "#10b981" }].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: i < 1 ? "1.5px solid #f8fafc" : "none" }}>
                <span style={{ fontWeight: "600", color: "#64748b", fontSize: "0.8rem", fontFamily: "'DM Sans', sans-serif" }}>{r.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#94a3b8" }}>{fmtINR(r.base)}</span>
                  <span style={{ color: "#cbd5e1" }}>→</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", fontWeight: "700", color: r.color }}>{fmtINR(r.sim)}</span>
                </div>
              </div>
            ))}
          </SectionCard>
        </>
      )}
      <ResetBtn onClick={() => { setSpend("50000"); setRev("200000"); setSd(0); setRd(0); }} />
    </div>
  );
}

function TargetMode() {
  const [tRoas, setTRoas] = useState("");
  const [spend, setSpend] = useState("");
  const [tRev, setTRev] = useState("");
  const neededRev = n(tRoas) && n(spend) ? n(spend) * n(tRoas) : null;
  const maxSpend  = n(tRoas) && n(tRev) ? n(tRev) / n(tRoas) : null;
  const impRoas   = n(spend) && n(tRev) ? n(tRev) / n(spend) : null;
  const impSt     = roasInfo(impRoas);

  const PLATFORMS = [
    { name: "Google Search",  min: 3, max: 8,  color: "#4285f4", icon: "🔍" },
    { name: "Meta / Facebook",min: 2, max: 5,  color: "#1877f2", icon: "📘" },
    { name: "Instagram Ads",  min: 2, max: 6,  color: "#e1306c", icon: "📸" },
    { name: "YouTube Ads",    min: 2, max: 4,  color: "#ef4444", icon: "▶️" },
    { name: "Amazon Ads",     min: 3, max: 10, color: "#f59e0b", icon: "📦" },
    { name: "Snapchat Ads",   min: 1, max: 3,  color: "#eab308", icon: "👻" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <SectionCard title="Target Settings" icon="🎯" accent="#8b5cf6">
        <InputField label="Target ROAS" suffix="x" value={tRoas} onChange={setTRoas} placeholder="4" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 0.75rem" }}>
          <InputField label="Ad Spend Budget" prefix="₹" value={spend} onChange={setSpend} placeholder="50,000" />
          <InputField label="Revenue Goal" prefix="₹" value={tRev} onChange={setTRev} placeholder="2,00,000" />
        </div>
      </SectionCard>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {neededRev !== null && (
          <div style={{ background: "linear-gradient(135deg, #ecfdf5, #fff)", border: "2px solid #a7f3d0", borderRadius: "14px", padding: "1.25rem", boxShadow: "0 4px 16px rgba(16,185,129,0.12)" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "#10b981", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>Revenue needed for {tRoas}x ROAS</div>
            <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "#10b981", fontFamily: "'DM Mono', monospace", lineHeight: 1.1 }}>{fmtINR(neededRev)}</div>
            <div style={{ fontSize: "0.68rem", color: "#6ee7b7", fontFamily: "'DM Sans', sans-serif", marginTop: "0.2rem" }}>from {fmtINR(n(spend))} spend</div>
          </div>
        )}
        {maxSpend !== null && (
          <div style={{ background: "linear-gradient(135deg, #f5f3ff, #fff)", border: "2px solid #ddd6fe", borderRadius: "14px", padding: "1.25rem", boxShadow: "0 4px 16px rgba(139,92,246,0.12)" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "#8b5cf6", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>Max spend for {fmtINR(n(tRev))} at {tRoas}x</div>
            <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "#8b5cf6", fontFamily: "'DM Mono', monospace", lineHeight: 1.1 }}>{fmtINR(maxSpend)}</div>
            <div style={{ fontSize: "0.68rem", color: "#c4b5fd", fontFamily: "'DM Sans', sans-serif", marginTop: "0.2rem" }}>maximum allowable budget</div>
          </div>
        )}
        {impRoas !== null && (
          <div style={{ background: `linear-gradient(135deg, ${impSt?.light || "#fafbff"}, #fff)`, border: `2px solid ${impSt?.border || "#f1f5f9"}`, borderRadius: "14px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>Implied ROAS</div>
              <div style={{ fontSize: "2.2rem", fontWeight: "900", color: impSt?.color, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{fmt(impRoas)}x</div>
            </div>
            <RoasBadge roas={impRoas} />
          </div>
        )}
        {!tRoas && (
          <div style={{ textAlign: "center", padding: "2rem", background: "#fafbff", border: "2px dashed #e2e8f0", borderRadius: "14px", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem" }}>
            Set a target ROAS to begin
          </div>
        )}
      </div>

      <SectionCard title="Platform Benchmarks" icon="📡" accent="#3b82f6">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {PLATFORMS.map((p, i) => {
            const t = n(tRoas);
            const inRange = t && t >= p.min && t <= p.max;
            const above = t && t > p.max;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.875rem", background: inRange ? p.color + "0c" : "#f8fafc", border: `1.5px solid ${inRange ? p.color + "35" : "#f1f5f9"}`, borderRadius: "10px", transition: "all .2s" }}>
                <span style={{ fontSize: "0.9rem" }}>{p.icon}</span>
                <span style={{ flex: 1, fontWeight: "600", color: inRange ? "#1e293b" : "#64748b", fontSize: "0.78rem", fontFamily: "'DM Sans', sans-serif" }}>{p.name}</span>
                <span style={{ fontWeight: "800", color: p.color, fontSize: "0.78rem", fontFamily: "'DM Mono', monospace" }}>{p.min}x–{p.max}x</span>
                {t > 0 && (
                  <span style={{ fontSize: "0.62rem", fontWeight: "700", color: inRange ? "#10b981" : above ? "#8b5cf6" : "#ef4444", background: inRange ? "#ecfdf5" : above ? "#f5f3ff" : "#fef2f2", padding: "0.15rem 0.4rem", borderRadius: "5px", fontFamily: "'DM Sans', sans-serif" }}>
                    {inRange ? "✓" : above ? "↑" : "↓"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
      <ResetBtn onClick={() => { setTRoas(""); setSpend(""); setTRev(""); }} />
    </div>
  );
}

function ExportMode() {
  const [spend, setSpend] = useState("");
  const [rev, setRev] = useState("");
  const [cogs, setCogs] = useState("");
  const [label, setLabel] = useState("Q2 Meta Campaign");
  const [copied, setCopied] = useState(false);
  const roas = n(spend) && n(rev) ? n(rev) / n(spend) : null;
  const st = roasInfo(roas);
  const mer = roas ? (n(spend) / n(rev)) * 100 : null;
  const profit = n(rev) - n(cogs) - n(spend);
  const now = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const report = roas ? `━━━━━━━━━━━━━━━━━━━━━━━━
📊 ROAS REPORT — ${now}
${label}
━━━━━━━━━━━━━━━━━━━━━━━━
Ad Spend      : ${fmtINR(n(spend))}
Revenue       : ${fmtINR(n(rev))}${cogs ? `\nCOGS          : ${fmtINR(n(cogs))}\nNet Profit    : ${fmtINR(profit)}` : ""}
ROAS          : ${fmt(roas)}x  [${st?.label}]
Ad Cost (MER) : ${fmt(mer, 1)}%
━━━━━━━━━━━━━━━━━━━━━━━━
Generated by ROAS Calculator Pro` : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <SectionCard title="Report Details" icon="📝" accent="#6366f1">
        <InputField label="Campaign Label" value={label} onChange={setLabel} placeholder="Q2 Meta Campaign" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 0.75rem" }}>
          <InputField label="Ad Spend" prefix="₹" value={spend} onChange={setSpend} placeholder="50,000" />
          <InputField label="Revenue" prefix="₹" value={rev} onChange={setRev} placeholder="2,00,000" />
        </div>
        <InputField label="COGS (optional)" prefix="₹" value={cogs} onChange={setCogs} placeholder="80,000" />
      </SectionCard>

      {roas && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.6rem" }}>
          <MetricCard label="ROAS" value={`${fmt(roas)}x`} sub={st?.label} color={st?.color} icon={st?.emoji} />
          <MetricCard label="Revenue" value={fmtINR(n(rev))} sub="total" color="#6366f1" icon="💰" />
          <MetricCard label="MER" value={`${fmt(mer, 1)}%`} sub="ad cost ratio" color="#f59e0b" icon="📊" />
        </div>
      )}

      <SectionCard title="Report Preview" icon="📄" accent="#64748b">
        <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "1rem" }}>
          <pre style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: roas ? "#475569" : "#cbd5e1", whiteSpace: "pre-wrap", lineHeight: 1.8, margin: 0, minHeight: "100px" }}>
            {roas ? report : "Fill in spend + revenue to generate your report…"}
          </pre>
        </div>
        <button onClick={() => { if (!report) return; navigator.clipboard.writeText(report).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2200); }); }} disabled={!roas}
          style={{ width: "100%", marginTop: "0.75rem", padding: "0.875rem", background: roas ? (copied ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#6366f1,#8b5cf6)") : "#f1f5f9", border: "none", borderRadius: "10px", color: roas ? "#fff" : "#cbd5e1", fontFamily: "'DM Sans', sans-serif", fontWeight: "700", fontSize: "0.85rem", cursor: roas ? "pointer" : "not-allowed", boxShadow: roas ? "0 4px 14px rgba(99,102,241,0.3)" : "none", transition: "all .3s" }}>
          {copied ? "✓ Copied to Clipboard!" : "Copy Report"}
        </button>
      </SectionCard>
      <ResetBtn onClick={() => { setSpend(""); setRev(""); setCogs(""); setLabel("Q2 Meta Campaign"); }} />
    </div>
  );
}

/* ══════ ROOT ══════ */
const TABS = [
  { key: "basic",   label: "Basic",    icon: "⚡" },
  { key: "pl",      label: "P&L",      icon: "🧾" },
  { key: "funnel",  label: "Funnel",   icon: "🔽" },
  { key: "compare", label: "Compare",  icon: "⚔️" },
  { key: "sim",     label: "Simulate", icon: "🎛️" },
  { key: "target",  label: "Target",   icon: "🎯" },
  { key: "export",  label: "Export",   icon: "📤" },
];

export default function App() {
  const [mode, setMode] = useState("basic");

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 40%, #f0fdf4 100%)", fontFamily: "'DM Sans', sans-serif", padding: "0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
        input:focus{outline:none}
        input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:4px;background:#e2e8f0;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;cursor:pointer;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.15)}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
      `}</style>

      {/* Top header bar */}
      <div style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1.5px solid rgba(226,232,240,0.8)", padding: "1rem 1.5rem", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>📈</div>
              <span style={{ fontWeight: "800", fontSize: "1.1rem", color: "#1e293b", letterSpacing: "-0.02em" }}>ROAS Calculator</span>
              <span style={{ fontSize: "0.6rem", fontWeight: "700", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", padding: "0.15rem 0.45rem", borderRadius: "999px" }}>PRO</span>
            </div>
            <div style={{ fontSize: "0.67rem", color: "#94a3b8", marginTop: "0.1rem" }}>Return On Ad Spend · 7 Modes</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1.25rem 1rem 3rem" }}>
        {/* Tab pills — scrollable */}
        <div style={{ overflowX: "auto", paddingBottom: "2px", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", gap: "0.35rem", width: "max-content", padding: "0.25rem" }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setMode(t.key)} style={{
                display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.5rem 0.875rem",
                background: mode === t.key ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.9)",
                border: mode === t.key ? "none" : "1.5px solid #e2e8f0",
                borderRadius: "999px", cursor: "pointer", whiteSpace: "nowrap",
                fontFamily: "'DM Sans', sans-serif", fontWeight: "700", fontSize: "0.75rem",
                color: mode === t.key ? "#fff" : "#64748b",
                boxShadow: mode === t.key ? "0 4px 14px rgba(99,102,241,0.35)" : "0 1px 3px rgba(0,0,0,0.06)",
                transition: "all .2s"
              }}>
                <span style={{ fontSize: "0.8rem" }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "basic"   && <BasicMode />}
        {mode === "pl"      && <PLMode />}
        {mode === "funnel"  && <FunnelMode />}
        {mode === "compare" && <CompareMode />}
        {mode === "sim"     && <SimulatorMode />}
        {mode === "target"  && <TargetMode />}
        {mode === "export"  && <ExportMode />}

        <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.62rem", color: "#cbd5e1", letterSpacing: "0.06em" }}>
          ROAS = Revenue ÷ Ad Spend · MER = Spend ÷ Revenue · CPA = Spend ÷ Conversions
        </div>
      </div>
    </div>
  );
}
