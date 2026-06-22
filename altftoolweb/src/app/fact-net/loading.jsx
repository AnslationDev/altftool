export default function FactNetLoading() {
  return (
    <main className="fn-page">
      <div className="fn-stack">
        <div className="fn-skeleton fn-skeleton-line" />
        <section className="fn-panel">
          <div className="fn-panel-inner fn-stack">
            <div className="fn-skeleton fn-skeleton-title" />
            <div className="fn-skeleton fn-skeleton-line" />
            <div className="fn-skeleton fn-skeleton-line" />
          </div>
        </section>
        <div className="fn-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="fn-panel">
              <div className="fn-card-media">
                <div className="fn-skeleton" />
              </div>
              <div className="fn-panel-inner fn-stack">
                <div className="fn-skeleton fn-skeleton-line" />
                <div className="fn-skeleton fn-skeleton-line" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
