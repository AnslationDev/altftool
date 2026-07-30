import { motion } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, MoveHorizontal } from "lucide-react";

const pairs = [
  {
    title: "Coastal Color Revival",
    location: "Charleston, SC",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Modern Farmhouse Upgrade",
    location: "Austin, TX",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Heritage Home Restoration",
    location: "Boston, MA",
    image: "https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?auto=format&fit=crop&w=1400&q=80",
  },
];

function Slider({ pair }) {
  const [pos, setPos] = useState(50);
  const [boxW, setBoxW] = useState(0);
  const ref = useRef(null);
  const dragging = useRef(false);

  const measure = useCallback(() => {
    if (ref.current) setBoxW(ref.current.clientWidth);
  }, []);

  const move = useCallback((clientX) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, x)));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      move(cx);
    };
    const onUp = () => (dragging.current = false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [move]);

  return (
    <div
      ref={ref}
      className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden select-none shadow-premium cursor-ew-resize"
      onMouseDown={(e) => { dragging.current = true; move(e.clientX); }}
      onTouchStart={(e) => { dragging.current = true; move(e.touches[0].clientX); }}
    >
      <img src={pair.image} alt="After siding transformation" className="absolute inset-0 w-full h-full object-cover saturate-125 contrast-110 brightness-105" onLoad={measure} />
      <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 via-transparent to-surface/10 pointer-events-none" />
      <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-secondary text-primary-foreground text-xs font-bold tracking-wider uppercase shadow-lg z-10">
        After
      </span>

      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={pair.image}
          alt="Before siding transformation"
          className="absolute inset-0 h-full object-cover grayscale sepia brightness-[0.72] contrast-[0.82] saturate-[0.55]"
          style={{ width: `${boxW || 1000}px` }}
        />
        <div className="absolute inset-0 before-aging-overlay opacity-45 mix-blend-multiply" />
        <div className="absolute inset-0 before-stripe-overlay opacity-25" />
        <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold tracking-wider uppercase shadow-lg">
          Before
        </span>
      </div>

      {/* Handle */}
      <div className="absolute top-0 bottom-0 w-1 before-after-handle z-20" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-surface shadow-xl flex items-center justify-center text-primary">
          <MoveHorizontal className="w-5 h-5" />
        </div>
      </div>

      {/* Title overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6 bg-gradient-to-t from-primary/95 to-transparent text-primary-foreground">
        <h3 className="font-display font-bold text-xl">{pair.title}</h3>
        <div className="text-sm text-primary-foreground/80">{pair.location}</div>
      </div>
    </div>
  );
}

export default function BeforeAfter() {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((i) => (i + 1) % pairs.length);
  const prev = () => setIdx((i) => (i - 1 + pairs.length) % pairs.length);

  return (
    <section className="pt-12 pb-4 lg:pt-16 lg:pb-6 bg-gradient-soft">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4">
            Before & After
          </div>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-primary leading-tight">
            See the Difference Quality Makes
          </h2>
          <p className="mt-5 text-lg text-foreground/75">
            Drag the slider to compare a weathered look with a refreshed finish — an illustrative
            style comparison, not two different job sites.
          </p>
        </motion.div>

        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Slider pair={pairs[idx]} />
        </motion.div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={prev} className="w-11 h-11 rounded-full bg-surface border border-border hover:border-secondary text-primary flex items-center justify-center transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {pairs.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-2 rounded-full transition-all ${i === idx ? "w-8 bg-primary" : "w-2 bg-border"}`}
              />
            ))}
          </div>
          <button onClick={next} className="w-11 h-11 rounded-full bg-surface border border-border hover:border-secondary text-primary flex items-center justify-center transition">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
