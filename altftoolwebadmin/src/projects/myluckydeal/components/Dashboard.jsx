"use client";

import { useEffect, useState } from "react";
import {
  TicketPercent, FolderTree, Store, BadgePercent, FileText, Megaphone,
  Image as ImageIcon, HelpCircle, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { listDocs } from "../lib/firebase";

const CARDS = [
  { col: "deals", label: "Deals", icon: TicketPercent, extra: (r) => `${r.filter((x) => x.hot).length} hot · ${r.filter((x) => x.featured).length} featured` },
  { col: "categories", label: "Categories", icon: FolderTree },
  { col: "stores", label: "Stores", icon: Store, extra: (r) => `${r.filter((x) => x.featured).length} featured` },
  { col: "coupons", label: "Coupons", icon: BadgePercent },
  { col: "blogs", label: "Blog Posts", icon: FileText, extra: (r) => `${r.filter((x) => x.featured).length} featured` },
  { col: "ads", label: "Ads", icon: Megaphone, extra: (r) => `${r.filter((x) => x.active !== false).length} active` },
  { col: "hero", label: "Hero Slides", icon: ImageIcon },
  { col: "faqs", label: "FAQs", icon: HelpCircle },
];

export default function Dashboard({ onNavigate, notify }) {
  const [stats, setStats] = useState({});
  const [health, setHealth] = useState(null);

  useEffect(() => {
    (async () => {
      const out = {};
      const warnings = [];
      let anyData = false;
      for (const c of CARDS) {
        try {
          const rows = await listDocs(c.col);
          out[c.col] = { count: rows.length, extra: c.extra ? c.extra(rows) : "" };
          if (rows.length > 0) anyData = true;

          if (c.col === "deals") {
            const noImg = rows.filter((r) => !r.imageUrl).length;
            if (rows.length && noImg) warnings.push(`${noImg} deal(s) have no uploaded image (vector fallback will show).`);
            const dod = rows.filter((r) => (r.badges || []).includes("Deal of the Day")).length;
            if (rows.length && dod !== 1) warnings.push(`"Deal of the Day" badge is on ${dod} deals — exactly 1 is expected.`);
            const hot = rows.filter((r) => r.hot).length;
            if (hot > 4) warnings.push(`${hot} deals marked hot — homepage shows only 4.`);
          }
          if (c.col === "ads") {
            const noImg = rows.filter((r) => r.active !== false && !r.imageUrl).length;
            if (noImg) warnings.push(`${noImg} active ad(s) without an image.`);
          }
          if (c.col === "blogs") {
            const feat = rows.filter((r) => r.featured).length;
            if (rows.length && feat !== 1) warnings.push(`${feat} blog posts featured — exactly 1 recommended.`);
          }
        } catch (e) {
          out[c.col] = { count: "—", extra: "" };
          warnings.push(`Could not read "${c.col}": ${e.message}`);
        }
      }
      if (!anyData) warnings.unshift("Firestore is empty — the website is running on seed fallback. Run Seed Migration to take control.");
      setStats(out);
      setHealth(warnings);
    })().catch((e) => notify(e.message, "error"));
  }, [notify]);

  return (
    <div>
      <div className="mla-cards">
        {CARDS.map((c, i) => {
          const Icon = c.icon;
          return (
            <button key={c.col} className="mla-statcard" style={{ animationDelay: `${i * 40}ms` }} onClick={() => onNavigate(c.col)}>
              <span className="mla-staticon"><Icon size={20} strokeWidth={2.2} /></span>
              <span className="mla-statbody">
                <span className="mla-statnum">
                  {stats[c.col]?.count ?? <span className="mla-skel" style={{ display: "inline-block", height: 20, width: 34, verticalAlign: "middle" }} />}
                </span>
                <span className="mla-statlabel">{c.label}</span>
                {stats[c.col]?.extra ? <span className="mla-statextra">{stats[c.col].extra}</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mla-panelcard">
        <h3>Content Health</h3>
        {health === null ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <span className="mla-skel" style={{ height: 34 }} />
            <span className="mla-skel" style={{ height: 34, width: "80%" }} />
          </div>
        ) : health.length === 0 ? (
          <p className="mla-ok" style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <CheckCircle2 size={16} /> All checks passed — content looks production-ready.
          </p>
        ) : (
          <ul className="mla-health">
            {health.map((w, i) => (
              <li key={i}><AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2, color: "var(--warn)" }} /> {w}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
