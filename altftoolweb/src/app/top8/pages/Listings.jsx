// ============================================================
// TOP8 — Listing pages: Explore, Category, Trending, Latest,
// Editor's Picks (all driven by the mock data service)
// ============================================================
import { ArrowRight, ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Chips, Empty, Crumb, FeatureStrip, Newsletter, Pagination, RankCard, Reveal, SectionHead, RowCard } from "../components";
import { SORTS, allCategories, allCollections, allRankings, getCategory, getEditorsPicks, getLatest, getTrending, img, rankingsByCategory, sortRankings } from "../data/service";

const PAGE_SIZE = 6;

const getTop8 = () => (typeof window !== "undefined" ? window.__top8 : null) || {};

// ---------- shared shell ----------
function ListingShell({ crumb, eyebrow, title, sub, heroImg, meta, list, showSort = true, heroTall = true, childrenBefore }) {
  const [sort, setSort] = useState("popular");
  const [layout, setLayout] = useState("grid");
  const [page, setPage] = useState(1);
  const sorted = useMemo(() => sortRankings(list, sort), [list, sort]);
  const pages = Math.ceil(sorted.length / PAGE_SIZE);
  const visible = sorted.slice(0, page * PAGE_SIZE);

  return (
    <main className="page">
      <section className={`listhero ${heroTall ? "tall" : ""}`}>
        <img src={img(heroImg, 1900)} alt="" />
        <div className="listhero-shade" />
        <div className="listhero-copy">
          <Crumb trail={crumb} />
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="listhero-sub">{sub}</p>
            {meta && <div className="listhero-meta">{meta}</div>}
          </div>
        </div>
      </section>

      <div className="listbar-wrap">
        <div className={`listbar ${layout}`} data-x="">
          <div className="listbar-inner wrap">
            {childrenBefore}
            {showSort && (
              <div className="sortwrap">
                <span>{sorted.length} rankings</span>
                <div className="sortsel">
                  <SlidersHorizontal size={14} />
                  <select aria-label="Sort rankings" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                    {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <ChevronDown size={13} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="wrap listbody">
        {visible.length === 0 ? (
          <Empty icon={<Search size={44} strokeWidth={1} />} title="Nothing here yet"
            body="Try a different filter — or explore the rest of TOP8 while we finish this one."
            action="Browse everything" onAction={() => getTop8().go("/explore")} />
        ) : (
          <div className="listgrid">
            {visible.map((r, i) => (
              <Reveal key={r.slug} delay={(i % 2) * 0.06}>
                <RankCard r={r} i={i} />
              </Reveal>
            ))}
          </div>
        )}
        {page < pages && (
          <div className="loadmore">
            <button className="primary ghost-btn" onClick={() => setPage(page + 1)}>Load more rankings <ArrowRight size={15} /></button>
            <Pagination page={page} pages={pages} onPage={setPage} />
          </div>
        )}
      </section>
    </main>
  );
}

// ---------- explore ----------
export function ExplorePage() {
  return (
    <>
      <ListingShell
        crumb={[{ label: "Home", path: "/" }, { label: "Explore" }]}
        eyebrow="The TOP8 index" title={<>Every ranking.<br /><i>One index.</i></>}
        sub={`${allRankings().length} rankings across every category — sorted however you like them.`}
        heroImg="amalfi" list={allRankings()}
      />
      <CollectionsAside />
      <Newsletter />
    </>
  );
}

// ---------- category ----------
export function CategoryPage({ slug }) {
  const cat = getCategory(slug);
  const [sub, setSub] = useState("all");
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    let l = rankingsByCategory(slug);
    if (sub !== "all") l = l.filter((r) => r.sub === sub);
    if (q.trim()) l = l.filter((r) => (r.title + r.items.map((i) => i.name).join(" ")).toLowerCase().includes(q.toLowerCase()));
    return l;
  }, [slug, sub, q]);

  if (!cat) return <ExplorePage />;
  const featured = rankingsByCategory(slug)[0];
  const chips = [{ id: "all", label: "All" }, ...cat.subs.map((s) => ({ id: s.slug, label: s.name }))];
  const cols = allCollections().filter((c) => c.resolved.some((r) => r.cat === slug));

  return (
    <main className="page">
      <ListingShell
        crumb={[{ label: "Home", path: "/" }, { label: "Explore", path: "/explore" }, { label: cat.name }]}
        eyebrow={cat.tagline} title={<>{cat.name},<br /><i>ranked honestly.</i></>}
        sub={cat.desc} heroImg={cat.img} list={list}
        meta={<><b>{cat.count}</b> rankings · <b>{cat.subs.length}</b> subcategories · updated weekly</>}
        childrenBefore={
          <div className="catfilter">
            <Chips options={chips} value={sub} onChange={setSub} />
            <div className="catsearch"><Search size={15} /><input aria-label={`Search ${cat.name}`} value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${cat.name.toLowerCase()}…`} /></div>
          </div>
        }
      />

      {featured && (
        <section className="wrap pad-t-sm">
          <SectionHead eyebrow="Category spotlight" title={<>Start<br /><i>here.</i></>} />
          <FeatureStrip r={featured} />
        </section>
      )}

      <section className="wrap pad">
        <SectionHead eyebrow="Subcategories" title={<>Go one<br /><i>level deeper.</i></>} />
        <div className="subgrid">
          {cat.subs.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.05}>
              <button className={`subcard ${sub === s.slug ? "on" : ""}`} style={{ "--acc": cat.accent }} onClick={() => { setSub(sub === s.slug ? "all" : s.slug); window.scrollTo({ top: document.querySelector(".listbar")?.offsetTop - 20 || 0, behavior: "smooth" }); }}>
                <b>{s.name}</b>
                <span>{s.count} rankings</span>
                <ArrowRight size={16} />
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {cols.length > 0 && (
        <section className="wrap pad">
          <SectionHead eyebrow="Collections" title={<> Curated from<br /><i>this category.</i></>} />
          <div className="colcards-row">
            {cols.map((c) => (
              <Reveal key={c.slug}>
                <article className="colcard" onClick={() => getTop8().go(`/collection/${c.slug}`)}>
                  <div className="colcard-img"><img src={img(c.img, 800)} alt={c.name} loading="lazy" /><span style={{ background: c.tone }}>{c.resolved.length} rankings</span></div>
                  <h3>{c.name}</h3><p>{c.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <ExploreMore current={slug} />
      <Newsletter />
    </main>
  );
}

function ExploreMore({ current }) {
  const cats = allCategories().filter((c) => c.slug !== current).slice(0, 5);
  const { go } = getTop8();
  return (
    <section className="exploremore">
      <div className="wrap">
        <p className="eyebrow">Explore more</p>
        <div className="em-list">
          {cats.map((c) => (
            <button key={c.slug} onClick={() => go?.(`/category/${c.slug}`)}>
              <img src={img(c.img, 400)} alt="" /><b>{c.name}</b><ArrowUpRightIcon />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
const ArrowUpRightIcon = () => <ArrowRight size={16} style={{ transform: "rotate(-45deg)" }} />;

function CollectionsAside() {
  const { go } = getTop8();
  return (
    <section className="wrap pad">
      <SectionHead eyebrow="Collections" title={<>Prefer a<br /><i>guided tour?</i></>} />
      <div className="colcards-row">
        {allCollections().slice(0, 3).map((c) => (
          <Reveal key={c.slug}>
            <article className="colcard" onClick={() => go?.(`/collection/${c.slug}`)}>
              <div className="colcard-img"><img src={img(c.img, 800)} alt={c.name} loading="lazy" /><span style={{ background: c.tone }}>{c.resolved.length} rankings</span></div>
              <h3>{c.name}</h3><p>{c.desc}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ---------- trending ----------
export function TrendingPage() {
  const list = getTrending(12);
  return (
    <>
      <ListingShell
        crumb={[{ label: "Home", path: "/" }, { label: "Trending" }]}
        eyebrow="What's rising now" title={<>The internet's<br /><i>current obsession.</i></>}
        sub="Ranked by saves, shares and second visits — refreshed every day."
        heroImg="tokyo" list={list}
      />
      <Newsletter />
    </>
  );
};

// ---------- latest ----------
export function LatestPage() {
  const list = getLatest(12);
  return (
    <>
      <ListingShell
        crumb={[{ label: "Home", path: "/" }, { label: "Latest" }]}
        eyebrow="Just published" title={<>Fresh out of<br /><i>the lab.</i></>}
        sub="New tests, new winners — the most recent rankings from our editors."
        heroImg="desk" list={list}
      />
      <Newsletter />
    </>
  );
}

// ---------- editor's picks ----------
export function EditorsPicksPage() {
  const picks = getEditorsPicks(8);
  const { go } = getTop8();
  return (
    <main className="page">
      <ListingShell
        crumb={[{ label: "Home", path: "/" }, { label: "Editor's picks" }]}
        eyebrow="Editor's picks" title={<>Chosen, not<br /><i>crowd-sourced.</i></>}
        sub="The rankings our editors defend at dinner parties."
        heroImg="cinema" list={picks} showSort={false}
      />
      <section className="wrap pad-t-sm">
        <SectionHead eyebrow="Why these?" title={<>The defence<br /><i>case.</i></>} />
        <div className="rowlist">
          {picks.slice(0, 4).map((r, i) => <RowCard key={r.slug} r={r} i={i} />)}
        </div>
      </section>
      <Newsletter />
    </main>
  );
}
