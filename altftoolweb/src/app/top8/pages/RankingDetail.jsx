// ============================================================
// TOP8 — Ranking detail page
// ============================================================
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Award, Bookmark, Check, Clock, Crown, Eye, Lightbulb, RefreshCw, Share2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Accordion, Avatar, Crumb, FeatureStrip, Flags, MonoTile, Newsletter, ProsCons, RankCard, Reveal, RowCard, ScorePip, SectionHead, ease } from "../components";
import { authorName, buildFaqs, categoryName, getAuthor, getRanking, getRelated, guideTipsFor, img, k, whoShouldFor } from "../data/service";

const getTop8 = () => (typeof window !== "undefined" ? window.__top8 : null) || {};

// ---------- hero ----------
function Hero({ r }) {
  const { go, saved, toggleSaved } = getTop8();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 100]);
  const isSaved = saved?.includes(r.slug);
  const author = getAuthor(r.author);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          alert("Link copied to clipboard!");
        });
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      alert("Link: " + url);
    }
  };

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({
        title: r.title,
        text: r.excerpt || "TOP8 ranking",
        url: url,
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          copyToClipboard(url);
        }
      });
    } else {
      copyToClipboard(url);
    }
  };

  return (
    <section className="rk-hero">
      <motion.img style={{ y }} src={img(r.hero, 2000)} alt={r.title} />
      <div className="rk-shade" />
      <div className="rk-copy">
        <Crumb trail={[{ label: "Home", path: "/" }, { label: categoryName(r.cat), path: `/category/${r.cat}` }, { label: r.title }]} />
        <Flags r={r} light />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          <h1>{r.title}</h1>
          <p className="rk-excerpt">{r.excerpt}</p>
          <div className="rk-byline">
            <button className="rk-author" onClick={() => go?.(`/author/${r.author}`)}>
              <Avatar author={author} size={34} />
              <span><b>{author?.name}</b><em>{author?.role}</em></span>
            </button>
            <span className="rk-meta"><Clock size={13} /> {r.read} min read</span>
            <span className="rk-meta"><RefreshCw size={13} /> Updated {r.updated}</span>
            <span className="rk-meta"><Eye size={13} /> {k(r.views)} readers</span>
          </div>
          <div className="rk-actions">
            <button className="primary" onClick={() => document.getElementById("the-eight")?.scrollIntoView({ behavior: "smooth" })}>
              See the ranking <ArrowRight size={15} />
            </button>
            <button className={`circle-btn ${isSaved ? "saved" : ""}`} aria-label="Save ranking" onClick={() => toggleSaved?.(r.slug)}>
              <Bookmark size={17} fill={isSaved ? "currentColor" : "none"} />
            </button>
            <button className={`circle-btn ${copied ? "copied" : ""}`} aria-label="Share ranking" onClick={handleShare}>
              {copied ? <Check size={16} /> : <Share2 size={16} />}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------- overview ----------
function Overview({ r }) {
  return (
    <section className="wrap rk-overview">
      <Reveal className="ov-left">
        <p className="eyebrow">Overview</p>
        <h2>{r.kicker.split("·")[1]?.trim() || "The ranking"}</h2>
        <div className="ov-score"><ScorePip score={r.items[0].score} big /><span>Top score in this ranking:<br /><b>{r.items[0].name}</b></span></div>
      </Reveal>
      <Reveal className="ov-right" delay={0.1}>
        {r.intro.map((p, i) => <p key={i}>{p}</p>)}
        <div className="ov-facts">
          <span><b>8</b> of {r.cat === "animals" ? "40+" : "60+"} shortlisted</span>
          <span><b>{r.read * 24}</b> hours of research</span>
          <span><b>{k(r.saves)}</b> readers saved this</span>
        </div>
      </Reveal>
    </section>
  );
}

// ---------- winner spotlight ----------
function Winner({ r }) {
  const w = r.items[0];
  return (
    <section className="wrap winner">
      <Reveal>
        <div className="winner-card" style={{ "--acc": w.tile }}>
          <div className="winner-badge"><Crown size={14} /> Winner — {r.heroLabel || "TOP8 score"} {w.score}</div>
          <div className="winner-grid">
            <div className="winner-id">
              <span className="winner-no">01</span>
              <MonoTile name={w.name} color={w.tile} size={110} />
            </div>
            <div className="winner-copy">
              <h3>{w.name}</h3>
              <p className="winner-tag">{w.tag}</p>
              <p className="winner-verdict">“{w.verdict}”</p>
              <div className="winner-facts">
                <span><em>Price</em><b>{w.price}</b></span>
                <span><em>Best for</em><b>{w.best}</b></span>
              </div>
            </div>
            <div className="winner-pc">
              <div><b className="pc-good"><Check size={13} /> Why it wins</b>
                <ul>{w.pros.map((p) => <li key={p}><Check size={12} /> {p}</li>)}</ul>
              </div>
              <div><b className="pc-bad">Watch out for</b>
                <ul className="pc-cons">{w.cons.map((c) => <li key={c}>× {c}</li>)}</ul>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ---------- the full eight ----------
function TheEight({ r }) {
  const [open, setOpen] = useState(-1);
  return (
    <section id="the-eight" className="rk-list-sec">
      <div className="wrap">
        <SectionHead dark eyebrow="The definitive eight" title={<>The full<br />ranking.</>} side={<p className="rk-list-note">Scores out of 10, weighted for what matters in real life — not spec sheets.</p>} />
        <div className="rk-list">
          {r.items.map((it, i) => (
            <motion.div key={it.name} className={`rk-item ${open === i ? "open" : ""}`} initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.55, delay: i * 0.03, ease }}>
              <button className="rk-item-head" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span className="rk-item-no">{String(i + 1).padStart(2, "0")}</span>
                <MonoTile name={it.name} color={it.tile} size={64} />
                <div className="rk-item-name">
                  <h3>{it.name} {i === 0 && <span className="rk-best"><Award size={11} /> Our winner</span>}</h3>
                  <p>{it.tag}</p>
                </div>
                <div className="rk-item-right">
                  <div className="rk-scorebar"><span style={{ width: `${it.score * 10}%`, background: it.tile }} /></div>
                  <b>{it.score.toFixed(1)}</b>
                  <span className="rk-item-toggle">{open === i ? "−" : "+"}</span>
                </div>
              </button>
              <motion.div className="rk-item-body" initial={false} animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }} transition={{ duration: 0.4, ease }}>
                <div className="rk-item-detail">
                  <p className="rk-verdict">“{it.verdict}”</p>
                  <div className="rk-facts">
                    <span><em>Price</em><b>{it.price}</b></span>
                    {it.free !== "—" && <span><em>Free option</em><b>{it.free}</b></span>}
                    <span><em>Best for</em><b>{it.best}</b></span>
                  </div>
                  <div className="rk-pc">
                    <ul>{it.pros.map((p) => <li key={p}><Check size={12} /> {p}</li>)}</ul>
                    <ul className="pc-cons">{it.cons.map((c) => <li key={c}>× {c}</li>)}</ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- comparison table ----------
function CompareTable({ r }) {
  const cols = r.items.slice(0, 4);
  const rows = [
    { label: r.heroLabel || "TOP8 score", get: (it) => <b className="ct-score">{it.score}</b> },
    { label: "Price", get: (it) => it.price },
    ...(r.items[0].free !== "—" ? [{ label: "Free option", get: (it) => it.free }] : []),
    { label: "Best for", get: (it) => it.best },
    { label: "Biggest pro", get: (it) => it.pros[0] },
    { label: "Honest drawback", get: (it) => it.cons[0] },
  ];
  return (
    <section className="ct-sec">
      <div className="wrap">
        <SectionHead eyebrow="At a glance" title={<>Compare the<br />top four.</>} />
        <Reveal className="ct-scroll">
          <div className="ct-table" role="table" aria-label="Comparison table" style={{ gridTemplateColumns: `1.1fr repeat(${cols.length}, 1fr)` }}>
            <div className="ct-row ct-head" role="row">
              <span role="columnheader" />
              {cols.map((it) => (
                <span key={it.name} role="columnheader" className="ct-colhead">
                  <MonoTile name={it.name} color={it.tile} size={44} /><b>{it.name}</b>
                </span>
              ))}
            </div>
            {rows.map((row) => (
              <div className="ct-row" role="row" key={row.label}>
                <span role="rowheader">{row.label}</span>
                {cols.map((it) => <span key={it.name} role="cell">{row.get(it)}</span>)}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- pros & cons ----------
function ProsConsSec({ r }) {
  return (
    <section className="wrap pad">
      <SectionHead eyebrow="The honest ledger" title={<>Pros &<br />cons.</>} side={<p className="rk-list-note dark-t">Every entry on TOP8 lists its drawbacks. A review without cons is an advert.</p>} />
      <div className="pc-grid">
        {r.items.slice(0, 3).map((it, i) => <Reveal key={it.name} delay={i * 0.07}><ProsCons item={it} /></Reveal>)}
      </div>
    </section>
  );
}

// ---------- pricing ----------
function Pricing({ r }) {
  if (r.items[0].free === "—") return null;
  return (
    <section className="pricing">
      <div className="wrap">
        <SectionHead dark eyebrow="Pricing comparison" title={<>What the eight<br />actually cost.</>} />
        <div className="pricegrid">
          {r.items.map((it, i) => (
            <Reveal key={it.name} delay={i * 0.04} className="pricecard">
              <span className="price-rank">0{i + 1}</span>
              <b>{it.name}</b>
              <span className="price-val">{it.price}</span>
              <span className={`price-free ${it.free === "Yes" ? "yes" : ""}`}>{it.free === "Yes" ? "Free tier included" : it.free === "No" ? "Paid only" : it.free}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- who should buy / buyer's guide ----------
function Guide({ r }) {
  const personas = whoShouldFor(r);
  const tips = guideTipsFor(r);
  return (
    <section className="wrap guide">
      <Reveal className="guide-left">
        <p className="eyebrow">Who should choose what</p>
        <h2>Which one<br /><i>for you?</i></h2>
        <div className="personas">
          {personas.map((p, i) => (
            <div key={i} className="persona">
              <span>{p.persona}</span>
              <b>{p.pick}</b>
              <em>— {p.why}</em>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal className="guide-right" delay={0.1}>
        <p className="eyebrow">Buyer's guide</p>
        <h2>How to<br />choose well.</h2>
        <div className="tips">
          {tips.map((t, i) => (
            <div key={i} className="tip"><Lightbulb size={16} /><p>{t}</p></div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

// ---------- FAQ ----------
function Faq({ r }) {
  return (
    <section className="wrap faqsec">
      <Reveal><p className="eyebrow">Good to know</p><h2>Questions,<br /><i>answered.</i></h2></Reveal>
      <Reveal delay={0.08}><Accordion items={buildFaqs(r)} /></Reveal>
    </section>
  );
}

// ---------- sticky CTA ----------
function StickyCTA({ r }) {
  const [show, setShow] = useState(false);
  const { go } = getTop8();
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 1.2);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.div className="stickycta" initial={false} animate={{ y: show ? 0 : 90 }} transition={{ duration: 0.4, ease }}>
      <div>
        <b>{r.title}</b>
        <span>Winner: {r.items[0].name} · {r.items[0].score}/10</span>
      </div>
      <button className="primary small" onClick={() => document.getElementById("the-eight")?.scrollIntoView({ behavior: "smooth" })}>
        Jump to the list <ArrowUpRight size={14} />
      </button>
    </motion.div>
  );
}

export default function RankingDetail({ slug }) {
  const r = getRanking(slug);
  const { go } = getTop8();
  if (!r) {
    return (
      <main className="page nf">
        <h1>Ranking not found</h1>
        <p>This ranking may have moved — or it only ever got to 7.</p>
        <button className="primary" onClick={() => go?.("/explore")}>Browse all rankings <ArrowRight size={15} /></button>
      </main>
    );
  }
  const related = getRelated(slug, 3);
  return (
    <main className="detail">
      <Hero r={r} />
      <Overview r={r} />
      <Winner r={r} />
      <TheEight r={r} />
      <CompareTable r={r} />
      <ProsConsSec r={r} />
      <Pricing r={r} />
      <Guide r={r} />
      <Faq r={r} />
      <section className="wrap pad">
        <SectionHead eyebrow="Related rankings" title={<>Keep<br /><i>going.</i></>} side={<button className="textlink" onClick={() => go?.(`/category/${r.cat}`)}>All {categoryName(r.cat)} <ArrowRight size={15} /></button>} />
        <div className="relgrid">{related.map((x, i) => <Reveal key={x.slug} delay={i * 0.06}><RankCard r={x} i={i} /></Reveal>)}</div>
      </section>
      <Newsletter />
      <StickyCTA r={r} />
    </main>
  );
}
