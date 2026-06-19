import { Footer } from "@/app/tripfindbox/components/HeroSection";
import ResultsHeader from "@/app/tripfindbox/components/ResultsHeader";

export default function InfoPage({ eyebrow, title, intro, image, sections, children }) {
  return (
    <main className="site-route-page info-page">
      <ResultsHeader />
      <section
        className="info-hero"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(12, 15, 42, 0.42), rgba(12, 15, 42, 0.66)), url(${image})`,
        }}
      >
        <div>
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <span>{intro}</span>
        </div>
      </section>
      <section className="info-content">
        {sections.map((section) => (
          <article key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
        {children}
      </section>
      <Footer />
    </main>
  );
}
