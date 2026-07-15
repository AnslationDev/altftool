export default function Description() {
  return (
    <section className="mt-12 max-w-3xl mx-auto">
      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-md">
        <h2 className="text-lg font-semibold mb-3">About the Lucky Number Generator</h2>
        <div className="space-y-3 text-sm text-(--muted-foreground) leading-relaxed">
          <p>
            Our Lucky Number Generator helps you find meaningful numbers for games, lotteries,
            personal decisions, or just for fun. Choose from multiple generation modes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-(--foreground)">Random:</strong> Generate unique or repeatable random numbers within any range.</li>
            <li><strong className="text-(--foreground)">Lottery:</strong> Create complete lottery ticket sets with main and bonus numbers for Powerball, Mega Millions, EuroMillions, and more.</li>
            <li><strong className="text-(--foreground)">Horoscope:</strong> Get daily lucky numbers based on your zodiac sign and astrological influences.</li>
            <li><strong className="text-(--foreground)">Numerology:</strong> Calculate your life path, destiny, soul urge, and personality numbers from your birth date.</li>
            <li><strong className="text-(--foreground)">Custom:</strong> Full control over range, count, repeats, and whether to include zero.</li>
          </ul>
          <p>
            Save your favorite combinations and track your generation history — all stored locally
            in your browser for quick access.
          </p>
        </div>
      </div>
    </section>
  );
}
