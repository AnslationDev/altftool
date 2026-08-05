"use client";

// ============================================================
// TOP8 — App shell: router, header, search, saved state, footer
// (All TypeScript sources converted to plain JSX — no types)
// ============================================================
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Bookmark, ChevronDown, GitCompareArrows, Landmark, LayoutGrid, Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Flags, MonoTile, ScorePip, ease } from "./components";
import { allCategories, getRanking, img, k, loadSaved, persistSaved, rankingScore, searchAll } from "./data/service";
import Home from "./pages/Home";
import { CategoryPage, EditorsPicksPage, ExplorePage, LatestPage, TrendingPage } from "./pages/Listings";
import RankingDetail from "./pages/RankingDetail";
import { AboutPage, AuthorPage, BookmarksPage, CollectionDetailPage, CollectionsPage, ComparePage, CountriesPage, CountryDetailPage, NotFound, SearchPage } from "./pages/Misc";

// ---------- tiny history router ----------
function useRoute(initialPath = "/top8") {
  const [rawPath, setRawPath] = useState(() => {
    if (typeof window !== "undefined") {
      return location.pathname + location.search;
    }
    return initialPath;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRawPath(location.pathname + location.search);
    }
    const fn = () => setRawPath(location.pathname + location.search);
    window.addEventListener("popstate", fn);
    return () => window.removeEventListener("popstate", fn);
  }, []);

  const go = (p) => {
    if (typeof window === "undefined") return;
    let target = p;
    if (!target.startsWith("/top8")) {
      const cleanP = p.startsWith("/") ? p : `/${p}`;
      target = `/top8${cleanP === "/" ? "" : cleanP}`;
    }
    history.pushState({}, "", target);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  };

  return [rawPath, go];
}

// ---------- header ----------
const DARK_ROUTES = (p) =>
  p === "/" || p === "/explore" || p === "/trending" || p === "/latest" || p === "/editors-picks" ||
  p.startsWith("/ranking") || p.startsWith("/category") || p.startsWith("/country/") || p.startsWith("/collection/");

function Header({ route, go, openSearch }) {
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const cats = allCategories();
  const onDark = DARK_ROUTES(route) && !scrolled;
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    fn();
    addEventListener("scroll", fn, { passive: true });
    return () => removeEventListener("scroll", fn);
  }, []);
  useEffect(() => { setMega(false); setMobile(false); }, [route]);

  return (
    <header className={`header ${onDark ? "over" : "solid"}`}>
      <button className="brand" onClick={() => go("/")} aria-label="TOP8 home">TOP<b>8</b></button>

      <nav className="big-nav" aria-label="Main">
        <div className="nav-cats" onMouseLeave={() => setMega(false)}>
          <button className={`navbtn ${mega ? "on" : ""}`} onMouseEnter={() => setMega(true)} onClick={() => setMega(!mega)}>
            Categories <ChevronDown size={14} />
          </button>
          <AnimatePresence>
            {mega && (
              <motion.div className="megamenu" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25, ease }}>
                <div className="mm-grid">
                  {cats.map((c) => (
                    <button key={c.slug} className="mm-item" onClick={() => go(`/category/${c.slug}`)}>
                      <span className="mm-dot" style={{ background: c.accent }} />
                      <b>{c.name}</b><em>{c.count}</em>
                    </button>
                  ))}
                </div>
                <div className="mm-foot">
                  <button onClick={() => go("/trending")}><ArrowUpRight size={14} /> Trending</button>
                  <button onClick={() => go("/countries")}><Landmark size={14} /> Countries</button>
                  <button onClick={() => go("/compare")}><GitCompareArrows size={14} /> Compare</button>
                  <button onClick={() => go("/explore")}><LayoutGrid size={14} /> Full index</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button className="navbtn" onClick={() => go("/explore")}>Explore</button>
        <button className="navbtn" onClick={() => go("/trending")}>Trending</button>
        <button className="navbtn" onClick={() => go("/collections")}>Collections</button>
        <button className="navbtn" onClick={() => go("/countries")}>Countries</button>
      </nav>

      <div className="actions">
        <button className="searchpill" onClick={openSearch} aria-label="Search">
          <Search size={15} /><span>Search</span><kbd>⌘K</kbd>
        </button>
        <button className="navbtn hide-mob" onClick={() => go("/bookmarks")}><Bookmark size={15} /><span className="hide-sm">Saved</span></button>
        <button className="hamb" onClick={() => setMobile(!mobile)} aria-label="Menu">{mobile ? <X size={22} /> : <Menu size={22} />}</button>
      </div>

      <AnimatePresence>
        {mobile && (
          <motion.nav className="mobilenav" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {[["Explore all", "/explore"], ["Trending", "/trending"], ["Latest", "/latest"], ["Editor's picks", "/editors-picks"], ["Collections", "/collections"], ["Countries", "/countries"], ["Compare", "/compare"], ["About", "/about"]].map(([n, p]) => (
              <button key={p} onClick={() => go(p)}>{n}<ArrowRight size={16} /></button>
            ))}
            <p className="mnav-label">Categories</p>
            <div className="mnav-cats">{cats.slice(0, 8).map((c) => <button key={c.slug} onClick={() => go(`/category/${c.slug}`)}>{c.name}</button>)}</div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

// ---------- search overlay ----------
function SearchOverlay({ close, go }) {
  const [q, setQ] = useState("");
  const res = useMemo(() => searchAll(q), [q]);
  const submit = (e) => { e.preventDefault(); if (q.trim()) { close(); go(`/search?q=${encodeURIComponent(q.trim())}`); } };
  return (
    <motion.div className="searchbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Search TOP8">
      <div className="searchtop">
        <span className="brand">TOP<b>8</b></span>
        <button className="circlebtn-dark" onClick={close} aria-label="Close search"><X size={18} /></button>
      </div>
      <motion.form className="searchinner" onSubmit={submit} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease }}>
        <p className="eyebrow">Search the entire index</p>
        <div className="megasearch">
          <Search size={36} strokeWidth={1.4} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="What are you choosing?" aria-label="Search" />
          <small>ESC</small>
        </div>

        {!res && (
          <div className="suggest">
            <p>Popular right now</p>
            {["AI tools", "Beaches", "Smartphones", "Cities after dark", "Productivity apps"].map((x, i) => (
              <button type="button" key={x} onClick={() => { close(); go(`/search?q=${encodeURIComponent(x)}`); }}>
                <b>0{i + 1}</b><span>{x}</span><ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        )}

        {res && !res.empty && (
          <div className="sr-live">
            {res.rankings.length > 0 && (
              <div className="srl-group">
                <p>Rankings</p>
                {res.rankings.slice(0, 4).map((r) => (
                  <button type="button" key={r.slug} className="srl-rank" onClick={() => { close(); go(`/ranking/${r.slug}`); }}>
                    <MonoTile name={r.items[0].name} color={r.items[0].tile} size={40} />
                    <span className="srl-main"><b>{r.title}</b><em>Winner: {r.items[0].name} · {k(r.views)} readers</em></span>
                    <ScorePip score={rankingScore(r)} />
                  </button>
                ))}
              </div>
            )}
            {(res.categories.length > 0 || res.countries.length > 0 || res.collections.length > 0) && (
              <div className="srl-chips">
                {res.categories.map((c) => <button type="button" key={c.slug} onClick={() => { close(); go(`/category/${c.slug}`); }}>{c.name}</button>)}
                {res.countries.map((c) => <button type="button" key={c.slug} onClick={() => { close(); go(`/country/${c.slug}`); }}>{c.name}</button>)}
                {res.collections.map((c) => <button type="button" key={c.slug} onClick={() => { close(); go(`/collection/${c.slug}`); }}>{c.name}</button>)}
              </div>
            )}
            <button type="submit" className="srl-all">See all results for “{res.q}” <ArrowRight size={15} /></button>
          </div>
        )}
        {res?.empty && <p className="srl-none">No matches for “{res.q}” — try “travel”, “pixel”, “crm”…</p>}
      </motion.form>
    </motion.div>
  );
}

// ---------- footer ----------
function Footer({ go }) {
  const cats = allCategories();
  return (
    <footer>
      <div className="foottop">
        <button className="footlogo" onClick={() => go("/")}>TOP<i>8</i></button>
        <p>Find less.<br />Choose better.</p>
      </div>
      <div className="footlinks">
        <div><b>Popular</b>
          {cats.slice(0, 5).map((c) => <button key={c.slug} onClick={() => go(`/category/${c.slug}`)}>{c.name}</button>)}
        </div>
        <div><b>Discover</b>
          <button onClick={() => go("/trending")}>Trending</button>
          <button onClick={() => go("/latest")}>Latest rankings</button>
          <button onClick={() => go("/editors-picks")}>Editor's picks</button>
          <button onClick={() => go("/collections")}>Collections</button>
          <button onClick={() => go("/countries")}>Countries</button>
        </div>
        <div><b>Tools</b>
          <button onClick={() => go("/compare")}>Compare rankings</button>
          <button onClick={() => go("/bookmarks")}>Saved rankings</button>
          <button onClick={() => go("/explore")}>Full index</button>
        </div>
        <div><b>TOP8</b>
          <button onClick={() => go("/about")}>About</button>
          <button onClick={() => go("/author/maya-chen")}>Creators</button>
          <button onClick={() => go("/about")}>Editorial policy</button>
        </div>
      </div>
      <div className="footbottom">
        <span>© 2025 TOP8 Editorial</span>
        <span>Independent rankings — never pay-to-play.</span>
        <span>Privacy · Terms</span>
      </div>
    </footer>
  );
}

// ---------- app ----------
export default function App({ initialPath = "/top8" }) {
  const [rawPath, go] = useRoute(initialPath);
  const [search, setSearch] = useState(false);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    setSaved(loadSaved());
  }, []);

  const toggleSaved = (slug) => {
    setSaved((prev) => {
      const next = prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug];
      persistSaved(next);
      return next;
    });
  };

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") setSearch(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); }
      if (e.key === "/" && !search && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) { e.preventDefault(); setSearch(true); }
    };
    addEventListener("keydown", fn);
    return () => removeEventListener("keydown", fn);
  }, [search]);

  // shared context for all pages/components (frontend-only mock "store")
  if (typeof window !== "undefined") {
    window.__top8 = { go, openSearch: () => setSearch(true), saved, toggleSaved };
  }

  // Parse path relative to /top8
  let fullPath = rawPath;
  if (!fullPath.startsWith("/")) fullPath = "/" + fullPath;
  let relativePath = fullPath;
  if (relativePath.startsWith("/top8")) {
    relativePath = relativePath.slice(5);
  }
  if (!relativePath || relativePath === "") relativePath = "/";

  let pathname = relativePath;
  let searchStr = "";
  if (relativePath.includes("?")) {
    const parts = relativePath.split("?");
    pathname = parts[0] || "/";
    searchStr = parts[1] || "";
  }
  const qs = new URLSearchParams(searchStr);

  let page;
  if (pathname === "/") page = <Home />;
  else if (pathname === "/explore") page = <ExplorePage />;
  else if (pathname === "/trending") page = <TrendingPage />;
  else if (pathname === "/latest") page = <LatestPage />;
  else if (pathname === "/editors-picks") page = <EditorsPicksPage />;
  else if (pathname.startsWith("/category/")) page = <CategoryPage key={pathname} slug={pathname.split("/")[2]} />;
  else if (pathname.startsWith("/ranking/")) page = <RankingDetail key={pathname} slug={pathname.split("/")[2]} />;
  else if (pathname === "/search") page = <SearchPage key={qs.get("q") || ""} query={qs.get("q") || ""} />;
  else if (pathname === "/compare") page = <ComparePage />;
  else if (pathname === "/countries") page = <CountriesPage />;
  else if (pathname.startsWith("/country/")) page = <CountryDetailPage key={pathname} slug={pathname.split("/")[2]} />;
  else if (pathname === "/collections") page = <CollectionsPage />;
  else if (pathname.startsWith("/collection/")) page = <CollectionDetailPage key={pathname} slug={pathname.split("/")[2]} />;
  else if (pathname === "/bookmarks") page = <BookmarksPage />;
  else if (pathname.startsWith("/author/")) page = <AuthorPage key={pathname} slug={pathname.split("/")[2]} />;
  else if (pathname === "/about") page = <AboutPage />;
  else page = <NotFound />;

  return (
    <div className="top8-root">
      <Header route={pathname} go={go} openSearch={() => setSearch(true)} />
      <AnimatePresence mode="wait">
        <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }}>
          {page}
        </motion.div>
      </AnimatePresence>
      <Footer go={go} />
      <AnimatePresence>{search && <SearchOverlay close={() => setSearch(false)} go={go} />}</AnimatePresence>
    </div>
  );
}
