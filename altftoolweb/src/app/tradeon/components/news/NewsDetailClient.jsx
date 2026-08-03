// src/app/tradeon/components/news/NewsDetailClient.jsx
// News detail page — hero image, category, source, publish date/time, the full
// available article text, a link to the original source, and a right rail with
// live Top Gainers / Top Losers, Share Price & Analysis, Predictions and Related
// news. Wide article column + narrow sidebar. Theme-aware via Tradeon tokens.
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Clock, ExternalLink, Flame, Link2, Share2, Snowflake } from "lucide-react";
import { useMarketData } from "../../hooks/useMarketData";
import { categoryLabel } from "../../lib/news";
import { assetHref, formatPct } from "../../lib/format";
import { outlookSlug } from "../../lib/slug";
import LiveValue from "../shared/LiveValue";
import TradeonHeader from "../landing/TradeonHeader";
import TradeonFooter from "../landing/TradeonFooter";
import NewsCard, { CAT_COLOR, NewsThumb, timeAgo } from "./NewsCard";
import DOMPurify from "dompurify";

// Client-side sanitiser for the extracted article HTML (defense-in-depth — the
// server already reduced it to a safe tag/attribute set).
const SANITIZE = {
  ALLOWED_TAGS: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "table", "thead", "tbody", "tr", "th", "td", "figure", "figcaption", "img", "strong", "em", "b", "i", "u", "a", "br", "hr", "pre", "code", "span", "sub", "sup"],
  ALLOWED_ATTR: ["href", "src", "alt", "target", "rel", "loading"],
};
function cleanHtml(html) {
  if (typeof window === "undefined" || !html) return "";
  try { return DOMPurify.sanitize(html, SANITIZE); } catch { return ""; }
}

// Popular stocks for the sidebar widgets — present in both the outlook and
// market-data universes, so the Share Price (outlook) and Prediction (asset) links
// both resolve.
const STOCKS = [
  { symbol: "HDFCBANK", name: "HDFC Bank" },
  { symbol: "ICICIBANK", name: "ICICI Bank" },
  { symbol: "SBIN", name: "State Bank of India" },
  { symbol: "TCS", name: "Tata Consultancy Services" },
  { symbol: "INFY", name: "Infosys" },
  { symbol: "HCLTECH", name: "HCL Technologies" },
  { symbol: "ITC", name: "ITC" },
  { symbol: "WIPRO", name: "Wipro" },
];

function fmtDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

/* Brand social glyphs (single-path official marks) — rendered white on the
   platform's brand colour so the share row is icon-only and instantly recognisable. */
const XIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);
const WhatsAppIcon = ({ size = 17 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
);
const TelegramIcon = ({ size = 17 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
);
const LinkedInIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>
);

// Shared style for the round, colour-filled share buttons (icon only).
const SHARE_BTN = "grid place-items-center w-9 h-9 rounded-full text-white shrink-0 transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none";
const SHARE_RING = { boxShadow: "0 0 0 1px color-mix(in srgb, var(--tdn-fg) 12%, transparent), 0 2px 6px color-mix(in srgb, var(--tdn-fg) 10%, transparent)" };

// Compact, clickable mover row for the right rail → opens the asset detail page.
function MoverRow({ d }) {
  const up = (d.changePct || 0) >= 0;
  return (
    <Link href={assetHref(d.symbol)} className="group flex items-center gap-2 py-1.5 px-1.5 -mx-1.5 rounded-md transition-colors hover:bg-[color-mix(in_srgb,var(--tdn-iris)_6%,transparent)]">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold truncate transition-colors group-hover:text-[var(--tdn-iris-2)]" style={{ color: "var(--tdn-fg-strong)" }}>{d.symbol}</div>
        <div className="text-[0.6rem] truncate" style={{ color: "var(--tdn-faint)" }}>{d.name}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="tdn-mono text-[0.7rem] font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
          <LiveValue value={d.price} currency={d.assetClass === "forex" ? "" : "$"} />
        </div>
        <div className={`tdn-mono text-[0.62rem] font-semibold ${up ? "tdn-up" : "tdn-down"}`}>{formatPct(d.changePct)}</div>
      </div>
    </Link>
  );
}

// Right-rail panel of movers, with a coloured icon underline and skeletons while
// the live market data is still connecting.
function MoversPanel({ title, icon: Icon, color, rows }) {
  return (
    <section>
      <h2 className="text-base font-bold pb-2 mb-3 inline-flex items-center gap-1.5" style={{ color: "var(--tdn-fg-strong)", borderBottom: `2px solid ${color}` }}>
        <Icon size={15} style={{ color }} /> {title}
      </h2>
      <div className="flex flex-col">
        {rows.length
          ? rows.map((d) => <MoverRow key={d.symbol} d={d} />)
          : Array.from({ length: 5 }).map((_, i) => <div key={i} className="tdn-skeleton rounded-md h-8 my-1" />)}
      </div>
    </section>
  );
}

export default function NewsDetailClient() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { data, status } = useMarketData();
  const [state, setState] = useState({ article: null, related: [], loading: true });
  const [now, setNow] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { setNow(Date.now()); if (typeof window !== "undefined") setShareUrl(window.location.href); }, []);

  useEffect(() => {
    let cancel = false;
    setState((s) => ({ ...s, loading: true }));
    fetch(`/tradeon/api/news?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => { if (!cancel) setState({ article: j.article || null, related: j.related || [], loading: false }); })
      .catch(() => { if (!cancel) setState({ article: null, related: [], loading: false }); });
    return () => { cancel = true; };
  }, [slug]);

  const { article, related, loading } = state;
  const color = article ? CAT_COLOR[article.category] || "#0d9488" : "#0d9488";

  // Live top gainers / losers among equities for the right rail.
  const movers = useMemo(() => {
    const stocks = (Array.isArray(data) ? data : []).filter((d) => d && d.assetClass === "stocks" && typeof d.changePct === "number");
    const byChange = [...stocks].sort((a, b) => b.changePct - a.changePct);
    return { gainers: byChange.slice(0, 5), losers: byChange.slice(-5).reverse() };
  }, [data]);

  const shareText = article?.title || "Market news";
  const enc = encodeURIComponent;
  const socials = shareUrl
    ? [
        { label: "X", color: "#000000", Icon: XIcon, href: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}` },
        { label: "WhatsApp", color: "#25D366", Icon: WhatsAppIcon, href: `https://wa.me/?text=${enc(`${shareText} ${shareUrl}`)}` },
        { label: "Telegram", color: "#229ED9", Icon: TelegramIcon, href: `https://t.me/share/url?url=${enc(shareUrl)}&text=${enc(shareText)}` },
        { label: "LinkedIn", color: "#0A66C2", Icon: LinkedInIcon, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}` },
      ]
    : [];

  const doNativeShare = () => {
    if (navigator.share) navigator.share({ title: shareText, url: shareUrl }).catch(() => {});
  };
  const copyLink = () => {
    if (navigator.clipboard && shareUrl) navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }).catch(() => {});
  };

  return (
    <div className="tradeon-root min-h-screen flex flex-col">
      <TradeonHeader data={data} status={status} />

      {/* Content area only — theme-aware surface (tdn-paper: white in light, dark in dark); header/footer keep the app theme */}
      <main className="tdn-paper flex-1 w-full">
        <div className="tdn-container tdn-section-tight">
          <Link href="/tradeon/news" className="group inline-flex items-center gap-1.5 text-xs font-semibold mb-5 transition-colors hover:text-[var(--tdn-iris)]" style={{ color: "var(--tdn-iris-2)" }}>
            <ArrowLeft size={14} className="shrink-0 transition-transform group-hover:-translate-x-0.5" />
            All news
          </Link>

          {loading ? (
            <div className="space-y-4">
              <div className="tdn-skeleton rounded-xl w-2/3 h-8" />
              <div className="tdn-skeleton rounded-2xl w-full" style={{ aspectRatio: "16 / 7" }} />
            </div>
          ) : !article ? (
            <div className="text-center py-20 rounded-xl" style={{ border: "1px dashed var(--tdn-border)" }}>
              <p className="text-sm" style={{ color: "var(--tdn-muted)" }}>This article is no longer in the live feed.</p>
              <Link href="/tradeon/news" className="text-xs font-semibold mt-2 inline-block hover:underline" style={{ color: "var(--tdn-iris)" }}>Back to News</Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-x-12 gap-y-8">
              {/* Article — wide main column */}
              <article className="lg:col-span-9 min-w-0">
                <div className="mb-3">
                  <span className="inline-flex items-center text-[0.66rem] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-md" style={{ color, background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                    {categoryLabel(article.category)}
                  </span>
                </div>
                <h1 className="tdn-display text-2xl sm:text-[1.9rem] leading-tight font-extrabold" style={{ color: "var(--tdn-fg-strong)" }}>{article.title}</h1>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs" style={{ color: "var(--tdn-faint)" }}>
                  <span className="font-semibold" style={{ color: "var(--tdn-muted)" }}>{article.source}</span>
                  <span className="inline-flex items-center gap-1"><Clock size={12} /> {fmtDateTime(article.publishedAt)}</span>
                  <span>· {timeAgo(article.publishedAt, now)}</span>
                </div>

                <div className="relative overflow-hidden rounded-2xl mt-5" style={{ aspectRatio: "16 / 8", border: "1px solid var(--tdn-border)" }}>
                  <NewsThumb src={article.image} color={color} alt={article.title} className="w-full h-full" />
                </div>

                {article.contentHtml ? (
                  <div className="tdn-article mt-6" dangerouslySetInnerHTML={{ __html: cleanHtml(article.contentHtml) }} />
                ) : (article.content || article.summary) ? (
                  <div className="tdn-article mt-6">
                    {(article.content || article.summary).split(/\n+/).map((p) => p.trim()).filter(Boolean).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[0.98rem] leading-relaxed mt-6" style={{ color: "var(--tdn-fg)" }}>Open the original article for the full story.</p>
                )}

                <a href={article.url} target="_blank" rel="noopener noreferrer" className="tdn-btn tdn-btn-primary mt-6 inline-flex items-center gap-2">
                  Read full article at {article.source} <ExternalLink size={15} />
                </a>

                {/* Share — colour-filled icon buttons only (no labels; tooltips carry the name) */}
                <div className="mt-8 pt-5" style={{ borderTop: "1px solid var(--tdn-border)" }}>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {typeof navigator !== "undefined" && navigator.share && (
                      <button onClick={doNativeShare} title="Share" aria-label="Share" className={SHARE_BTN} style={{ background: "#0d9488", ...SHARE_RING }}>
                        <Share2 size={16} />
                      </button>
                    )}
                    {socials.map((s) => (
                      <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label} aria-label={`Share on ${s.label}`} className={SHARE_BTN} style={{ background: s.color, ...SHARE_RING }}>
                        <s.Icon />
                      </a>
                    ))}
                    <button onClick={copyLink} title={copied ? "Link copied" : "Copy link"} aria-label="Copy link" className={SHARE_BTN} style={{ background: copied ? "#10c477" : "#0d9488", ...SHARE_RING }}>
                      {copied ? <Check size={17} /> : <Link2 size={16} />}
                    </button>
                  </div>
                </div>
              </article>

              {/* Right rail — live movers, educational market pages and related news. */}
              <aside className="lg:col-span-3 space-y-8">
                {/* Live market movers (equities), clickable to each asset's detail page */}
                <MoversPanel title="Top Gainers" icon={Flame} color="var(--tdn-up)" rows={movers.gainers} />
                <MoversPanel title="Top Losers" icon={Snowflake} color="var(--tdn-down)" rows={movers.losers} />

                {/* Share Price & Analysis (same design/behaviour as the Weekly Outlook detail) */}
                <section>
                  <h2 className="text-base font-bold pb-2 mb-4" style={{ color: "var(--tdn-fg-strong)", borderBottom: "2px solid var(--tdn-iris)" }}>Share Price &amp; Analysis</h2>
                  <nav className="flex flex-col gap-2.5">
                    {STOCKS.map((s) => (
                      <Link key={s.symbol} href={`/tradeon/weekly-outlook/${outlookSlug(s.symbol)}`} className="text-sm transition-colors hover:text-[var(--tdn-iris-2)] hover:underline" style={{ color: "var(--tdn-fg)" }}>
                        {s.symbol} Share Price
                      </Link>
                    ))}
                  </nav>
                </section>

                {/* Related news */}
                <section>
                  <h2 className="text-base font-bold pb-2 mb-3" style={{ color: "var(--tdn-fg-strong)", borderBottom: "2px solid var(--tdn-iris)" }}>Related news</h2>
                  {related.length ? (
                    <div className="flex flex-col divide-y" style={{ borderColor: "var(--tdn-border)" }}>
                      {related.map((a) => (
                        <div key={a.id} style={{ borderColor: "var(--tdn-border)" }}>
                          <NewsCard article={a} now={now} variant="row" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: "var(--tdn-faint)" }}>No related stories right now.</p>
                  )}
                  <Link href="/tradeon/news" className="inline-flex items-center gap-1.5 text-xs font-semibold mt-4 hover:underline" style={{ color: "var(--tdn-iris-2)" }}>
                    More market news <ArrowUpRight size={13} />
                  </Link>
                </section>
              </aside>
            </div>
          )}
        </div>
      </main>

      <TradeonFooter status={status} />
    </div>
  );
}
