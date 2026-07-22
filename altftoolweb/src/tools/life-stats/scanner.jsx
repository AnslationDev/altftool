// scanner.jsx - Life Stats — Neal.fun style, global CSS compliant
import React, { useState, useRef, useEffect } from 'react';
import {
  Heart, Sparkles, ChevronDown, Zap, TrendingUp,
  RotateCcw, Twitter, Copy, Check, AlertCircle
} from 'lucide-react';

/* ─── Animated Number ───────────────────────────────────────────────────── */
function AnimatedNumber({ value, isVisible, duration = 2200, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  const t0 = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    if (!isVisible || done.current) return;
    if (typeof value === 'string') { setDisplay(value); return; }
    done.current = true;
    t0.current = null;
    const tick = (ts) => {
      if (!t0.current) t0.current = ts;
      const p = Math.min((ts - t0.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.floor(eased * value));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf.current = requestAnimationFrame(tick);
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, [value, isVisible, duration]);

  const fmt = (v) =>
    typeof value === 'string' ? value : typeof v === 'number' ? v.toLocaleString('en-US') : v;

  return <span>{fmt(display)}{suffix}</span>;
}

/* ─── Stat Row ──────────────────────────────────────────────────────────── */
function StatRow({ emoji, value, label, delay = 0, suffix = '' }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); io.unobserve(e.target); } },
      { threshold: 0.1 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className="flex items-center justify-between gap-4 py-5"
      style={{
        borderBottom: '1px solid var(--border)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.55s ease ${delay * 0.001}s, transform 0.55s ease ${delay * 0.001}s`,
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-2xl flex-shrink-0">{emoji}</span>
        <span className="text-sm md:text-base font-medium" style={{ color: 'var(--muted-foreground)', lineHeight: 1.4 }}>
          {label}
        </span>
      </div>
      <div
        className="font-black tabular-nums flex-shrink-0"
        style={{ fontSize: 'clamp(20px,3.5vw,32px)', letterSpacing: '-0.03em', color: 'var(--foreground)' }}
      >
        <AnimatedNumber value={value} isVisible={visible} suffix={suffix} />
      </div>
    </div>
  );
}

/* ─── Section Label ─────────────────────────────────────────────────────── */
function SectionLabel({ emoji, title }) {
  return (
    <div className="flex items-center gap-2 mt-12 mb-1 pb-3" style={{ borderBottom: '2px solid var(--foreground)' }}>
      <span className="text-lg">{emoji}</span>
      <span className="font-black" style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--foreground)' }}>
        {title}
      </span>
    </div>
  );
}

/* ─── Stats Calculator ──────────────────────────────────────────────────── */
function calculateStats(birthDate) {
  const now = new Date();
  const birth = new Date(birthDate);
  const ms = now - birth;
  const days = ms / 864e5;
  const years = days / 365.25;
  const hours = days * 24;
  const minutes = hours * 60;
  return {
    years: Math.floor(years), days: Math.floor(days),
    hours: Math.floor(hours), minutes: Math.floor(minutes),
    heartbeats: Math.floor(minutes * 80),
    breaths: Math.floor(minutes * 16),
    blinks: Math.floor(minutes * 15),
    steps: Math.floor(days * 8000),
    sleepNights: Math.floor(days),
    sleepHours: Math.floor(days * 8),
    dreams: Math.floor(days * 5),
    nailGrowth: parseFloat((days * 0.1).toFixed(1)),
    hairGrowth: parseFloat((days * 0.35).toFixed(1)),
    meals: Math.floor(days * 3),
    coffee: Math.floor(days * 1.5),
    waterLiters: Math.floor(days * 2),
    pizza: Math.floor(days * 0.03),
    showers: Math.floor(days),
    haircuts: Math.floor(years * 6),
    laughs: Math.floor(days * 15),
    words: Math.floor(days * 7000),
    tvHours: Math.floor(days * 2.5),
    songs: Math.floor(days * 30),
    earthOrbits: parseFloat((days / 365.25).toFixed(2)),
    spaceMilesB: parseFloat((days * 1_600_000 / 1_000_000_000).toFixed(2)),
    fullMoons: Math.floor(days / 29.5),
    weekends: Math.floor(days / 7) * 2,
    leapYears: Math.floor(years / 4),
    sunrises: Math.floor(days),
    seasons: Math.floor(years * 4),
  };
}

/* ─── Hero Age ──────────────────────────────────────────────────────────── */
function HeroAge({ stats }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), 120); io.unobserve(e.target); } },
      { threshold: 0.2 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="text-center"
      style={{
        padding: 'clamp(48px,10vw,100px) 0 clamp(32px,6vw,64px)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        transition: 'opacity 0.9s ease, transform 0.9s ease',
      }}
    >
      <p className="font-medium mb-3" style={{ color: 'var(--muted-foreground)', fontSize: '17px' }}>
        You have been alive for
      </p>
      <div
        className="font-black leading-none"
        style={{ fontSize: 'clamp(72px,18vw,152px)', letterSpacing: '-0.05em', color: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}
      >
        <AnimatedNumber value={stats.years} isVisible={visible} duration={1800} />
      </div>
      <p className="font-semibold mt-3" style={{ fontSize: 'clamp(20px,3.5vw,28px)', color: 'var(--muted-foreground)' }}>
        years
      </p>
      <p className="mt-4" style={{ fontSize: '13px', color: 'var(--muted-foreground)', letterSpacing: '0.02em' }}>
        {stats.days.toLocaleString()} days &nbsp;·&nbsp; {stats.hours.toLocaleString()} hours &nbsp;·&nbsp; {stats.minutes.toLocaleString()} minutes
      </p>
    </div>
  );
}

/* ─── Landing: Step Card ────────────────────────────────────────────────── */
function StepCard({ num, emoji, title, desc }) {
  return (
    <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3">
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >{num}</span>
        <span className="text-2xl">{emoji}</span>
      </div>
      <p className="font-bold text-base" style={{ color: 'var(--foreground)' }}>{title}</p>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
    </div>
  );
}

/* ─── Landing: Sample Pill ──────────────────────────────────────────────── */
function SamplePill({ emoji, value, label }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <span className="text-xl">{emoji}</span>
      <div>
        <p className="font-black text-base leading-none" style={{ color: 'var(--foreground)' }}>{value}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      </div>
    </div>
  );
}

/* ─── Date Input Form (shared between hero + bottom CTA) ───────────────── */
function DateForm({ birthDate, setBirthDate, loading, error, onSubmit, today }) {
  return (
    <div
      className="rounded-2xl p-6 md:p-8 mx-auto w-full"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', maxWidth: '440px' }}
    >
      <label
        className="block text-left font-bold mb-2"
        style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}
      >
        Date of Birth
      </label>
      <input
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        max={today}
        min="1900-01-01"
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        className="w-full px-4 py-4 rounded-xl text-center font-bold text-lg focus:outline-none transition-all"
        style={{
          background: 'var(--background)',
          border: '2px solid var(--border)',
          color: 'var(--foreground)',
          fontFamily: 'inherit',
          marginBottom: error ? '8px' : '16px',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
      />
      {error && (
        <p className="flex items-center gap-1 text-sm mb-4" style={{ color: '#ef4444' }}>
          <AlertCircle size={13} /> {error}
        </p>
      )}
      <button
        onClick={onSubmit}
        disabled={loading}
        className="btn-primary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
        style={{ fontSize: '16px', opacity: loading ? 0.75 : 1 }}
      >
        {loading ? (
          <>
            <span style={{
              width: 18, height: 18,
              border: '2.5px solid var(--primary-foreground)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'ls-spin 0.7s linear infinite',
            }} />
            Calculating your life...
          </>
        ) : <>Reveal My Stats &nbsp;→</>}
      </button>
      <p className="text-center text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>
        No data stored · Runs 100% in your browser
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function LifeStats() {
  const [birthDate, setBirthDate] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const formRef = useRef(null);
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = () => {
    setError('');
    if (!birthDate) return setError('Please enter your birth date');
    const birth = new Date(birthDate);
    if (birth > new Date()) return setError('Birth date cannot be in the future');
    if (birth < new Date('1900-01-01')) return setError('Please enter a valid date');
    setLoading(true);
    setTimeout(() => {
      setStats(calculateStats(birthDate));
      setLoading(false);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    }, 750);
  };

  const reset = () => { setStats(null); setBirthDate(''); setError(''); };

  const copyStats = () => {
    if (!stats) return;
    navigator.clipboard.writeText(
      `My Life Stats 🎉\n` +
      `• ${stats.years} years old\n` +
      `• ${stats.heartbeats.toLocaleString()} heartbeats\n` +
      `• ${stats.breaths.toLocaleString()} breaths taken\n` +
      `• ${stats.steps.toLocaleString()} steps walked\n` +
      `• ${stats.dreams.toLocaleString()} dreams experienced\n` +
      `• ${stats.earthOrbits} trips around the Sun`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const shareTwitter = () => {
    if (!stats) return;
    const t = `I'm ${stats.years} years old — that's ${stats.heartbeats.toLocaleString()} heartbeats! ❤️ Discover your life in numbers:`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}`, '_blank');
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  /* ── RESULTS ─────────────────────────────────────────────────────────── */
  if (stats) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        {/* Sticky nav */}
        <div
          className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-3"
          style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}
        >
          <span className="font-black" style={{ fontSize: '17px', letterSpacing: '-0.03em', color: 'var(--foreground)' }}>
            Life Stats
          </span>
          <div className="flex items-center gap-2">
            <button onClick={shareTwitter} className="btn-secondary flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold">
              <Twitter size={14} /><span className="hidden sm:inline">Share</span>
            </button>
            <button onClick={copyStats} className="btn-secondary flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button onClick={reset} className="btn-secondary flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold">
              <RotateCcw size={14} /><span className="hidden sm:inline">New Date</span>
            </button>
          </div>
        </div>

        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 20px 80px' }}>
          <HeroAge stats={stats} />

          <SectionLabel emoji="💓" title="Your Body" />
          <StatRow emoji="❤️" value={stats.heartbeats} label="Times your heart has beaten" delay={0} />
          <StatRow emoji="🌬️" value={stats.breaths} label="Breaths you've taken" delay={50} />
          <StatRow emoji="👁️" value={stats.blinks} label="Times you've blinked" delay={100} />
          <StatRow emoji="🚶" value={stats.steps} label="Steps you've walked" delay={150} />
          <StatRow emoji="💅" value={stats.nailGrowth} label="Fingernail growth" suffix="mm" delay={200} />
          <StatRow emoji="💇" value={stats.hairGrowth} label="Hair grown" suffix="mm" delay={250} />

          <SectionLabel emoji="🌙" title="Sleep & Dreams" />
          <StatRow emoji="😴" value={stats.sleepNights} label="Nights you've slept" delay={0} />
          <StatRow emoji="🛌" value={stats.sleepHours} label="Hours spent sleeping" delay={50} />
          <StatRow emoji="💭" value={stats.dreams} label="Dreams you've experienced" delay={100} />

          <SectionLabel emoji="🍽️" title="Food & Drink" />
          <StatRow emoji="🍽️" value={stats.meals} label="Meals you've eaten" delay={0} />
          <StatRow emoji="☕" value={stats.coffee} label="Cups of coffee consumed" delay={50} />
          <StatRow emoji="💧" value={stats.waterLiters} label="Litres of water drunk" suffix="L" delay={100} />
          <StatRow emoji="🍕" value={stats.pizza} label="Pizzas eaten" delay={150} />

          <SectionLabel emoji="📅" title="Daily Life" />
          <StatRow emoji="🚿" value={stats.showers} label="Showers taken" delay={0} />
          <StatRow emoji="✂️" value={stats.haircuts} label="Haircuts" delay={50} />
          <StatRow emoji="😂" value={stats.laughs} label="Times you've laughed" delay={100} />
          <StatRow emoji="💬" value={stats.words} label="Words you've spoken" delay={150} />
          <StatRow emoji="📺" value={stats.tvHours} label="Hours of TV watched" suffix="h" delay={200} />
          <StatRow emoji="🎵" value={stats.songs} label="Songs you've heard" delay={250} />

          <SectionLabel emoji="🌌" title="The Universe" />
          <StatRow emoji="🌍" value={stats.earthOrbits} label="Trips around the Sun" delay={0} />
          <StatRow emoji="🚀" value={stats.spaceMilesB} label="Billion miles through space" suffix="B mi" delay={50} />
          <StatRow emoji="🌕" value={stats.fullMoons} label="Full moons witnessed" delay={100} />
          <StatRow emoji="🌅" value={stats.sunrises} label="Sunrises you could have seen" delay={150} />
          <StatRow emoji="🍂" value={stats.seasons} label="Seasons lived through" delay={200} />

          <SectionLabel emoji="🗓️" title="Calendar" />
          <StatRow emoji="🎉" value={stats.weekends} label="Weekend days" delay={0} />
          <StatRow emoji="📅" value={stats.leapYears} label="Leap years" delay={50} />

          {/* Bottom actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-16">
            <button onClick={shareTwitter} className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold">
              <Twitter size={16} /> Share on Twitter
            </button>
            <button onClick={copyStats} className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold">
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy Stats'}
            </button>
            <button onClick={reset} className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold">
              <RotateCcw size={16} /> Try Another Date
            </button>
          </div>
        </div>

        <style>{`@keyframes ls-spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── LANDING PAGE ────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* ── HERO ── */}
      <div className="section" style={{ paddingTop: 'clamp(56px,10vw,96px)', paddingBottom: 'clamp(48px,8vw,72px)' }}>
        <div className="section-header">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: 'var(--section-highlight)', border: '1px solid var(--border)' }}
          >
            <Sparkles size={12} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Free · Instant · Private
            </span>
          </div>

          {/* Headline */}
          <h1 className="section-title" style={{ fontSize: 'clamp(34px,7vw,68px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.08 }}>
            Your Life,{' '}
            <span className="text-gradient-hero">in Numbers</span>
          </h1>

          <p className="section-subtitle">
            Enter your date of birth and discover the incredible story hidden inside your life — every heartbeat, every breath, every trip around the Sun — calculated instantly in your browser.
          </p>

          {/* Form */}
          <div ref={formRef} className="mt-8">
            <DateForm
              birthDate={birthDate}
              setBirthDate={setBirthDate}
              loading={loading}
              error={error}
              onSubmit={handleSubmit}
              today={today}
            />
          </div>

          {/* Scroll nudge */}
          <div className="flex justify-center mt-10">
            <button
              onClick={scrollToForm}
              className="flex flex-col items-center gap-1"
              style={{ color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>See what's inside</span>
              <ChevronDown size={18} style={{ animation: 'ls-bounce 1.6s ease-in-out infinite', color: 'var(--muted-foreground)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── SAMPLE STATS PREVIEW ── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="rounded-2xl p-6 md:p-8" style={{ background: 'var(--section-highlight)', border: '1px solid var(--border)' }}>
          <p
            className="text-center font-bold mb-6"
            style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}
          >
            Preview — Someone born in 1990
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <SamplePill emoji="❤️" value="1,576,800,000" label="Heartbeats" />
            <SamplePill emoji="🌬️" value="315,360,000" label="Breaths taken" />
            <SamplePill emoji="👁️" value="295,650,000" label="Times blinked" />
            <SamplePill emoji="🚶" value="109,500,000" label="Steps walked" />
            <SamplePill emoji="😴" value="13,505" label="Nights slept" />
            <SamplePill emoji="🌍" value="35.0" label="Trips around the Sun" />
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div className="section">
        <div className="section-container" style={{ maxWidth: '840px' }}>
          <div className="section-header">
            <h2 className="section-title">What is Life Stats?</h2>
            <p className="section-subtitle">
              Life Stats transforms your birthday into a vivid, numerical portrait of your existence. From the biological — heartbeats, breaths, blinks — to the cosmic — miles through space, trips around the Sun — it surfaces the breathtaking scale hidden inside an ordinary human life.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { icon: <Heart size={20} />, title: '6 stat categories', desc: 'Body · Sleep · Food · Daily Life · Universe · Calendar — each section tells a distinct chapter of your story.' },
              { icon: <Zap size={20} />, title: 'Instant & private', desc: 'All calculations happen entirely in your browser. Zero servers, zero accounts, zero waiting.' },
              { icon: <TrendingUp size={20} />, title: '25+ unique stats', desc: 'From pizza eaten to full moons witnessed — every number is grounded in real-world average data.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="mb-3" style={{ color: 'var(--primary)' }}>{icon}</div>
                <p className="font-bold mb-1" style={{ color: 'var(--foreground)', fontSize: '15px' }}>{title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="section" style={{ background: 'var(--section-highlight)' }}>
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three steps. Ten seconds. A lifetime of numbers.</p>
        </div>
        <div className="section-container mt-8" style={{ maxWidth: '900px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StepCard
              num="1" emoji="📅"
              title="Enter your date of birth"
              desc="Pick any date from 1900 to today. Your data is never sent anywhere — it stays entirely on your device."
            />
            <StepCard
              num="2" emoji="⚡"
              title="We crunch the numbers"
              desc="Our calculator instantly computes 25+ stats using scientifically-backed averages for heartbeats, breaths, steps, sleep, and more."
            />
            <StepCard
              num="3" emoji="🎉"
              title="Discover your life"
              desc="Scroll through beautifully animated numbers and share your most surprising stats with friends and family."
            />
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">What You'll Discover</h2>
          <p className="section-subtitle">Every category reveals a different dimension of your life.</p>
        </div>
        <div className="section-container mt-8" style={{ maxWidth: '860px' }}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { emoji: '💓', name: 'Your Body', items: 'Heartbeats, breaths, blinks, steps, hair & nail growth' },
              { emoji: '🌙', name: 'Sleep & Dreams', items: 'Nights slept, total sleep hours, dreams experienced' },
              { emoji: '🍽️', name: 'Food & Drink', items: 'Meals eaten, coffee cups, litres of water, pizzas' },
              { emoji: '📅', name: 'Daily Life', items: 'Showers, haircuts, laughs, words spoken, TV hours, songs' },
              { emoji: '🌌', name: 'The Universe', items: 'Trips around the Sun, miles in space, full moons, seasons' },
              { emoji: '🗓️', name: 'Calendar', items: 'Weekend days, leap years, sunrises witnessed' },
            ].map(({ emoji, name, items }) => (
              <div key={name} className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <p className="text-2xl mb-2">{emoji}</p>
                <p className="font-bold text-sm mb-1" style={{ color: 'var(--foreground)' }}>{name}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{items}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="section" style={{ background: 'var(--section-highlight)' }}>
        <div className="section-header">
          <h2 className="section-title">Frequently Asked</h2>
        </div>
        <div className="section-container mt-8" style={{ maxWidth: '680px' }}>
          {[
            {
              q: 'How accurate are the numbers?',
              a: 'All stats use peer-reviewed averages — 80 bpm resting heart rate, 16 breaths per minute, 8,000 steps per day and so on. Your actual numbers vary, but the scale is always surprisingly real.',
            },
            {
              q: 'Is my birthday data stored anywhere?',
              a: 'No. Every calculation runs entirely in your browser. We never send your date of birth to any server.',
            },
            {
              q: 'Why are some numbers estimates?',
              a: 'Stats like meals, coffee, or TV hours are based on global averages from health and lifestyle surveys. They\'re meant to be thought-provoking, not a personal diary.',
            },
            {
              q: 'Can I share my results?',
              a: 'Yes! Use the Share button to post to Twitter, or Copy to grab a text summary you can paste anywhere.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="py-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="font-bold mb-2" style={{ color: 'var(--foreground)', fontSize: '15px' }}>{q}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Ready to see your numbers?</h2>
          <p className="section-subtitle">It takes 10 seconds. The result will stay with you.</p>
          <div className="mt-8">
            <DateForm
              birthDate={birthDate}
              setBirthDate={setBirthDate}
              loading={loading}
              error={error}
              onSubmit={handleSubmit}
              today={today}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ls-spin { to { transform: rotate(360deg); } }
        @keyframes ls-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </div>
  );
}