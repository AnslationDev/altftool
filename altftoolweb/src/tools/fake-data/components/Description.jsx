// components/Description.jsx
import React from "react";

const cardsData = [
  { icon: "⚡", title: "Fast & Efficient", description: "Generate large amounts of fake data quickly without slowing down your app." },
  { icon: "🔒", title: "Secure", description: "All data is generated locally in your browser. Nothing is sent to the server." },
  { icon: "🎯", title: "Customizable", description: "Select which fields you want and generate exactly the data you need." },
  { icon: "💻", title: "Developer Friendly", description: "Easily copy data in JSON or table format for testing and development." },
  { icon: "🌐", title: "Global Data", description: "Generate realistic addresses, IPs, countries, and more from around the world." },
  { icon: "🎨", title: "Beautiful UI", description: "Responsive and clean interface for seamless experience on any device." },
];

export default function Description() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-(--foreground) mb-2">How it Works ?</h2>
      </div>

      {/* Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {cardsData.map((card, index) => (
    <div
      key={index}
      className="border border-(--border) rounded-xl shadow-md p-6 flex flex-col items-start gap-4 transition-all hover:shadow-xl cursor-pointer"
    >
      <div className="w-full h-full p-4 rounded-lg bg-(--card)">
        <div className="text-4xl mb-2">{card.icon}</div>
        {/* Title with hover effect */}
        <h3 className="font-semibold text-lg text-(--foreground) mb-1 transition-colors hover:text-blue-500">
          {card.title}
        </h3>
        <p className="text-(--muted-foreground)">{card.description}</p>
      </div>
    </div>
  ))}
</div>
    </div>
  );
}