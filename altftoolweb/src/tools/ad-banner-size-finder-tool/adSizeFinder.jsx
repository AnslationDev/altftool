import React, { useState } from "react";

// --- 1. DATA STRUCTURE ---
const bannerSizesData = {
  Google: {
    platform: "Google Display Network",
    description:
      "The most common and effective banner sizes for Google Ads (GDN).",
    sizes: [
      {
        size: "300 x 250",
        name: "Medium Rectangle",
        notes: "Best overall performance, desktop & mobile.",
      },
      {
        size: "336 x 280",
        name: "Large Rectangle",
        notes: "Great for desktop content areas.",
      },
      {
        size: "728 x 90",
        name: "Leaderboard",
        notes: "Commonly placed above main content.",
      },
      {
        size: "300 x 600",
        name: "Half Page",
        notes: "Premium vertical format with high visibility.",
      },
      {
        size: "320 x 50",
        name: "Mobile Leaderboard",
        notes: "Standard for mobile screens.",
      },
    ],
  },
  Facebook: {
    platform: "Facebook & Instagram (Meta Ads)",
    description:
      "Aspect ratios are preferred for in-feed and story ads on Meta platforms.",
    sizes: [
      {
        size: "1:1 Aspect Ratio",
        name: "Square Image/Video",
        notes: "1080x1080px min. Ideal for Feed Ads.",
      },
      {
        size: "9:16 Aspect Ratio",
        name: "Stories/Reels",
        notes: "1080x1920px. Full-screen vertical format.",
      },
      {
        size: "1.91:1 Aspect Ratio",
        name: "Horizontal Link Ad",
        notes: "1200x628px. Standard for link sharing.",
      },
      {
        size: "300 x 250",
        name: "Right Column Ad",
        notes: "Used for desktop sidebar placement.",
      },
    ],
  },
  YouTube: {
    platform: "YouTube",
    description: "Non-video ad sizes for desktop and mobile YouTube pages.",
    sizes: [
      {
        size: "300 x 250",
        name: "Companion/Display Ad",
        notes: "Appears next to the video player.",
      },
      {
        size: "480 x 70",
        name: "Overlay Ad",
        notes: "Appears over the bottom 20% of the video.",
      },
      {
        size: "970 x 250",
        name: "Homepage Masthead",
        notes: "Large, reserved homepage ad (Desktop).",
      },
    ],
  },
  IAB: {
    platform: "General IAB Standards",
    description:
      "Globally accepted standard banner sizes used by various independent ad networks.",
    sizes: [
      {
        size: "468 x 60",
        name: "Full Banner",
        notes: "Older horizontal format.",
      },
      {
        size: "160 x 600",
        name: "Wide Skyscraper",
        notes: "Tall sidebar ad with good visibility.",
      },
      { size: "120 x 600", name: "Skyscraper", notes: "Narrower sidebar ad." },
      {
        size: "970 x 90",
        name: "Large Leaderboard",
        notes: "Extra wide horizontal space.",
      },
    ],
  },
};

// --- 2. REACT COMPONENT ---
function AdSizeFinder() {
  const [selectedPlatform, setSelectedPlatform] = useState("Google");

  const platforms = Object.keys(bannerSizesData);
  const currentData = bannerSizesData[selectedPlatform];

  return (
    <div className="p-4 sm:p-8 bg-(--muted) min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Tool Header */}
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-2">
          Ad Banner Size Finder
        </h1>
        <p className="text-(--muted-foreground) mb-8">
          Lists all standard, up-to-date ad banner sizes for major platforms.
        </p>

        {/* Platform Selection */}
        <div className="mb-8 p-4 bg-(--background) shadow-lg rounded-lg border border-indigo-100">
          <label
            htmlFor="platform-select"
            className="block text-lg font-medium text-(--foreground) mb-2"
          >
            ✅ Select Advertising Platform:
          </label>
          <select
            id="platform-select"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full md:w-1/2 p-3 border border border-(--border) bg-(--background) rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-(--foreground) transition duration-150 ease-in-out"
          >
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {bannerSizesData[platform].platform}
              </option>
            ))}
          </select>
        </div>

        {/* Results Display */}
        <div className="bg-(--background) shadow-xl rounded-xl overflow-hidden">
          <div className="p-6 bg-indigo-600 text-(--foreground)">
            <h2 className="text-2xl font-bold">{currentData.platform} Sizes</h2>
            <p className="text-indigo-200 mt-1">{currentData.description}</p>
          </div>

          <div className="p-4 sm:p-6">
            {/* Responsive Table for Sizes */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-(--muted)">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-bold text-(--muted-foreground) uppercase tracking-wider w-1/4">
                      Size (Pixels/Ratio)
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-(--muted-foreground) uppercase tracking-wider w-1/4">
                      Name
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-(--muted-foreground) uppercase tracking-wider w-1/2">
                      Usage / Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-(--background) divide-y divide-gray-200">
                  {currentData.sizes.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-indigo-50 transition duration-100"
                    >
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-indigo-700">
                          {item.size}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm text-(--foreground)">{item.name}</div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="text-sm text-(--muted-foreground)">
                          {item.notes}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Note for Responsiveness */}
        <p className="mt-8 text-center text-sm text-(--muted-foreground)">
          *Table scrolls horizontally on smaller screens (mobile) for responsive
          design.
        </p>
      </div>
    </div>
  );
}

export default AdSizeFinder;
