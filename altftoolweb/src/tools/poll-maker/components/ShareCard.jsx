"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";

export default function ShareCard({ question, options, votes }) {
  const cardRef = useRef();

  const downloadImage = async () => {
    const canvas = await html2canvas(cardRef.current);
    const link = document.createElement("a");
    link.download = "poll-card.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const totalVotes = votes.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col items-center justify-center w-full mt-4 gap-3  px-2">
      
      {/* DOWNLOAD BUTTON */}
      <button
        onClick={downloadImage}
        className="px-4 py-2 rounded-xl bg-(--primary) text-white text-sm cursor-pointer mb-2 flex items-center gap-2 hover:scale-105 transition"
      >
        <Download size={16} />
        Download Card
      </button>

      {/* HIDDEN CARD */}
      <div
        ref={cardRef}
        className="w-full max-w-[350px] sm:max-w-[400px]  md:max-w-[450px] p-5 rounded-xl bg-white text-black shadow-lg"
      >
        <h2 className="text-lg font-bold mb-3 text-center">
          {question}
        </h2>

        <div className="space-y-2">
          {options.map((opt, i) => {
            const percent =
              totalVotes === 0
                ? 0
                : Math.round((votes[i] / totalVotes) * 100);

            return (
              <div key={i} className="flex justify-between text-sm">
                <span>{opt}</span>
                <span>{percent}%</span>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-4 text-xs opacity-70">
          Vote Now 
        </div>
      </div>
    </div>
  );
}