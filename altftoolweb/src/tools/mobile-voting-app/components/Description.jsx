"use client";

import React from "react";

const features = [
  { title: "Create Poll", description: "Set up a poll with a title, description, and multiple voting options in seconds." },
  { title: "Collect Votes", description: "Participants can cast their vote with a single tap. Single vote per user is enforced." },
  { title: "Real-Time Results", description: "See live vote counts, percentages, and animated progress bars as votes come in." },
  { title: "Admin Controls", description: "Close, reopen, reset votes, or delete polls entirely from the admin panel." },
  { title: "Search & Filter", description: "Find polls instantly by name, filter by status, or sort by date." },
  { title: "Export Data", description: "Download poll results as CSV or JSON for sharing and reporting." },
];

const Description = () => {
  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="section-title">How It Works?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                bg-(--card)
                rounded-2xl
                shadow-md
                border border-(--border)
                py-6 px-8
                flex flex-col
                justify-center
                w-full
                hover:shadow-xl
                hover:-translate-y-2
                transition-all duration-300
              "
            >
              <h3 className="text-xl sm:text-2xl font-bold text-(--foreground) mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-lg text-(--muted-foreground) leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Description;
