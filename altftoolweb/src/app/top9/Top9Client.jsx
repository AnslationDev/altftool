"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight, BookOpen, Car, Check, ChevronDown, Clapperboard, Cpu, DollarSign,
  Flame, ForkKnife, Gamepad2, GraduationCap, Heart, Plane, Search, Shirt,
  Sparkles, Star, UtensilsCrossed,
} from "lucide-react";
import { trending } from "./data2/trending";
import { blogs } from "./data/blogs";

const categoryImages = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=600&auto=format&fit=crop",
];
const categoryData = [
  [Sparkles, "AI Tools", "28", "Smart tools that boost productivity and creativity."],
  [Clapperboard, "Movies", "25", "Best movies of all time across every genre."],
  [Plane, "Travel", "22", "Top destinations for your next unforgettable trip."],
  [UtensilsCrossed, "Food", "19", "Delicious eats and must-try food experiences."],
  [DollarSign, "Finance", "18", "Smarter money choices for a better future."],
  [Heart, "Health", "16", "Top health tips, products and wellness guides."],
  [Gamepad2, "Gaming", "15", "Best games, gear and gaming experiences."],
  [Cpu, "Technology", "23", "Top gadgets, devices and tech innovations."],
  [Shirt, "Fashion", "14", "Style ideas, trends and fashion essentials."],
  [BookOpen, "Books", "19", "Must-read books across every category."],
  [GraduationCap, "Education", "17", "Top courses, schools and learning resources."],
  [Car, "Cars", "13", "Best cars, bikes and auto recommendations."],
];
const shelfItems = [
  ["All-Time Favorites", "The rankings readers bookmark and return to, year after year.", "50", "Since day one"],
  ["Most Popular", "What everyone is clicking on right now.", "42", "This month"],
  ["Editor's Picks", "The lists our own editors would send a friend.", "31", "Personally vetted"],
  ["Hidden Gems", "Underrated but unforgettable discoveries.", "28", "Worth the discovery"],
  ["Trending This Week", "The conversations you do not want to miss.", "24", "Moving fast"],
];
const faqs = [
  ["How does Top9 choose what makes each list?", "Every list starts with independent research, hands-on testing where possible, and verified reader feedback. We never accept payment for placement these are the picks we'd actually recommend."],
  ["Why nine, and not ten?", "Nine gives every ranking a clear, considered shortlist. It leaves room for variety without adding choices that do not earn their place."],
  ["How often are rankings updated?", "Our editors revisit fast-moving categories regularly and update lists whenever a meaningful new option, release, or change appears."],
  ["Can I suggest or submit a list?", "Yes. Send us the category or ranking you would like to see, and our editorial team will consider it for an upcoming research cycle."],
];
function Eyebrow({ children }) { return <p className="t9-eyebrow"><span />{children}</p>; }
function SectionHeading({ eyebrow, title, href = "/top9" }) { return <div className="t9-section-heading"><div><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2></div><Link href={href}>View all <ArrowRight size={15} /></Link></div>; }
// None of the trending/blog items on this homepage carry a real 9-item ranked
// list, so labeling them "Top 9" overclaims. Use the item's own honest prefix
// (e.g. "Best", "Greatest") when it has one, otherwise its plain title.
function listTitle(item) { return item?.prefix ? `${item.prefix} ${item.title}` : item?.title; }

export default function Top9Client() {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState(0);
  const [trackTranslateX, setTrackTranslateX] = useState(0);
  const marqueeRef = useRef(null);
  const trendViewportRef = useRef(null);
  const trendTrackRef = useRef(null);
  const trendCardRefs = useRef([]);
  const dragStartX = useRef(0);
  const startScrollLeft = useRef(0);
  const animationFrame = useRef(null);
  const query = params.get("q") || "";
  const selected = params.get("category") || "";
  const allItems = useMemo(() => [...trending, ...blogs], []);
  const filtered = allItems.filter((item) => !query || item.title.toLowerCase().includes(query.toLowerCase()));
  const heroItems = [...trending.slice(3, 4), ...blogs.slice(0, 2)];
  const submit = (event) => { event.preventDefault(); router.push(search.trim() ? `/top9?q=${encodeURIComponent(search.trim())}` : "/top9"); };

  // No newsletter delivery backend exists yet — persist locally instead of
  // discarding the signup.
  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    try {
      window.localStorage.setItem("ALTFT_TOP9_NEWSLETTER_OPTIN", newsletterEmail.trim());
    } catch {
      // localStorage can be unavailable in private browsing; UI still succeeds.
    }
    setNewsletterSubscribed(true);
  };

  const handlePointerDown = (event) => {
    if (!marqueeRef.current) return;
    setIsDragging(true);
    setIsPaused(true);
    dragStartX.current = event.clientX ?? event.touches?.[0]?.clientX;
    startScrollLeft.current = marqueeRef.current.scrollLeft;
  };

  const handlePointerMove = (event) => {
    if (!isDragging || !marqueeRef.current) return;
    const clientX = event.clientX ?? event.touches?.[0]?.clientX;
    const moveX = clientX - dragStartX.current;
    marqueeRef.current.scrollLeft = startScrollLeft.current - moveX;
  };

  const centerSelectedTrend = () => {
    const viewport = trendViewportRef.current;
    const track = trendTrackRef.current;
    const selectedCard = trendCardRefs.current[selectedTrend];
    if (!viewport || !track || !selectedCard) return;

    const viewportWidth = viewport.offsetWidth;
    const selectedCenter = selectedCard.offsetLeft + selectedCard.offsetWidth / 2;
    const maxOffset = Math.max(0, track.scrollWidth - viewportWidth);
    const target = Math.min(Math.max(0, selectedCenter - viewportWidth / 2), maxOffset);

    setTrackTranslateX(-target);
  };

  const handleTrendClick = (event, index) => {
    if (index !== selectedTrend) {
      event.preventDefault();
      setSelectedTrend(index);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  useEffect(() => {
    centerSelectedTrend();
  }, [selectedTrend, allItems.length]);

  useEffect(() => {
    const viewport = trendViewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(centerSelectedTrend);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [selectedTrend, allItems.length]);

  return <main className="top9-page t9-home">
    <section className="t9-hero">
      <div className="t9-container t9-hero-copy">
        <div className="t9-hero-badge"><i />{categoryData.length} categories to explore</div>
        <h1>We Research.<br />We Rank.<br /><em>You Choose.</em></h1>
        <p>EveryTop 9 is reported, compared, and ranked by our editors so you can make your next decision in minutes, not hours.</p>
        <form className="t9-search" onSubmit={submit}><Search size={19} /><input value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search Top9" placeholder="Search Top 9 AI Tools, Movies, Foods, Destinations" /><button>Search</button></form>
        <div className="t9-chips">{["AI Tools", "Movies", "Travel", "Food", "Netflix", "Phones", "Cars", "Games"].map((chip) => <Link href={`/top9?q=${encodeURIComponent(chip)}`} key={chip}>{chip}</Link>)}</div>
        {query && <p className="t9-filter-note">Showing {filtered.length} result{filtered.length === 1 ? "" : "s"} for{query}. <Link href="/top9">Clear</Link></p>}
      </div>
      <div className="t9-container t9-hero-grid">
        {heroItems.map((item, index) => <Link href={`/top9/${item.slug}`} key={item.slug} className={`t9-hero-story t9-hero-story-${index + 1}`}>
          <img src={item.img} alt={item.title} /><b>#{index + 1}</b><span className="t9-story-overlay"><small>{index === 0 ? "Editor's pick Technology" : index === 1 ? "Food" : "Travel"}</small><strong>{index === 0 ? "Top 9 AI Tools Actually Worth Paying For in 2026" : listTitle(item)}</strong>{index === 0 && <em>12 min read</em>}</span>
        </Link>)}
        <Link className="t9-trending-float" href="/top9"><Flame size={15} /> Trending now</Link>
      </div>
    </section>

    <section className="t9-category-section"><div className="t9-container"><div className="t9-section-heading t9-category-heading"><div><Eyebrow>Explore by category</Eyebrow><h2>What can you discover?</h2></div><Link href="/top9">View all <ArrowRight size={15} /></Link></div><p className="t9-section-lede">From trending topics to everyday essentials, we bring you the top 9 lists across every category to help you choose the best.</p><div className="t9-category-marquee" ref={marqueeRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => !isDragging && setIsPaused(false)}><div className={`t9-category-track${isPaused ? " is-paused" : ""}`}>{[...categoryData, ...categoryData].map(([Icon, label, count, description], index) => <Link key={`${label}-${index}`} className="t9-category-card" href={`/top9?category=${encodeURIComponent(label)}`}><figure className="t9-category-card-figure"><img src={categoryImages[index % categoryImages.length]} alt={label} /></figure><div className="t9-category-card-content"><div className="t9-category-card-content-top"><i><Icon size={18} /></i><small>{count} lists</small></div><strong>{label}</strong><p>{description}</p><span className="t9-category-card-arrow"><ArrowRight size={18} /></span></div></Link>)}</div></div></div></section>

    <section className="t9-container t9-trending-section"><SectionHeading eyebrow="Right now" title={<><Flame /> Trending Today</>} /><div className="t9-trending-viewport" ref={trendViewportRef}><div className="t9-trending-track" ref={trendTrackRef} style={{ transform: `translateX(${trackTranslateX}px)` }}>{allItems.slice(0, 5).map((item, index) => <Link key={`${item.slug}-${index}`} href={`/top9/${item.slug}`} ref={(el) => { trendCardRefs.current[index] = el; }} className={`t9-trend-card ${index === selectedTrend ? "is-selected" : ""}`} onClick={(event) => handleTrendClick(event, index)}><img src={item.img} alt={item.title} /><b>0{index + 1}</b><div><small>{["AI Tools", "Netflix", "Travel", "Technology", "Culture"][index]}</small><strong>{index === 0 ? "The 9 AI Tools Productivity Teams Actually Rely On" : listTitle(item)}</strong><p>{5 + index} min read</p></div></Link>)}</div></div></section>

    <section className="t9-container t9-shelf"><SectionHeading eyebrow="Handpicked bundles" title="The Shelf" /><div className="t9-shelf-list">{shelfItems.map(([title, description, count, tag], index) => <Link href="/top9" className={`t9-shelf-row ${index === 0 ? "is-first" : ""}`} key={title}><b>0{index + 1}</b><img src={categoryImages[(index + 2) % categoryImages.length]} alt="" /><div><small>{tag}</small><strong>{title}</strong><p>{description}</p></div><em>{count} lists</em><span><ArrowRight size={16} /></span></Link>)}</div></section>

    <section className="t9-container t9-updated"><SectionHeading eyebrow="Fresh off the desk" title="Recently Updated" /><div className="t9-timeline">{allItems.slice(4, 8).map((item, index) => <Link href={`/top9/${item.slug}`} key={item.slug}><i>{2 + index * 2}h</i><img src={item.img} alt={item.title} /><div><small>{["Travel", "Gaming", "Food", "Fitness"][index]}</small><strong>{listTitle(item)}</strong></div></Link>)}</div></section>

    <section className="t9-featured-section"><div className="t9-container"><SectionHeading eyebrow="The long read" title="Featured Rankings" /><div className="t9-featured-grid"><Link href={`/top9/${allItems[1].slug}`} className="t9-feature-main"><img src={allItems[1].img} alt="Featured ranking" /><div><small>Editor&apos;s feature</small><strong>Top 9 Documentaries That Will Change the Way You See the World</strong><p>Two months of watching, comparing and debating this is the shortlist our editors care about the most.</p></div></Link><div className="t9-feature-list">{allItems.slice(2, 6).map((item, index) => <Link href={`/top9/${item.slug}`} key={item.slug}><b>0{index + 1}</b><img src={item.img} alt="" /><div><small>{["Movies", "Sports", "Travel", "Technology"][index]}</small><strong>{listTitle(item)}</strong><p>5 min read</p></div></Link>)}</div></div></div></section>

    <section className="t9-trust-section"><div className="t9-container"><Eyebrow>Our process</Eyebrow><h2>Why Trust Top9</h2><div className="t9-trust-process">{[[Search, "We research", "Every list starts with hours of digging specs, reviews, real user feedback."], [Sparkles, "We compare", "Every option is measured side by side against the same criteria."], [Star, "We rank", "Only the best nine make the cut no filler, no sponsored placement."], [Check, "You choose", "You get a shortlist you can trust, and a decision you can make fast."]].map(([Icon, title, copy]) => <div key={title}><i><Icon size={23} /></i><strong>{title}</strong><p>{copy}</p></div>)}</div></div></section>

    <section className="t9-container"><div className="t9-newsletter"><Eyebrow>Stay in the top 9</Eyebrow><h2>The best rankings,<br />delivered before you ask for them.</h2><p>One email a week. Nine picks worth reading, every time no spam, no filler.</p>{newsletterSubscribed ? (<p role="status">Saved locally in this browser. This is a demonstration signup — there is no newsletter backend yet, so nothing has actually been sent or subscribed anywhere.</p>) : (<form onSubmit={handleNewsletterSubmit}><input type="email" required aria-label="Email address" placeholder="Enter your email address" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} /><button type="submit">Subscribe</button></form>)}{!newsletterSubscribed && <small>Demonstration signup only — no email delivery exists yet.</small>}</div></section>

    <section className="t9-faq t9-container"><Eyebrow>Good to know</Eyebrow><h2>Frequently Asked Questions</h2><div>{faqs.map(([question, answer], index) => <article className={openFaq === index ? "is-open" : ""} key={question}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}><strong>{question}</strong><ChevronDown size={20} /></button><p>{answer}</p></article>)}</div></section>
  </main>;
}
