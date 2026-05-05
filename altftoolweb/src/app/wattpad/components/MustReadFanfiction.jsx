"use client";

import AutoScrollRow from "./AutoScrollRow";

export default function MustReadFanfiction({ mustReadData }) {
  return (
    <section className="section bg-(--background) ">
      <div className="mb-6 md:mb-8">
        <h2 className="section-title md:text-4xl font-bold ">
          {mustReadData.title}
        </h2>
        <p className="text-(--muted-foreground) text-sm md:text-lg">
          {mustReadData?.subtitle ||
            "Explore fan-favorite stories loved by readers around the world"}
        </p>
      </div>
      <div className="bg-(--flashsale-salelocator) rounded-3xl py-10 px-6">
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
