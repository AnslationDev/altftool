"use client";
import Image from "next/image";

export default function BlogAds({ ads = [] }) {
  const defaultAds = [
    "/images/adbanner.png",
    "/images/adbanner2.jpg",
    "/images/adbanner3.jpg",
    "/images/adbanner4.png",
    "/images/adbanner5.jpg",
    "/images/adbanner6.gif",
  ];

  const adList = ads.length > 0 ? ads : defaultAds;

  return (
    <aside className="space-y-6 sticky top-24">
      {adList.map((ad, index) => (
        <div
          key={index}
          className="overflow-hidden border shadow-sm"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--card-foreground)",
          }}
        >
          {/* Sponsored Badge */}
          <div
            className="px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: "var(--muted)",
              color: "var(--muted-foreground)",
            }}
          >
            Sponsored
          </div>

          <Image
            src={ad}
            alt={`Advertisement ${index + 1}`}
            width={400}
            height={300}
            className="w-full h-auto object-cover"
          />
        </div>
      ))}
    </aside>
  );
}
