import { BookOpen } from "lucide-react";

export default function HistorySection({ festival, wiki }) {
  return (
    <section className="festival-section" id="history">
      <div className="festival-section-inner festival-detail-narrow">
        <div className="section-header">
          <div>
            <p className="section-label">
              <BookOpen size={13} style={{ display: "inline", marginRight: 6 }} />
              History, Origin &amp; Significance
            </p>
            <h2>The Story Behind {festival.name}</h2>
          </div>
        </div>

        <p className="festival-detail-body">
          {wiki?.extract || festival.tagline}
        </p>

        {wiki?.pageUrl ? (
          <p className="festival-detail-attribution">
            Source:{" "}
            <a href={wiki.pageUrl} target="_blank" rel="noreferrer noopener">
              Wikipedia — {wiki.title}
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
