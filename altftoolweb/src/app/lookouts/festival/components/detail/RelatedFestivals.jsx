import FestivalGrid from "../shared/FestivalGrid";

export default function RelatedFestivals({ festivals, dates, photos = {} }) {
  if (!festivals.length) return null;

  return (
    <section className="festival-section">
      <div className="festival-section-inner">
        <div className="section-header">
          <div>
            <p className="section-label">Keep Exploring</p>
            <h2>Related Festivals</h2>
          </div>
        </div>
        <FestivalGrid festivals={festivals} dates={dates} photos={photos} />
      </div>
    </section>
  );
}
