// ============================================================
// TOP8 — Shared component library
// ============================================================
import { motion, useInView } from "framer-motion";
import { ArrowRight, Bookmark, Check, ChevronRight, Crown, Flame, Minus, Plus, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { categoryName, img, initials, k, rankingScore } from "./data/service";

const getTop8 = () => (typeof window !== "undefined" ? window.__top8 : null) || {};

export const ease = [0.2, 0.65, 0.2, 1];

// ---------- scroll reveal wrapper ----------
export function Reveal({ children, className = "", delay = 0, y = 26 }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay, ease }}>
      {children}
    </motion.div>
  );
}

// ---------- section heading ----------
export function SectionHead({ eyebrow, title, side, dark }) {
  return (
    <div className={`shead ${dark ? "dark" : ""}`}>
      <Reveal>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </Reveal>
      {side && <Reveal delay={0.08} className="shead-side">{side}</Reveal>}
    </div>
  );
}

// ---------- badges ----------
export function Flags({ r, light }) {
  return (
    <span className="flags">
      {r.editorsPick && <span className={`flag f-ed ${light ? "light" : ""}`}><Crown size={11} /> Editor's pick</span>}
      {r.trending && <span className={`flag f-tr ${light ? "light" : ""}`}><Flame size={11} /> Trending</span>}
      {r.isNew && <span className={`flag f-nw ${light ? "light" : ""}`}><Sparkles size={11} /> New</span>}
    </span>
  );
}

export function ScorePip({ score, big }) {
  return (
    <span className={`scorepip ${big ? "big" : ""} ${score >= 9.5 ? "top" : ""}`}>
      <b>{score.toFixed(1)}</b>{big && <span>TOP8 score</span>}
    </span>
  );
}

// ---------- editorial ranking card (image) ----------
export function RankCard({ r, i = 0, tall }) {
  const { go, saved, toggleSaved } = getTop8();
  return (
    <article className={`rankcard ${tall ? "tall" : ""}`} onClick={() => go?.(`/ranking/${r.slug}`)} tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && go?.(`/ranking/${r.slug}`)}>
      <div className="rankimg">
        <img src={img(r.hero, 1000)} alt={r.title} loading="lazy" />
        <span className="ranknum">0{(i % 9) + 1}</span>
        <button aria-label="Save ranking" onClick={(e) => { e.stopPropagation(); toggleSaved?.(r.slug); }}>
          <Bookmark size={16} fill={saved?.includes(r.slug) ? "currentColor" : "none"} />
        </button>
        <div className="rankimg-flags"><Flags r={r} light /></div>
      </div>
      <p className="rankkick">{r.kicker}</p>
      <h3>{r.title}</h3>
      <div className="rankmeta">
        <span>{k(r.saves)} saves · {r.read} min</span>
        <b className="gocircle"><ArrowRight size={15} /></b>
      </div>
    </article>
  );
}

// ---------- compact row card (no photo — mono tile) ----------
export function RowCard({ r, i = 0 }) {
  const { go, saved, toggleSaved } = getTop8();
  const cat = categoryName(r.cat);
  return (
    <motion.article className="rowcard" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.04, ease }}
      onClick={() => go?.(`/ranking/${r.slug}`)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && go?.(`/ranking/${r.slug}`)}>
      <span className="rowcard-no">{String(i + 1).padStart(2, "0")}</span>
      <MonoTile name={r.items[0]?.name || r.title} color={r.items[0]?.tile} size={58} />
      <div className="rowcard-main">
        <h3>{r.title}</h3>
        <p>{cat} · {k(r.views)} views · winner: <b>{r.items[0]?.name}</b></p>
      </div>
      <ScorePip score={rankingScore(r)} />
      <button className="rowcard-save" aria-label="Save ranking"
        onClick={(e) => { e.stopPropagation(); toggleSaved?.(r.slug); }}>
        <Bookmark size={17} fill={saved?.includes(r.slug) ? "currentColor" : "none"} />
      </button>
    </motion.article>
  );
}

// ---------- wide feature strip (big editorial card) ----------
export function FeatureStrip({ r, flip }) {
  const { go } = getTop8();
  return (
    <article className={`fstrip ${flip ? "flip" : ""}`} onClick={() => go?.(`/ranking/${r.slug}`)}>
      <div className="fstrip-img"><img src={img(r.hero, 1400)} alt={r.title} loading="lazy" /><ScorePip score={rankingScore(r)} /></div>
      <div className="fstrip-copy">
        <Flags r={r} />
        <h3>{r.title}</h3>
        <p>{r.excerpt}</p>
        <span className="fstrip-meta">{categoryName(r.cat)} · {r.read} min read · {k(r.views)} readers</span>
        <span className="textlink">Read the ranking <ArrowRight size={15} /></span>
      </div>
    </article>
  );
}

// ---------- mono tile ----------
export function MonoTile({ name = "?", color = "#eee", size = 58 }) {
  return <span className="monotile" style={{ background: color, width: size, height: size, fontSize: size * 0.42 }}>{initials(name)[0]}</span>;
}

// ---------- author avatar ----------
export function Avatar({ author, size = 44 }) {
  if (!author) return null;
  return <span className="avatar" style={{ background: author.color, width: size, height: size, fontSize: size * 0.36 }}>{author.initials}</span>;
}

// ---------- breadcrumb ----------
export function Crumb({ trail = [] }) {
  const { go } = getTop8();
  return (
    <nav className="crumb" aria-label="Breadcrumb">
      {trail.map((t, i) => (
        <span key={i} className="crumb-i">
          {t.path ? <button onClick={() => go?.(t.path)}>{t.label}</button> : <span className="crumb-here">{t.label}</span>}
          {i < trail.length - 1 && <ChevronRight size={12} />}
        </span>
      ))}
    </nav>
  );
}

// ---------- filter chips ----------
export function Chips({ options, value, onChange }) {
  return (
    <div className="chips" role="tablist">
      {options.map((o) => (
        <button key={o.id} role="tab" aria-selected={value === o.id} className={`chip ${value === o.id ? "on" : ""}`} onClick={() => onChange(o.id)}>
          {o.label}{o.count != null && <em>{o.count}</em>}
        </button>
      ))}
    </div>
  );
}

// ---------- animated counter ----------
export function CountUp({ value, suffix = "", decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now(), dur = 1400;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref}>{v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}</span>;
}

// ---------- marquee ----------
export function Marquee({ items, onPick }) {
  return (
    <div className="marquee" aria-label="Trending topics">
      <div className="marquee-track">
        {[...items, ...items].map((x, i) => (
          <button key={i} className="marquee-chip" onClick={() => onPick?.(x)}>
            {x} <i>·</i>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- accordion ----------
export function Accordion({ items, dark }) {
  const [open, setOpen] = useState(0);
  return (
    <div className={`acc ${dark ? "dark" : ""}`}>
      {items.map((x, i) => (
        <div key={i} className="acc-item">
          <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{x.q}</span>
            {open === i ? <Minus size={16} /> : <Plus size={16} />}
          </button>
          <motion.div className="acc-body" initial={false}
            animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }} transition={{ duration: 0.35, ease }}>
            <p>{x.a}</p>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

// ---------- pros / cons ----------
export function ProsCons({ item }) {
  return (
    <div className="pc-card">
      <div className="pc-head"><MonoTile name={item.name} color={item.tile} size={46} /><div><h4>{item.name}</h4><span>{item.tag}</span></div><ScorePip score={item.score} /></div>
      <div className="pc-cols">
        <div>
          <b className="pc-good"><Check size={13} /> Pros</b>
          <ul>{item.pros.map((p) => <li key={p}><Check size={12} /> {p}</li>)}</ul>
        </div>
        <div>
          <b className="pc-bad"><span className="pc-x">×</span> Cons</b>
          <ul className="pc-cons">{item.cons.map((c) => <li key={c}><span>×</span> {c}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

// ---------- newsletter ----------
export function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="newsletter">
      <div className="orb" />
      <Reveal>
        <Sparkles size={22} strokeWidth={1.5} />
        <p className="eyebrow">The weekly eight</p>
        <h2>Eight good things.<br /><i>Every Friday.</i></h2>
        <p className="nl-sub">A thoughtful edit of discoveries, ideas and places worth knowing.</p>
        {done ? (
          <p className="nl-done"><Check size={16} /> You are on the list. See you Friday.</p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
            <label className="sr" htmlFor="nl-email">Email address</label>
            <input id="nl-email" type="email" required placeholder="Email address" />
            <button type="submit">Join the list <ArrowRight size={15} /></button>
          </form>
        )}
        <small>No noise. Unsubscribe any time.</small>
      </Reveal>
    </section>
  );
}

// ---------- pagination ----------
export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      {Array.from({ length: pages }, (_, i) => (
        <button key={i} aria-current={page === i + 1} className={page === i + 1 ? "on" : ""} onClick={() => onPage(i + 1)}>{i + 1}</button>
      ))}
    </div>
  );
}

// ---------- empty state ----------
export function Empty({ icon, title, body, action, onAction }) {
  return (
    <Reveal className="empty">
      {icon}
      <h2>{title}</h2>
      <p>{body}</p>
      {action && <button className="primary" onClick={onAction}>{action} <ArrowRight size={15} /></button>}
    </Reveal>
  );
}
