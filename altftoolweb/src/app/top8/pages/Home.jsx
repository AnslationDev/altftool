// ============================================================
// TOP8 — Homepage
// ============================================================
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Bookmark, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Avatar, CountUp, FeatureStrip, Marquee, Newsletter, RankCard, Reveal, RowCard, ScorePip, SectionHead, ease } from "../components";
import { POPULAR_SEARCHES, STATS, TRENDING_TAGS } from "../data/content";
import { allCategories, allCollections, authorName, getEditorsPicks, getLatest, getMostSaved, getPopular, getRanking, getTrending, img, k, latestArticles, rankingScore } from "../data/service";

const getTop8 = () => (typeof window !== "undefined" ? window.__top8 : null) || {};

function Hero() {
  const { go, openSearch } = getTop8();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 130]);
  const markY = useTransform(scrollY, [0, 700], [0, -60]);

  // Typewriter effect
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [isDone, setIsDone] = useState(false);
  const fullText1 = "Less searching.";
  const fullText2 = "Better choosing.";

  useEffect(() => {
    let active = true;

    const run = async () => {
      while (active) {
        setIsDone(false);
        setText1("");
        setText2("");

        // Type line 1
        for (let i = 0; i <= fullText1.length; i++) {
          if (!active) return;
          setText1(fullText1.slice(0, i));
          await new Promise((resolve) => setTimeout(resolve, 80));
        }

        // Pause between lines
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Type line 2
        for (let i = 0; i <= fullText2.length; i++) {
          if (!active) return;
          setText2(fullText2.slice(0, i));
          await new Promise((resolve) => setTimeout(resolve, 80));
        }

        setIsDone(true);

        // Pause before restarting the loop
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="hero">
      <motion.img style={{ y }} src={img("coast", 2000)} alt="Positano rising above the Mediterranean" />
      <div className="shade" />
      <div className="heroin">
        <motion.div className="heromark" style={{ y: markY }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1 }}>
          TOP<span>8</span>
        </motion.div>
        <motion.div className="herocopy" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.9, ease }}>
          <p>The definitive shortlist · {STATS[0].value.toLocaleString()} rankings</p>
          <h1>
            <span style={{ minHeight: "1.2em", display: "inline-block" }}>{text1 || "\u00A0"}</span>
            <br />
            <span style={{ minHeight: "1.2em", display: "inline-block" }}>
              <i>{text2}</i>
              {!isDone && <span className="cursor">|</span>}
            </span>
          </h1>
          <div>
            <span>Independent rankings for curious people. Researched deeply, edited carefully, limited to eight.</span>
            <button onClick={openSearch}>Search everything <Search size={17} /></button>
          </div>
        </motion.div>
      </div>
      <div className="scrollcue"><span /> Scroll</div>
    </section>
  );
}

// ---------- trending trio (editorial mixed layout) ----------
function Trending({ list }) {
  return (
    <section className="wrap pad">
      <SectionHead eyebrow="Trending now" title={<>Worth your<br /><i>attention.</i></>}
        side={<button className="textlink" onClick={() => getTop8().go("/trending")}>All trending <ArrowRight size={15} /></button>} />
      <div className="trio">
        <Reveal><RankCard r={list[0]} i={0} tall /></Reveal>
        <div className="trio-side">
          <Reveal delay={0.08}><RankCard r={list[1]} i={1} /></Reveal>
          <Reveal delay={0.16}><RankCard r={list[2]} i={2} /></Reveal>
        </div>
      </div>
    </section>
  );
}

// ---------- marquee + popular searches ----------
function Discovery() {
  const { go } = getTop8();
  return (
    <section className="discovery">
      <Marquee items={TRENDING_TAGS} onPick={(t) => go?.(`/search?q=${encodeURIComponent(t)}`)} />
      <div className="wrap popular-searches">
        <Reveal className="ps-head"><p className="eyebrow">Popular searches</p></Reveal>
        <div className="ps-grid">
          {POPULAR_SEARCHES.map((s, i) => (
            <Reveal key={s} delay={i * 0.05}>
              <button onClick={() => go?.(`/search?q=${encodeURIComponent(s)}`)}>
                <span>0{i + 1}</span>{s}<ArrowUpRight size={15} />
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- categories (dark index) ----------
function Categories() {
  const cats = allCategories();
  const { go } = getTop8();
  return (
    <section className="cats-dark">
      <div className="wrap">
        <SectionHead dark eyebrow="Go anywhere" title={<>Follow your<br />curiosity.</>}
          side={<p className="cats-note">16 categories. 96 subcategories.<br />Every list exactly eight deep.</p>} />
        <div className="catindex">
          {cats.map((c, i) => (
            <motion.button key={c.slug} whileHover={{ x: 10 }} transition={ease} onClick={() => go?.(`/category/${c.slug}`)}>
              <span className="ci-no">{String(i + 1).padStart(2, "0")}</span>
              <b>{c.name}</b>
              <em>{c.count} rankings</em>
              <ArrowRight size={18} />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- interactive explorer ----------
function Explorer() {
  const cats = allCategories();
  const [active, setActive] = useState(cats[0].slug);
  const { go } = getTop8();
  const cat = cats.find((c) => c.slug === active);
  const ranks = useMemo(() => getPopular(20).filter((r) => r.cat === active).slice(0, 2), [active]);
  return (
    <section className="wrap pad">
      <SectionHead eyebrow="Interactive explorer" title={<>Pick a lane.<br /><i>We will drive.</i></>} />
      <div className="explorer">
        <div className="exp-cats">
          {cats.map((c) => (
            <button key={c.slug} className={active === c.slug ? "on" : ""} onClick={() => setActive(c.slug)}>
              {c.name}<ArrowRight size={14} />
            </button>
          ))}
        </div>
        <motion.div key={active} className="exp-panel" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
          <div className="exp-hero">
            <img src={img(cat.img, 1200)} alt={cat.name} />
            <div className="exp-hero-copy">
              <p className="eyebrow">{cat.tagline}</p>
              <h3>{cat.name}</h3>
              <span>{cat.count} rankings · {cat.subs.length} subcategories</span>
              <button className="primary light" onClick={() => go?.(`/category/${cat.slug}`)}>Explore {cat.name} <ArrowRight size={15} /></button>
            </div>
          </div>
          <div className="exp-ranks">
            {ranks.map((r, i) => <RowCard key={r.slug} r={r} i={i} />)}
            {cat.subs.slice(0, 4).map((s) => (
              <button key={s.slug} className="exp-sub" onClick={() => go?.(`/category/${cat.slug}?sub=${s.slug}`)}>
                <b>{s.name}</b><span>{s.count} rankings</span><ArrowUpRight size={14} />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------- editor's picks (mixed strips) ----------
function EditorsPicks({ picks }) {
  return (
    <section className="wrap pad">
      <SectionHead eyebrow="Editor's picks" title={<>Chosen, not<br /><i>crowd-sourced.</i></>}
        side={<button className="textlink" onClick={() => getTop8().go("/editors-picks")}>All picks <ArrowRight size={15} /></button>} />
      <div className="picks">
        {picks.map((r, i) => <Reveal key={r.slug} delay={i * 0.06}><FeatureStrip r={r} flip={i % 2 === 1} /></Reveal>)}
      </div>
    </section>
  );
}

// ---------- collections ----------
function Collections() {
  const cols = allCollections();
  const { go } = getTop8();
  return (
    <section className="wrap pad collections-home">
      <SectionHead eyebrow="Featured collections" title={<>Start with a<br /><i>point of view.</i></>}
        side={<button className="textlink" onClick={() => go?.("/collections")}>All collections <ArrowRight size={15} /></button>} />
      <div className="colgrid">
        {cols.slice(0, 3).map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.07}>
            <article className="colcard" onClick={() => go?.(`/collection/${c.slug}`)} tabIndex={0}>
              <div className="colcard-img"><img src={img(c.img, 900)} alt={c.name} loading="lazy" /><span style={{ background: c.tone }}>{c.resolved.length} rankings</span></div>
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
              <div className="colcard-thumbs">
                {c.resolved.map((r) => <img key={r.slug} src={img(r.hero, 200)} alt="" />)}
                <b><ArrowRight size={15} /></b>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ---------- recently added + most popular tabbed lists ----------
function LatestVsPopular() {
  const [tab, setTab] = useState("latest");
  const { go } = getTop8();
  const list = tab === "latest" ? getLatest(6) : getPopular(6);
  return (
    <section className="splitsec">
      <div className="wrap">
        <div className="split">
          <Reveal className="split-left">
            <p className="eyebrow">Fresh vs famous</p>
            <h2>Recently<br />added, or<br /><i>most loved.</i></h2>
            <div className="tabs" role="tablist">
              <button role="tab" aria-selected={tab === "latest"} className={tab === "latest" ? "on" : ""} onClick={() => setTab("latest")}>Recently added</button>
              <button role="tab" aria-selected={tab === "popular"} className={tab === "popular" ? "on" : ""} onClick={() => setTab("popular")}>Most popular</button>
            </div>
            <button className="textlink" onClick={() => go?.(tab === "latest" ? "/latest" : "/explore")}>See the full list <ArrowRight size={15} /></button>
          </Reveal>
          <div className="split-right">
            {list.map((r, i) => <RowCard key={tab + r.slug} r={r} i={i} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- community favourites (most saved) ----------
function Community() {
  const favs = getMostSaved(3);
  return (
    <section className="wrap pad">
      <SectionHead eyebrow="Community favourites" title={<>What readers<br /><i>keep coming back to.</i></>} />
      <div className="favgrid">
        {favs.map((r, i) => (
          <Reveal key={r.slug} delay={i * 0.08} className="favwrap">
            <div className="favsaves"><Bookmark size={14} fill="currentColor" /><CountUp value={r.saves} /> saves</div>
            <RankCard r={r} i={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ---------- top creators ----------
function Creators() {
  const { go } = getTop8();
  const slugs = ["maya-chen", "james-okafor", "elena-rodriguez", "david-kim"];
  return (
    <section className="wrap pad creators">
      <SectionHead eyebrow="Top creators" title={<>The people<br /><i>behind the lists.</i></>} />
      <div className="creatorgrid">
        {slugs.map((s, i) => {
          const a = authorName(s);
          return (
            <Reveal key={s} delay={i * 0.06}>
              <article className="creatorcard" onClick={() => go?.(`/author/${s}`)} tabIndex={0}>
                <Avatar author={a} size={64} />
                <h3>{a.name}</h3>
                <p>{a.role}</p>
                <div><span>{a.rankings} rankings</span><span>{a.followers} followers</span></div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ---------- latest articles ----------
function Articles() {
  return (
    <section className="articles">
      <div className="wrap pad-t">
        <SectionHead dark eyebrow="From the journal" title={<>Latest<br /><i>thinking.</i></>}
          side={<button className="textlink light" onClick={() => getTop8().go("/about")}>About the journal <ArrowRight size={15} /></button>} />
        <div className="artgrid">
          {latestArticles(3).map((a, i) => (
            <Reveal key={a.slug} delay={i * 0.07}>
              <article className="artcard">
                <img src={img(a.img, 800)} alt={a.title} loading="lazy" />
                <p className="eyebrow">{a.cat} · {a.read} min</p>
                <h3>{a.title}</h3>
                <p className="artdek">{a.dek}</p>
                <span className="artby">{authorName(a.author)?.name} — {a.date}</span>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- stats ----------
function Stats() {
  return (
    <section className="stats">
      <div className="wrap statsgrid">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06} className="stat">
            <b><CountUp value={s.value} suffix={s.suffix} decimals={s.decimals || 0} /></b>
            <span>{s.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ---------- CTA banner ----------
function CTABanner() {
  const { go } = getTop8();
  const r = getRanking("best-ai-tools-2025");
  return (
    <section className="wrap">
      <Reveal className="cta">
        <img src={img("ai2", 1600)} alt="" />
        <div className="cta-copy">
          <p className="eyebrow">Ranking of the week</p>
          <h2>{r.title}</h2>
          <p>{r.excerpt}</p>
          <div className="cta-row">
            <button className="primary" onClick={() => go?.(`/ranking/${r.slug}`)}>Read the ranking <ArrowRight size={15} /></button>
            <ScorePip score={rankingScore(r)} big />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Trending list={getTrending(3)} />
      <Discovery />
      <Categories />
      <EditorsPicks picks={getEditorsPicks(3)} />
      <Explorer />
      <Collections />
      <LatestVsPopular />
      <Community />
      <CTABanner />
      <Creators />
      <Articles />
      <Stats />
      <Newsletter />
    </>
  );
}
