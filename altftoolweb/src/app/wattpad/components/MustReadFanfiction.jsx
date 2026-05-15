"use client";

import AutoScrollRow from "./AutoScrollRow";

export default function MustReadFanfiction({ mustReadData }) {
  return (
    <section className="section bg-(--background) ">
      <div className="flex flex-col  animate-slide-right">
        <h2 className="section-title">
          {mustReadData.title}
        </h2>
        <p className="section-subtitle mx-0! font-secondary">
          {mustReadData?.subtitle ||
            "Explore fan-favorite stories loved by readers around the world"}
        </p>
      </div>
      <div className="bg-(--background) rounded-3xl pt-10">
        {/* ROW 1 */}

        <AutoScrollRow items={mustReadData.items} />

        {/* ROW 2 (reverse) */}
        <div className="mt-6">
          <AutoScrollRow items={mustReadData.items} reverse />
        </div>
      </div>
    </section>
  );
}
