import React from "react";

export default function Description() {
  const cards = [
    {
      title: "Check Server Connection",
      desc: "Tool nearest server se connect karta hai accurate speed test ke liye.",
    },
    {
      title: "Measure Download Speed",
      desc: "Large files download karke internet ki receiving speed calculate karta hai.",
    },
    {
      title: "Measure Upload Speed",
      desc: "Device se data upload karke upload performance check karta hai.",
    },
    {
      title: "Calculate Ping",
      desc: "Server ko request bhejkar response time measure karta hai.",
    },
    {
      title: "Analyze Stability",
      desc: "Speed fluctuation detect karke connection stability check karta hai.",
    },
    {
      title: "Show Final Results",
      desc: "Download, upload aur ping results instantly display karta hai.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-10 mt-[-70]">
        How It Works ?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-(--card) border border-(--border) rounded-2xl p-6 shadow-md hover:shadow-xl transition hover:-translate-y-2"
          >
            {/*  Sirf title blue */}
            <h3 className="text-lg font-semibold mb-3 text-blue-600">
              {card.title}
            </h3>

            {/* Normal description */}
            <p className="text-sm text-(--muted-foreground)">
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}