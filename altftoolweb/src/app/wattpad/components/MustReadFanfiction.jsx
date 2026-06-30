"use client";

import AutoScrollRow from "./AutoScrollRow";

export default function MustReadFanfiction({ mustReadData }) {
  return (
    <section className="wp-section">
      <div className="wp-section-header wp-anim-fade-right">
        <h2 className="wp-section-title">
          {mustReadData.title}
        </h2>
        <p className="wp-section-subtitle">
          {mustReadData?.subtitle || "Explore fan-favorite stories loved by readers around the world"}
        </p>
      </div>
      <div className="pt-8">
        <AutoScrollRow items={mustReadData.items} />
        <div className="mt-6">
          <AutoScrollRow items={mustReadData.items} reverse />
        </div>
      </div>
    </section>
  );
}
