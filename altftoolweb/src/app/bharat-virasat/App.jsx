import { useEffect, useRef, useState, useMemo } from "react";
import { SITES } from "./data/sites";
import { useWikiData } from "./services/wikipedia";

const MAX_GALLERY_IMAGES = 30;

function uniqueLimitedImages(images, limit = MAX_GALLERY_IMAGES) {
  const seen = new Set();
  const result = [];
  for (const image of images) {
    if (!image || seen.has(image)) continue;
    seen.add(image);
    result.push(image);
    if (result.length >= limit) break;
  }
  return result;
}

export default function App() {
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [detailSite, setDetailSite] = useState(null);
  const [detailFocusGallery, setDetailFocusGallery] = useState(false);
  const chaptersRef = useRef([]);
  const progressRef = useRef(null);

  // Scroll spy
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number(e.target.dataset.index);
            if (!Number.isNaN(idx)) setActive(idx);
          }
        });
      },
      { threshold: 0.45 }
    );
    chaptersRef.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Progress ring
  useEffect(() => {
    const onScroll = () => {
      if (!progressRef.current) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      const circ = 2 * Math.PI * 22;
      progressRef.current.style.strokeDashoffset = String(circ * (1 - p));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            reveal.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));
    return () => reveal.disconnect();
  }, []);

  // Lock body scroll for modals
  useEffect(() => {
    const open = !!(menuOpen || lightbox || detailSite);
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, lightbox, detailSite]);

  // Keyboard handling
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (lightbox) setLightbox(null);
        else if (detailSite) setDetailSite(null);
        else if (menuOpen) setMenuOpen(false);
      }
      if (lightbox) {
        if (e.key === "ArrowRight")
          setLightbox((l) => l && { ...l, index: (l.index + 1) % l.images.length });
        if (e.key === "ArrowLeft")
          setLightbox((l) => l && { ...l, index: (l.index - 1 + l.images.length) % l.images.length });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, detailSite, menuOpen]);

  const scrollTo = (i) => {
    chaptersRef.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const current = SITES[active] ?? SITES[0];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-white/20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap');
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', system-ui, sans-serif; background:#0f0f0f; }
        .serif { font-family: 'Instrument Serif', serif; font-weight: 400; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
        [data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1); }
        [data-reveal].is-in { opacity: 1; transform: none; }
        [data-reveal-delay="1"] { transition-delay: .08s; }
        [data-reveal-delay="2"] { transition-delay: .16s; }
        [data-reveal-delay="3"] { transition-delay: .24s; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }

        /* Heritage card entrance animations — big, smooth, snappy */
        .heritage-card {
          opacity: 0;
          will-change: transform, opacity;
          transition: none;
        }
        .heritage-card--left {
          transform: translateX(-60px);
        }
        .heritage-card--right {
          transform: translateX(60px);
        }
        .heritage-card--bottom {
          transform: translateY(80px);
        }
        .heritage-card.is-visible {
          opacity: 1;
          transform: translate(0, 0);
          transition: opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .modal-enter { animation: fadeIn .3s ease; }
        .modal-content-enter { animation: slideUp .5s cubic-bezier(.2,.8,.2,1); }
        .title-link {
          text-decoration: underline;
          text-decoration-color: transparent;
          text-decoration-thickness: 1px;
          text-underline-offset: 0.12em;
          transition: text-decoration-color .5s cubic-bezier(.2,.8,.2,1);
        }
        .title-link:hover { text-decoration-color: currentColor; }

        .skeleton-img {
          background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.14), rgba(255,255,255,0.06));
          background-size: 220% 100%;
          animation: skeletonPulse 1.2s ease-in-out infinite;
        }
        @keyframes skeletonPulse {
          0% { background-position: 100% 0; opacity: 0.45; }
          50% { opacity: 0.85; }
          100% { background-position: -100% 0; opacity: 0.45; }
        }

      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 mix-blend-difference">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full border border-white/30 grid place-items-center">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="leading-tight text-left"
              aria-label="Scroll to top"
            >
              <div className="serif text-[22px] leading-none">Bharat Virasat</div>
              <div className="text-[10px] tracking-[0.18em] uppercase opacity-60">Heritage 2026</div>
            </button>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.14em] uppercase">
            <span className="opacity-60">{SITES.length} Sites</span>
            <span className="opacity-60">India</span>
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-full border border-white/30 px-3 py-1 hover:bg-white hover:text-black transition"
            >
              Index
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[100svh] flex items-center">
        <HeroSlideshow />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-[#0f0f0f] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 w-full">
          <div className="max-w-[1000px]">
            <div
              data-reveal
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur px-3 py-1 text-[11px] tracking-wide uppercase mb-8"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              An endless scroll gallery — {SITES.length} UNESCO sites
            </div>
            <h1
              data-reveal
              data-reveal-delay="1"
              className="serif text-[clamp(3.5rem,12vw,9.5rem)] leading-[0.85] tracking-[-0.03em]"
            >
              India&#39;s
              <br />
              <span className="italic opacity-80">Living Heritage</span>
            </h1>
            <p
              data-reveal
              data-reveal-delay="2"
              className="mt-8 max-w-xl text-[15px] leading-relaxed opacity-70"
            >
              A linear journey through every UNESCO World Heritage site of India.
              Massive imagery, rich galleries, paced typography. Click any site
              title to read its full story.
            </p>
          </div>
        </div>


        {/* Marquee */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-3 overflow-hidden bg-black/40 backdrop-blur">
          <div className="flex gap-10 whitespace-nowrap" style={{ animation: "marquee 80s linear infinite" }}>
            {[...SITES, ...SITES].map((s, i) => (
              <span key={i} className="serif text-lg opacity-60 shrink-0">
                {s.name} <span className="opacity-30 mx-3">◆</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Chapters */}
      <main>
        {SITES.map((site, i) => (
          <Chapter
            key={site.id}
            site={site}
            index={i}
            ref={(el) => { chaptersRef.current[i] = el; }}
            onOpenImage={(images, idx) => setLightbox({ images, index: idx })}
            onOpenDetails={() => {
              setDetailSite(site);
              setDetailFocusGallery(false);
            }}
            onViewAllPhotos={() => {
              setDetailSite(site);
              setDetailFocusGallery(true);
            }}
          />
        ))}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-24 mt-10">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-7">
              <h3 className="serif text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-tight">
                The journey of <span className="italic opacity-70">heritage</span> never ends.
              </h3>
              <p className="mt-6 max-w-md text-sm opacity-60 leading-relaxed">
                From the marble of the Taj to the mangroves of the Sundarbans, every site is
                a chapter still being written.
              </p>
            </div>
            <div className="md:col-span-5 flex md:justify-end items-end">
              <div className="text-[11px] uppercase tracking-wide opacity-50 space-y-1">
                <div>Bharat Virasat — Heritage Gallery Book</div>
                <div>Photography via Pexels</div>
                <div>{SITES.length} chapters • Endless scroll</div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom chapter nav */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-3 max-w-[95vw]">
        <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/70 backdrop-blur-2xl pl-2 pr-2 py-2 shadow-2xl">
          <button
            onClick={() => setMenuOpen(true)}
            className="relative h-11 w-11 grid place-items-center shrink-0"
            aria-label="Open index"
          >
            <svg width="44" height="44" className="-rotate-90 absolute inset-0">
              <circle cx="22" cy="22" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <circle
                ref={progressRef}
                cx="22"
                cy="22"
                r="22"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset .15s linear" }}
              />
            </svg>
            <span className="text-[10px] font-medium relative z-10">
              {String(active + 1).padStart(2, "0")}
            </span>
          </button>

          <div className="h-8 w-px bg-white/15 shrink-0" />

          <button
            onClick={() => setDetailSite(current)}
            className="pr-1 min-w-0 max-w-[200px] text-left group"
            title="Open details"
          >
            <div className="text-[10px] uppercase tracking-wide opacity-60">Now viewing</div>
            <div className="serif text-[17px] leading-tight truncate group-hover:underline">
              {current.name}
            </div>
          </button>

          <div className="h-8 w-px bg-white/15 shrink-0 hidden sm:block" />

          <div className="hidden sm:flex gap-1 shrink-0">
            <button
              onClick={() => scrollTo(Math.max(0, active - 1))}
              disabled={active === 0}
              className="h-9 w-9 rounded-full border border-white/15 grid place-items-center hover:bg-white/10 transition disabled:opacity-30"
              aria-label="Previous"
            >
              ←
            </button>
            <button
              onClick={() => scrollTo(Math.min(SITES.length - 1, active + 1))}
              disabled={active === SITES.length - 1}
              className="h-9 w-9 rounded-full bg-white text-black grid place-items-center hover:bg-white/90 transition disabled:opacity-30"
              aria-label="Next"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Index modal */}
      {menuOpen && (
        <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-xl modal-enter">
          <div className="absolute inset-0 overflow-y-auto">
            <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20">
              <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] opacity-60 mb-2">Index</div>
                  <h3 className="serif text-[clamp(2.5rem,6vw,4.5rem)] leading-none">All Chapters</h3>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="h-12 w-12 rounded-full border border-white/20 grid place-items-center hover:bg-white/10 text-2xl"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SITES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(i)}
                    className={`group flex items-center gap-4 p-3 rounded-2xl border transition text-left ${
                      i === active
                        ? "border-white/40 bg-white/10"
                        : "border-white/10 hover:border-white/25 hover:bg-white/5"
                    }`}
                  >
                    <div className="h-16 w-20 rounded-lg overflow-hidden shrink-0 bg-white/5">
                      <img
                        src={s.images[0]}
                        className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition"
                        alt=""
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] tracking-wider opacity-50">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-[10px] tracking-wider uppercase opacity-50">{s.year}</span>
                      </div>
                      <div className="serif text-lg leading-tight truncate">{s.name}</div>
                      <div className="text-[11px] opacity-60 truncate">{s.place}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detailSite && (
        <DetailModal
          site={detailSite}
          onClose={() => { setDetailSite(null); setDetailFocusGallery(false); }}
          onOpenImage={(images, idx) => setLightbox({ images, index: idx })}
          focusGallery={detailFocusGallery}
        />
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-md grid place-items-center p-4 modal-enter"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            className="absolute top-5 right-5 h-12 w-12 rounded-full border border-white/20 grid place-items-center hover:bg-white/10 text-2xl z-10"
            aria-label="Close"
          >
            ×
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((l) => l && { ...l, index: (l.index - 1 + l.images.length) % l.images.length });
            }}
            className="absolute left-5 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full border border-white/20 grid place-items-center hover:bg-white/10 text-xl z-10"
            aria-label="Previous"
          >
            ←
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((l) => l && { ...l, index: (l.index + 1) % l.images.length });
            }}
            className="absolute right-5 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full border border-white/20 grid place-items-center hover:bg-white/10 text-xl z-10"
            aria-label="Next"
          >
            →
          </button>
          <img
            src={lightbox.images[lightbox.index]}
            alt=""
            className="max-h-[88vh] max-w-[92vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs opacity-60">
            {lightbox.index + 1} / {lightbox.images.length}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Hero Slideshow ---------------- */

function HeroSlideshow() {
  // Cycle through every site's hero image with a smooth crossfade.
  // We keep two layers (A and B), switch which one is on top and update its src.
  const slides = SITES.map((s) => s.images[0]);
  const [index, setIndex] = useState(0);
  const [showA, setShowA] = useState(true);
  const [srcA, setSrcA] = useState(slides[0]);
  const [srcB, setSrcB] = useState(slides[1 % slides.length]);

  useEffect(() => {
    // Preload all images once
    slides.forEach((s) => {
      const img = new Image();
      img.src = s;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % slides.length;
        // Update the hidden layer with the next image, then flip
        if (showA) {
          setSrcB(slides[next]);
          // give the browser a tick to load before crossfading
          requestAnimationFrame(() => setShowA(false));
        } else {
          setSrcA(slides[next]);
          requestAnimationFrame(() => setShowA(true));
        }
        return next;
      });
    }, 5000);
    return () => window.clearInterval(id);
  }, [showA, slides]);

  const currentSite = SITES[index];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={srcA}
        alt=""
        aria-hidden={!showA}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ease-in-out"
        style={{ opacity: showA ? 1 : 0, transform: "scale(1.04)" }}
      />
      <img
        src={srcB}
        alt=""
        aria-hidden={showA}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ease-in-out"
        style={{ opacity: showA ? 0 : 1, transform: "scale(1.04)" }}
      />
      {/* Now-showing label */}
      <div className="absolute bottom-24 right-6 md:right-10 z-20 text-right pointer-events-none">
        <div className="text-[10px] tracking-[0.25em] uppercase opacity-60 mb-1">Now showing</div>
        <div
          key={currentSite.id}
          className="serif text-lg md:text-xl"
          style={{ animation: "fadeIn .8s ease" }}
        >
          {currentSite.name}
        </div>
      </div>

    </div>
  );
}

/* ---------------- Chapter ---------------- */

const Chapter = (() => {
  const Component = (props) => {
    const { site, index, onOpenImage, onOpenDetails, onViewAllPhotos, forwardedRef } = props;
    const isEven = index % 2 === 0;
    const cardRef = useRef(null);
    const wikiData = useWikiData(site);

    // Merge local gallery with Wikipedia images (local first, then wiki)
    const allImages = useMemo(() => {
      const wikiUrls = wikiData.images.map((img) => img.url);
      // Deduplicate — keep local images + unique Wikipedia images
      const localSet = new Set(site.gallery);
      const wikiUnique = wikiUrls.filter((u) => !localSet.has(u));
      return uniqueLimitedImages([...site.gallery, ...wikiUnique]);
    }, [site.gallery, wikiData.images]);

    // Alternate slide direction: 0 = left, 1 = right, 2 = bottom
    const slideDir = index % 3 === 0 ? "left" : index % 3 === 1 ? "right" : "bottom";

    // Scroll-triggered entrance animation
    useEffect(() => {
      const el = cardRef.current;
      if (!el) return;
      // Fallback: if IntersectionObserver is unavailable, show immediately
      if (typeof IntersectionObserver === "undefined") {
        el.classList.add("is-visible");
        return;
      }
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            obs.disconnect();
          }
        },
        { threshold: 0.6 }
      );
      obs.observe(el);
      return () => obs.disconnect();
    }, []);

    // gallery items to display – 5 on the front page
    const gallery = allImages.slice(0, 5);

    // Wrapper to pass full merged gallery to lightbox
    const openLightbox = (idx) => onOpenImage(allImages, idx);

    return (
      <section
        ref={forwardedRef}
        data-index={index}
        className="relative min-h-[100svh] py-32 md:py-40 mb-4 md:mb-8"
      >
        {/* Background image — static, no animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={site.images[0]}
            alt=""
            className="h-full w-full object-cover scale-105"
            loading="lazy"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
            }}
          />
          {/* Side-fade for text legibility */}
          <div
            className={`absolute inset-0 ${
              isEven
                ? "bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/75 to-transparent"
                : "bg-gradient-to-l from-[#0f0f0f] via-[#0f0f0f]/75 to-transparent"
            }`}
          />
          {/* Top & bottom fade-to-base — blends with neighbouring sections */}
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#0f0f0f] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
          <div className="absolute inset-0 bg-[#0f0f0f]/25" />
        </div>

        {/* Giant chapter number watermark */}
        <div
          className={`absolute ${
            isEven ? "right-0 top-1/2" : "left-0 top-1/2"
          } -translate-y-1/2 serif text-[clamp(12rem,30vw,28rem)] leading-none tracking-[-0.06em] opacity-[0.05] select-none pointer-events-none`}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Animated card container */}
        <div
          ref={cardRef}
          className={`heritage-card heritage-card--${slideDir}`}
        >
          <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 w-full">
          <div
            className={`grid lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
              !isEven ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            {/* Text column */}
            <div className="lg:col-span-5 space-y-6">
              <div data-reveal className="flex items-center gap-4">
                <span className="text-[11px] tracking-[0.25em] uppercase opacity-50">
                  Chapter {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-px w-16 bg-white/20" />
                <span className="text-[11px] tracking-[0.25em] uppercase opacity-50">
                  {site.year}
                </span>
              </div>

              {/* Clickable title */}
              <button
                onClick={onOpenDetails}
                data-reveal
                data-reveal-delay="1"
                className="block text-left w-full group"
                title={`Read more about ${site.name}`}
              >
                <h2 className="serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.9] tracking-[-0.02em] inline">
                  <span className="title-link">{site.name}</span>
                </h2>
                <span className="inline-flex items-center gap-1 ml-3 text-xs uppercase tracking-wider opacity-50 group-hover:opacity-100 transition align-middle">
                  Read
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </span>
              </button>

              <div data-reveal data-reveal-delay="2" className="flex flex-wrap items-baseline gap-3">
                <span className="text-[12px] uppercase tracking-wider opacity-60">{site.place}</span>
                <span className="h-px w-6 bg-white/20" />
                <span className="serif italic text-xl opacity-90">{site.tagline}</span>
              </div>

              <p
                data-reveal
                data-reveal-delay="2"
                className="text-[15px] leading-relaxed opacity-75 max-w-lg"
              >
                {site.description}
              </p>

              <div data-reveal data-reveal-delay="3" className="flex flex-wrap gap-2 pt-2">
                <span className="rounded-full bg-white text-black px-3 py-1 text-[11px] font-medium uppercase tracking-wider">
                  {site.type}
                </span>
                <span className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-wider opacity-80">
                  UNESCO {site.year}
                </span>
                <button
                  onClick={onOpenDetails}
                  className="rounded-full border border-white/30 hover:bg-white hover:text-black px-3 py-1 text-[11px] uppercase tracking-wider transition"
                >
                  Full story →
                </button>
              </div>
            </div>

            {/* Gallery column – bento grid with 5 images */}
            <div className="lg:col-span-7">
              <div
                id={`gallery-${site.id}`}
                data-reveal
                data-reveal-delay="1"
                className="grid grid-cols-6 auto-rows-[90px] sm:auto-rows-[110px] gap-2.5 md:gap-3"
              >
                {/* 1. Large hero – cols 1-4, rows 1-2 */}
                <GalleryTile
                  src={gallery[0]}
                  alt={`${site.name} 1`}
                  className="col-span-4 row-span-2"
                  onClick={() => openLightbox(0)}
                  showZoom
                />
                {/* 2. Tall right – cols 5-6, rows 1-2 */}
                {gallery[1] && (
                  <GalleryTile
                    src={gallery[1]}
                    alt={`${site.name} 2`}
                    className="col-span-2 row-span-2"
                    onClick={() => openLightbox(1)}
                  />
                )}
                {/* 3. Bottom-left – cols 1-2, rows 3-4 */}
                {gallery[2] && (
                  <GalleryTile
                    src={gallery[2]}
                    alt={`${site.name} 3`}
                    className="col-span-2 row-span-2"
                    onClick={() => openLightbox(2)}
                  />
                )}
                {/* 4. Bottom-center – cols 3-4, rows 3-4 */}
                {gallery[3] && (
                  <GalleryTile
                    src={gallery[3]}
                    alt={`${site.name} 4`}
                    className="col-span-2 row-span-2"
                    onClick={() => openLightbox(3)}
                  />
                )}
                {/* 5. Bottom-right – cols 5-6, rows 3-4 */}
                {gallery[4] && (
                  <GalleryTile
                    src={gallery[4]}
                    alt={`${site.name} 5`}
                    className="col-span-2 row-span-2"
                    onClick={() => openLightbox(4)}
                  />
                )}
              </div>

              {/* Caption strip */}
              <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-wider opacity-60">
                <span>
                  {allImages.length} photograph{allImages.length !== 1 ? "s" : ""}
                  {wikiData.loading ? " • loading…" : wikiData.images.length > 0 ? ` (+${wikiData.images.length} from Wikipedia)` : ""}
                </span>
                <button
                  onClick={onViewAllPhotos}
                  className="hover:text-white underline-offset-4 hover:underline transition"
                >
                  View all photos →
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
    );
  };

  return function Forwarded(props) {
    const { ref, ...rest } = props;
    return <Component {...rest} forwardedRef={ref} />;
  };
})();

/* ---------------- Gallery tile ---------------- */

function GalleryTile({
  src, alt, className = "", onClick, showZoom = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`${className} relative overflow-hidden rounded-xl md:rounded-2xl group cursor-zoom-in bg-white/5`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
      {showZoom && (
        <div className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white/10 backdrop-blur grid place-items-center opacity-0 group-hover:opacity-100 transition">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </div>
      )}
    </button>
  );
}

/* ---------------- Detail Modal ---------------- */

function DetailModal({
  site, onClose, onOpenImage, focusGallery = false,
}) {
  const galleryRef = useRef(null);
  const wiki = useWikiData(site);
  const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(site.wikiTitle || site.name.replace(/\s+/g, "_"))}`;

  // Merge local + Wikipedia gallery images
  const allGalleryImages = useMemo(() => {
    const localSet = new Set(site.gallery);
    const wikiUrls = wiki.images.map((img) => img.url).filter((u) => !localSet.has(u));
    return uniqueLimitedImages([...site.gallery, ...wikiUrls]);
  }, [site.gallery, wiki.images]);

  useEffect(() => {
    if (focusGallery && galleryRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }
  }, [focusGallery]);

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-xl modal-enter overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative mx-auto max-w-[1100px] my-10 px-5 md:px-10 modal-content-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="sticky top-5 ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 backdrop-blur hover:bg-white hover:text-black text-2xl transition z-10"
          aria-label="Close"
          style={{ float: "right" }}
        >
          ×
        </button>

        {/* Hero image */}
        <div className="relative rounded-3xl overflow-hidden mt-6 aspect-[16/9] bg-white/5">
          <img src={site.images[0]} alt={site.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4 text-[11px] uppercase tracking-[0.2em] opacity-80">
              <span className="rounded-full bg-white text-black px-3 py-1 font-medium">{site.type}</span>
              <span>UNESCO {site.year}</span>
              <span className="opacity-60">•</span>
              <span>{site.place}</span>
            </div>
            <h2 className="serif text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] tracking-tight">
              {site.name}
            </h2>
            <p className="mt-3 serif italic text-xl md:text-2xl opacity-90">{site.tagline}</p>
          </div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-12 gap-10 mt-10 md:mt-14">
          {/* Main story */}
          <div className="md:col-span-8 space-y-10">
            {/* Extended Summary */}
            {wiki.loading && (
              <section>
                <SectionTitle eyebrow="Intro" title="Overview" />
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-white/10 rounded w-full" />
                  <div className="h-4 bg-white/10 rounded w-5/6" />
                  <div className="h-4 bg-white/10 rounded w-4/6" />
                </div>
              </section>
            )}
            {wiki.summary && (
              <section>
                <SectionTitle eyebrow="Intro" title="Overview" />
                <p className="text-base md:text-lg leading-relaxed opacity-85">{wiki.summary.extract}</p>
              </section>
            )}
            {!wiki.loading && !wiki.summary && (
              <section>
                <SectionTitle eyebrow="Intro" title="Overview" />
                <p className="text-base md:text-lg leading-relaxed opacity-85">{site.description}</p>
              </section>
            )}

            <section>
              <SectionTitle eyebrow="01" title="History" />
              <p className="text-base md:text-lg leading-relaxed opacity-85">{site.details.history}</p>
            </section>

            <section>
              <SectionTitle eyebrow="02" title="Architecture & Setting" />
              <p className="text-base md:text-lg leading-relaxed opacity-85">{site.details.architecture}</p>
            </section>

            <section>
              <SectionTitle eyebrow="03" title="Highlights" />
              <ul className="space-y-3">
                {site.details.highlights.map((h, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="serif text-amber-300/80 text-xl shrink-0 w-6">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base opacity-85 leading-relaxed pt-0.5">{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Side card */}
          <aside className="md:col-span-4 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
              <InfoRow label="Location" value={site.place} />
              <InfoRow label="Inscribed" value={site.year} />
              <InfoRow label="Category" value={site.type} />
              <InfoRow label="Best time" value={site.details.bestTime} />
              <InfoRow label="How to reach" value={site.details.howToReach} />
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-transparent p-6">
              <div className="text-[10px] tracking-[0.2em] uppercase opacity-60 mb-2">Did you know</div>
              <p className="serif italic text-lg leading-snug">
                &quot;{site.tagline}&quot;
              </p>
            </div>

            {/* Wikipedia thumbnail */}
            {wiki.summary?.thumbnail && (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <img
                  src={wiki.summary.thumbnail.source}
                  alt=""
                  className="w-full aspect-video object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Wikipedia link */}
            <a
              href={wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/5 transition group"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 group-hover:text-white/80 transition shrink-0">
                <path d="M12.09 13.119c-.313.696-1.1 2.857-1.452 3.768-.19.49-.375.583-.522.583-.216 0-.39-.138-.433-.434l-.272-3.263c-.055-.328-.272-.463-.51-.434l-2.15.472c-.286.054-.447-.138-.338-.383.697-1.425 1.738-3.366 2.53-4.776.338-.6.637-.697.933-.697.42 0 .473.342.39.1.048.145.16.42.16.668 0 .355-.08.938-.3 1.465-.23.547-.298.696-.298.834 0 .245.216.488.567.355l1.13-.444c.378-.148.656-.078.74.304z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18.75c-4.837 0-8.75-3.913-8.75-8.75S7.163 3.25 12 3.25 20.75 7.163 20.75 12s-3.913 8.75-8.75 8.75z"/>
              </svg>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] tracking-[0.15em] uppercase opacity-60">Source</div>
                <div className="text-sm truncate">Read full article on Wikipedia</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-40 group-hover:opacity-100 transition shrink-0">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </aside>
        </div>

        {/* Photo gallery */}
        <GallerySection
          site={site}
          allGalleryImages={allGalleryImages}
          wikiLoading={wiki.loading}
          onOpenImage={onOpenImage}
          galleryRef={galleryRef}
        />
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div className="flex items-end justify-between mb-5 pb-3 border-b border-white/10">
      <h3 className="serif text-2xl md:text-3xl tracking-tight">{title}</h3>
      <span className="text-[10px] tracking-[0.2em] uppercase opacity-50">{eyebrow}</span>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.2em] uppercase opacity-60 mb-1">{label}</div>
      <div className="text-sm leading-snug">{value}</div>
    </div>
  );
}

/* ---------------- Gallery Section (Lazy Load) ---------------- */

function GallerySection({
  site,
  allGalleryImages,
  wikiLoading,
  onOpenImage,
  galleryRef,
}) {
  const layoutRef = useRef(null);
  const [columnCount, setColumnCount] = useState(2);
  const [loadedUrls, setLoadedUrls] = useState(() => new Set());

  const uniqueImages = useMemo(() => uniqueLimitedImages(allGalleryImages), [allGalleryImages]);

  useEffect(() => {
    setLoadedUrls(new Set());
  }, [site.id]);

  useEffect(() => {
    const el = layoutRef.current;
    if (!el) return;

    const updateLayout = () => {
      const width = el.clientWidth || window.innerWidth;
      const cols = Math.max(2, Math.min(5, Math.floor(width / 180)));
      setColumnCount(cols);
    };

    updateLayout();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateLayout);
      return () => window.removeEventListener("resize", updateLayout);
    }

    const ro = new ResizeObserver(updateLayout);
    ro.observe(el);
    window.addEventListener("resize", updateLayout);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [site.id]);

  const displayedImages = uniqueImages;

  return (
    <section ref={galleryRef} className="mt-14 mb-10 scroll-mt-6">
      <div className="flex items-end justify-between mb-5 pb-3 border-b border-white/10">
        <h3 className="serif text-2xl md:text-3xl tracking-tight">Gallery</h3>
        <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase opacity-50">
          <span>{uniqueImages.length} photos</span>
          {wikiLoading && <span className="animate-pulse text-amber-300/60">• loading…</span>}
        </div>
      </div>
      
      <div
        ref={layoutRef}
        className="w-full"
        style={{ columnCount, columnGap: "10px" }}
      >
        {displayedImages.map((src, i) => (
          <GalleryImageCard
            key={src}
            src={src}
            alt={`${site.name} ${i + 1}`}
            aspectClass={galleryAspectClass(i)}
            loaded={loadedUrls.has(src)}
            onLoad={() => {
              setLoadedUrls((prev) => {
                const next = new Set(prev);
                next.add(src);
                return next;
              });
            }}
            onClick={() => onOpenImage(uniqueImages, i)}
          />
        ))}

        {wikiLoading &&
          Array.from({ length: Math.max(columnCount * 2, 4) }).map((_, i) => (
            <div
              key={`load-${i}`}
              className={`skeleton-img mb-2.5 block w-full break-inside-avoid rounded-xl ${galleryAspectClass(displayedImages.length + i)}`}
            />
          ))}
      </div>

      {uniqueImages.length === 0 && !wikiLoading && (
        <p className="text-sm opacity-50 mt-4">No gallery images available.</p>
      )}
    </section>
  );
}

function galleryAspectClass(index) {
  const layouts = [
    "aspect-[4/3]",
    "aspect-[3/4]",
    "aspect-square",
    "aspect-[16/10]",
    "aspect-[5/4]",
    "aspect-[4/5]",
    "aspect-[3/2]",
    "aspect-square",
    "aspect-[2/3]",
    "aspect-[16/9]",
    "aspect-[4/3]",
    "aspect-[5/6]",
  ];
  return layouts[index % layouts.length];
}

function GalleryImageCard({
  src,
  alt,
  aspectClass,
  loaded,
  onLoad,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`relative mb-2.5 block w-full break-inside-avoid overflow-hidden rounded-xl group cursor-zoom-in bg-white/5 ${aspectClass}`}
    >
      {!loaded && <div className="skeleton-img absolute inset-0 rounded-xl" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        width={400}
        height={300}
        onLoad={onLoad}
        className={`absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
    </button>
  );
}
