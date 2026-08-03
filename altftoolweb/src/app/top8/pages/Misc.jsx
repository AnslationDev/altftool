// ============================================================
// TOP8 — Search, Compare, Countries, Collections, Bookmarks,
// Author, About and 404 pages
// ============================================================
import { ArrowRight, ArrowUpRight, Bookmark, Compass, GitCompareArrows, Landmark, MapPin, Search, Sparkles, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { Accordion, Avatar, Crumb, Empty, Newsletter, RankCard, Reveal, RowCard, ScorePip, SectionHead, FeatureStrip } from "../components";
import { searchAll, allCategories, allCollections, allCountries, allRankings, authorName, categoryName, getAuthor, getCollection, getCountry, getRanking, img, k, rankingScore } from "../data/service";

const getTop8 = () => (typeof window !== "undefined" ? window.__top8 : null) || {};

// ------------------------------------------------------------
// Search results
// ------------------------------------------------------------
export function SearchPage({ query }) {
  const [q, setQ] = useState(query || "");
  const res = useMemo(() => searchAll(q), [q]);
  const { go } = getTop8();
  return (
    <main className="page">
      <section className="wrap sp-hero">
        <Crumb trail={[{ label: "Home", path: "/" }, { label: "Search" }]} />
        <p className="eyebrow">Global search</p>
        <div className="sp-bar">
          <Search size={26} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rankings, categories, collections…" aria-label="Search TOP8" />
        </div>
        {!res && <p className="sp-hint">Type at least two characters. Try “beaches”, “pixel”, “tokyo” or “crm”.</p>}
      </section>

      {res?.empty && <Empty icon={<Search size={44} strokeWidth={1} />} title={`No results for “${res.q}”`} body="Nothing matched — check the spelling, or try a broader term like “travel” or “software”." action="Browse everything" onAction={() => go?.("/explore")} />}

      {res && !res.empty && (
        <section className="wrap sp-results">
          {res.rankings.length > 0 && (
            <div className="sp-group">
              <Reveal><h2 className="sp-title">Rankings <span>{res.rankings.length}</span></h2></Reveal>
              <div className="listgrid">{res.rankings.map((r, i) => <Reveal key={r.slug} delay={i * 0.04}><RankCard r={r} i={i} /></Reveal>)}</div>
            </div>
          )}
          {res.categories.length > 0 && (
            <div className="sp-group">
              <Reveal><h2 className="sp-title">Categories <span>{res.categories.length}</span></h2></Reveal>
              <div className="sp-cats">{res.categories.map((c) => (
                <button key={c.slug} className="sp-cat" onClick={() => go?.(`/category/${c.slug}`)}>
                  <img src={img(c.img, 300)} alt="" /><b>{c.name}</b><span>{c.count} rankings</span><ArrowUpRight size={14} />
                </button>
              ))}</div>
            </div>
          )}
          {res.collections.length > 0 && (
            <div className="sp-group">
              <Reveal><h2 className="sp-title">Collections <span>{res.collections.length}</span></h2></Reveal>
              <div className="sp-lines">{res.collections.map((c) => (
                <button key={c.slug} className="sp-line" onClick={() => go?.(`/collection/${c.slug}`)}><b>{c.name}</b><span>{c.desc}</span><ArrowRight size={15} /></button>
              ))}</div>
            </div>
          )}
          {res.countries.length > 0 && (
            <div className="sp-group">
              <Reveal><h2 className="sp-title">Countries <span>{res.countries.length}</span></h2></Reveal>
              <div className="sp-lines">{res.countries.map((c) => (
                <button key={c.slug} className="sp-line" onClick={() => go?.(`/country/${c.slug}`)}><b>{c.name}</b><span>{c.blurb}</span><ArrowRight size={15} /></button>
              ))}</div>
            </div>
          )}
          {res.articles.length > 0 && (
            <div className="sp-group">
              <Reveal><h2 className="sp-title">Journal <span>{res.articles.length}</span></h2></Reveal>
              <div className="sp-lines">{res.articles.map((a) => (
                <button key={a.slug} className="sp-line" onClick={() => go?.("/about")}><b>{a.title}</b><span>{a.dek}</span><ArrowRight size={15} /></button>
              ))}</div>
            </div>
          )}
        </section>
      )}
      <Newsletter />
    </main>
  );
}

// ------------------------------------------------------------
// Compare rankings
// ------------------------------------------------------------
export function ComparePage() {
  const ranks = allRankings();
  const [a, setA] = useState("best-ai-tools-2025");
  const [b, setB] = useState("best-productivity-apps");
  const ra = getRanking(a), rb = getRanking(b);
  const { go } = getTop8();
  const Sel = ({ value, onChange, label }) => (
    <label className="cmp-sel">{label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {ranks.map((r) => <option key={r.slug} value={r.slug}>{r.title}</option>)}
      </select>
    </label>
  );
  const Col = ({ r }) => (
    <div className="cmp-col">
      <button className="cmp-hero" onClick={() => go?.(`/ranking/${r.slug}`)}>
        <img src={img(r.hero, 900)} alt={r.title} />
        <div><b>{r.title}</b><span>{categoryName(r.cat)} · updated {r.updated}</span></div>
      </button>
      <div className="cmp-winner">
        <Trophy size={15} /><span>Winner</span><b>{r.items[0].name}</b><ScorePip score={r.items[0].score} />
      </div>
      <table className="cmp-table">
        <tbody>
          <tr><td>Top score</td><td><b>{r.items[0].score}</b></td></tr>
          <tr><td>Runner-up</td><td>{r.items[1].name} · {r.items[1].score}</td></tr>
          <tr><td>Entry price</td><td>{r.items[r.items.length - 1].price}</td></tr>
          <tr><td>Reading time</td><td>{r.read} min</td></tr>
          <tr><td>Community saves</td><td>{k(r.saves)}</td></tr>
        </tbody>
      </table>
      <div className="cmp-bestfor">
        <b>Head-to-head verdict</b>
        <p>Choose <b>{r.items[0].name}</b> {r.items[0].best ? `if you care most about ${r.items[0].best.toLowerCase()}` : "for the safest overall choice"}. “{r.items[0].verdict}”</p>
      </div>
    </div>
  );
  return (
    <main className="page">
      <section className="wrap cmp-hero-sec">
        <Crumb trail={[{ label: "Home", path: "/" }, { label: "Compare" }]} />
        <Reveal><p className="eyebrow">Compare rankings</p><h1>Two lists.<br /><i>One winner.</i></h1>
          <p className="cmp-sub">Pick any two rankings and put them side by side — winners, scores, prices and verdicts.</p></Reveal>
        <div className="cmp-pickers"><Sel label="Ranking A" value={a} onChange={setA} /><GitCompareArrows size={22} /><Sel label="Ranking B" value={b} onChange={setB} /></div>
      </section>
      <section className="wrap cmp-grid"><Col r={ra} /><Col r={rb} /></section>
      <section className="wrap pad">
        <SectionHead eyebrow="Related" title={<>Because you like<br /><i>comparing.</i></>} />
        <div className="rowlist">{[ra, rb].map((r, i) => <RowCard key={r.slug} r={r} i={i} />)}</div>
      </section>
      <Newsletter />
    </main>
  );
}

// ------------------------------------------------------------
// Countries
// ------------------------------------------------------------
export function CountriesPage() {
  const countries = allCountries();
  const { go } = getTop8();
  return (
    <main className="page">
      <section className="wrap countries-hero">
        <Crumb trail={[{ label: "Home", path: "/" }, { label: "Countries" }]} />
        <Reveal><p className="eyebrow">Country rankings</p><h1>The world,<br /><i>one country at a time.</i></h1>
        <p className="cmp-sub">Regional guides collecting our best rankings per country — where to go, eat and stay.</p></Reveal>
      </section>
      <section className="wrap countrygrid">
        {countries.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.06}>
            <article className="countrycard" onClick={() => go?.(`/country/${c.slug}`)} tabIndex={0}>
              <img src={img(c.img, 1200)} alt={c.name} />
              <div className="countrycard-shade" />
              <div className="countrycard-copy">
                <span className="cc-region">{c.region}</span>
                <h3>{c.name}</h3>
                <p>{c.blurb}</p>
                <div className="cc-meta"><span>TOP8 score {c.score}</span><span>{c.visitors}</span><b className="gocircle light"><ArrowRight size={14} /></b></div>
              </div>
            </article>
          </Reveal>
        ))}
      </section>
      <Newsletter />
    </main>
  );
}

export function CountryDetailPage({ slug }) {
  const c = getCountry(slug);
  const { go } = getTop8();
  if (!c) return <CountriesPage />;
  return (
    <main className="detail">
      <section className="rk-hero country-detail-hero">
        <img src={img(c.img, 1900)} alt={c.name} />
        <div className="rk-shade" />
        <div className="rk-copy">
          <Crumb trail={[{ label: "Home", path: "/" }, { label: "Countries", path: "/countries" }, { label: c.name }]} />
          <Reveal><p className="eyebrow">{c.region}</p><h1>{c.name},<br /><i>decided.</i></h1><p className="rk-excerpt">{c.blurb}</p></Reveal>
          <div className="cd-stats">
            <span><em>Capital</em><b>{c.capital}</b></span>
            <span><em>Best time</em><b>{c.bestTime}</b></span>
            <span><em>Visitors</em><b>{c.visitors}</b></span>
            <span><em>TOP8 score</em><b>{c.score}</b></span>
          </div>
        </div>
      </section>
      <section className="wrap pad">
        <SectionHead eyebrow="Field notes" title={<>Know before<br /><i>you go.</i></>} />
        <div className="cd-tips">{c.facts.map((f, i) => (
          <Reveal key={f} delay={i * 0.05}><div className="cd-tip"><MapPin size={15} /><p>{f}</p></div></Reveal>
        ))}</div>
      </section>
      <section className="wrap pad">
        <SectionHead eyebrow="Rankings from this guide" title={<>The best of<br /><i>{c.name}.</i></>} />
        <div className="relgrid">{c.resolved.map((r, i) => <Reveal key={r.slug} delay={i * 0.06}><RankCard r={r} i={i} /></Reveal>)}</div>
      </section>
      <section className="wrap">
        <Reveal className="cta small-cta">
          <img src={img(c.img, 1400)} alt="" />
          <div className="cta-copy">
            <p className="eyebrow">Planning a trip?</p>
            <h2>Every {c.name} ranking, together.</h2>
            <button className="primary" onClick={() => go?.("/explore")}>Explore all rankings <ArrowRight size={15} /></button>
          </div>
        </Reveal>
      </section>
      <Newsletter />
    </main>
  );
}

// ------------------------------------------------------------
// Collections
// ------------------------------------------------------------
export function CollectionsPage() {
  const cols = allCollections();
  const { go } = getTop8();
  return (
    <main className="page">
      <section className="wrap countries-hero">
        <Crumb trail={[{ label: "Home", path: "/" }, { label: "Collections" }]} />
        <Reveal><p className="eyebrow">Curated collections</p><h1>Rankings with<br /><i>a point of view.</i></h1>
        <p className="cmp-sub">Editor-built bundles for a mood, a moment or a mission.</p></Reveal>
      </section>
      <section className="wrap colgrid-page">
        {cols.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.05}>
            <article className="colcard big" onClick={() => go?.(`/collection/${c.slug}`)} tabIndex={0}>
              <div className="colcard-img"><img src={img(c.img, 900)} alt={c.name} loading="lazy" /><span style={{ background: c.tone }}>{c.resolved.length} rankings</span></div>
              <h3>{c.name}</h3><p>{c.desc}</p>
              <div className="colcard-thumbs">{c.resolved.map((r) => <img key={r.slug} src={img(r.hero, 200)} alt="" />)}<b><ArrowRight size={14} /></b></div>
            </article>
          </Reveal>
        ))}
      </section>
      <Newsletter />
    </main>
  );
}

export function CollectionDetailPage({ slug }) {
  const c = getCollection(slug);
  if (!c) return <CollectionsPage />;
  return (
    <main className="detail">
      <section className="rk-hero coll-hero">
        <img src={img(c.img, 1900)} alt={c.name} />
        <div className="rk-shade" />
        <div className="rk-copy">
          <Crumb trail={[{ label: "Home", path: "/" }, { label: "Collections", path: "/collections" }, { label: c.name }]} />
          <Reveal><p className="eyebrow">Collection · {c.resolved.length} rankings</p><h1>{c.name}</h1><p className="rk-excerpt">{c.desc}</p></Reveal>
        </div>
      </section>
      <section className="wrap pad">
        {c.resolved.map((r, i) => <Reveal key={r.slug} delay={i * 0.05} className="coll-strip-wrap"><FeatureStrip r={r} flip={i % 2 === 1} /></Reveal>)}
      </section>
      <Newsletter />
    </main>
  );
}

// ------------------------------------------------------------
// Bookmarks
// ------------------------------------------------------------
export function BookmarksPage() {
  const { saved } = getTop8();
  const { go } = getTop8();
  const list = (saved || []).map(getRanking).filter(Boolean);
  return (
    <main className="page">
      <section className="wrap countries-hero">
        <Crumb trail={[{ label: "Home", path: "/" }, { label: "Saved" }]} />
        <Reveal><p className="eyebrow">Your library</p><h1>Saved<br /><i>for later.</i></h1>
        <p className="cmp-sub">{list.length ? `${list.length} ranking${list.length > 1 ? "s" : ""} in your shortlist — kept privately in this browser.` : "Keep the rankings you want to return to. Tap the bookmark anywhere."}</p></Reveal>
      </section>
      {list.length === 0 ? (
        <Empty icon={<Bookmark size={44} strokeWidth={1} />} title="Your shortlist starts here"
          body="Tap the bookmark icon on any ranking card and it will wait for you here."
          action="Explore rankings" onAction={() => go?.("/explore")} />
      ) : (
        <section className="wrap listbody pad-b"><div className="listgrid">{list.map((r, i) => <Reveal key={r.slug} delay={i * 0.04}><RankCard r={r} i={i} /></Reveal>)}</div></section>
      )}
      <Newsletter />
    </main>
  );
}

// ------------------------------------------------------------
// Author profile
// ------------------------------------------------------------
export function AuthorPage({ slug }) {
  const a = getAuthor(slug);
  const { go } = getTop8();
  if (!a) return <NotFound />;
  return (
    <main className="detail">
      <section className="wrap author-hero">
        <Crumb trail={[{ label: "Home", path: "/" }, { label: "Creators" }, { label: a.name }]} />
        <Reveal className="author-card">
          <Avatar author={a} size={96} />
          <div>
            <p className="eyebrow">{a.role}</p>
            <h1>{a.name}</h1>
            <p className="author-bio">{a.bio}</p>
            <div className="author-stats"><span><b>{a.rankings.length || a.rankings}</b> rankings</span><span><b>{a.followers}</b> followers</span><span><b>{a.articles.length}</b> journal essays</span></div>
          </div>
        </Reveal>
      </section>
      <section className="wrap pad">
        <SectionHead eyebrow="Rankings by this editor" title={<>The {a.name.split(" ")[0]}<br /><i>archive.</i></>} />
        {a.rankings.length ? (
          <div className="listgrid">{a.rankings.map((r, i) => <Reveal key={r.slug} delay={i * 0.05}><RankCard r={r} i={i} /></Reveal>)}</div>
        ) : <p className="author-note">First ranking in progress — follow for the drop.</p>}
      </section>
      {a.articles.length > 0 && (
        <section className="articles">
          <div className="wrap pad-t pad-b">
            <SectionHead dark eyebrow="Journal" title={<>Long-form<br /><i>thinking.</i></>} />
            <div className="artgrid">{a.articles.map((x, i) => (
              <Reveal key={x.slug} delay={i * 0.06}>
                <article className="artcard"><img src={img(x.img, 800)} alt={x.title} /><p className="eyebrow">{x.cat} · {x.read} min</p><h3>{x.title}</h3><p className="artdek">{x.dek}</p><span className="artby">{x.date}</span></article>
              </Reveal>
            ))}</div>
          </div>
        </section>
      )}
      <Newsletter />
    </main>
  );
}

// ------------------------------------------------------------
// About
// ------------------------------------------------------------
export function AboutPage() {
  const { go } = getTop8();
  return (
    <main className="detail about">
      <section className="wrap abouthero">
        <Reveal><p className="eyebrow">Why eight?</p>
          <h1>The internet gives you<br />everything. We give you<br /><i>enough.</i></h1></Reveal>
      </section>
      <div className="aboutimg"><img src={img("sea", 1900)} alt="Italian coastline from above" /></div>
      <section className="wrap manifesto">
        <Reveal><span className="eyebrow">01 / Our belief</span><h2>Choice should feel<br />clarifying, not exhausting.</h2></Reveal>
        <Reveal className="manifesto-p" delay={0.1}>
          <p>TOP8 is an independent discovery platform built around a single constraint: only the exceptional makes the list.</p>
          <p>We research broadly, test carefully and edit decisively. No endless pages. No pay-to-play positions. Just eight considered recommendations and the context to choose well.</p>
          <button className="textlink" onClick={() => go?.("/explore")}>Browse the index <ArrowRight size={15} /></button>
        </Reveal>
      </section>
      <section className="method3 wrap pad-b">
        {[["Research broadly", "Every list begins with the full market — sixty candidates, no exceptions."],
        ["Test carefully", "Hands-on time under real conditions. Lab numbers, then lived experience."],
        ["Edit decisively", "Eight survivors. Signed verdicts. Re-tested quarterly, ranked honestly."]].map((x, i) => (
          <Reveal key={x[0]} delay={i * 0.08} className="method3-card"><span>0{i + 1}</span><h3>{x[0]}</h3><p>{x[1]}</p></Reveal>
        ))}
      </section>
      <section className="wrap faqsec">
        <Reveal><p className="eyebrow">Common questions</p><h2>How TOP8<br /><i>works.</i></h2></Reveal>
        <Accordion items={[
          { q: "Can brands pay to be ranked?", a: "Never. Rankings are decided by editors before brands are told they exist. Sponsored placements, when they exist at all, are labelled and never influence order." },
          { q: "Why eight, specifically?", a: "Eight is the largest number our editors can defend line by line. Beyond it, differences blur and the list stops being a decision." },
          { q: "How are scores calculated?", a: "Each category defines its own weighted criteria — quality, value, experience and longevity at minimum. Final scores are the editorial team's consensus, reviewed quarterly." },
          { q: "Is TOP8 hiring contributors?", a: "Occasionally, in fields where we lack depth. The bar is simple: you must be able to rank a field from memory before we let you rank it in public." },
        ]} />
      </section>
      <Newsletter />
    </main>
  );
}

// ------------------------------------------------------------
// 404
// ------------------------------------------------------------
export function NotFound() {
  const { go } = getTop8();
  return (
    <main className="page nf">
      <div className="nf-mark">8<span>0</span>8</div>
      <p className="eyebrow">Error 404</p>
      <h1>This page didn't<br /><i>make the cut.</i></h1>
      <p>Only the best eight make a TOP8 list — this URL finished ninth.</p>
      <div className="nf-actions">
        <button className="primary" onClick={() => go?.("/")}>Back home <ArrowRight size={15} /></button>
        <button className="textlink" onClick={() => go?.("/explore")}>Browse all rankings <ArrowRight size={15} /></button>
      </div>
      <div className="nf-links">
        <span>Popular right now</span>
        <div>{["/trending", "/category/ai-tools", "/ranking/best-beaches-world"].map((p) => (
          <button key={p} onClick={() => go?.(p)}>{p.replace("/", "").replaceAll("/", " / ")}</button>
        ))}</div>
      </div>
    </main>
  );
}
