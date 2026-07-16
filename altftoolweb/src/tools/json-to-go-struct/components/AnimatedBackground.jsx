export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className="pp-float absolute left-[7%] top-24 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pp-float absolute right-[8%] top-32 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl [animation-delay:2s]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
      {Array.from({ length: 18 }).map((_, index) => (
        <span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-cyan-300/50"
          style={{
            left: `${(index * 19) % 100}%`,
            top: `${16 + ((index * 29) % 70)}%`,
            opacity: 0.25 + (index % 4) * 0.12,
          }}
        />
      ))}
    </div>
  );
}
