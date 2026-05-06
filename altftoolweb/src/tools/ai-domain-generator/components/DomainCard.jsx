"use client";

import { Copy, Check, Star } from "lucide-react";
import { useState, useContext, useMemo } from "react";
import { DomainContext } from "../context/DomainContext";

const LOGO_COLORS = ["#4F46E5", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#0EA5E9"];

const DomainCard = ({ domain, onSelect }) => {
  const [copied, setCopied] = useState(false);
  const { savedDomains, saveDomain } = useContext(DomainContext);

  const domainName = domain?.name || domain;
  const sld = domainName.split(".")[0];
  const tld = domainName.split(".")[1];
  const isSaved = savedDomains.includes(domainName);

  // Generate logo style variations using useMemo to keep consistent per domain
  const logoStyle = useMemo(() => {
    const color1 = LOGO_COLORS[domainName.length % LOGO_COLORS.length];
    const color2 = LOGO_COLORS[(domainName.length + 3) % LOGO_COLORS.length];
    const rotation = (domainName.length * 7) % 15 - 7; // -7 to +7 degrees
    const fontSizes = [14, 16, 18, 20];
    const fontWeights = ["font-bold", "font-extrabold", "italic"];
    const fontSize = fontSizes[domainName.length % fontSizes.length];
    const fontWeight = fontWeights[domainName.length % fontWeights.length];

    return {
      bg: `linear-gradient(135deg, ${color1}, ${color2})`,
      rotation,
      fontSize,
      fontWeight,
    };
  }, [domainName]);

  const logoText = sld.slice(0, 2).toUpperCase();

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(domainName);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleSave = (e) => {
    e.stopPropagation(); // Prevent selecting the card
    saveDomain(domainName);
  };

  return (
    <div
      onClick={() =>
        onSelect &&
        onSelect({
          domain: domainName,
          length: domainName.length,
          keywordBreakdown: sld.split(/(?=[A-Z])|[-_]/),
          brandScore: Math.floor(Math.random() * 40) + 60,
          similar: [domainName + "ly", "get" + domainName, domainName + "app"],
          meaning: `A platform where ${sld} is built and visualized.`,
        })
      }
      className="p-5 rounded-2xl border border-(--border) bg-(--card) flex flex-col justify-between cursor-pointer 
                 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 relative group"
    >
      {/* LOGO PREVIEW */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white select-none`}
        style={{
          background: logoStyle.bg,
          transform: `rotate(${logoStyle.rotation}deg)`,
          fontSize: logoStyle.fontSize,
          fontWeight: logoStyle.fontWeight.replace("font-", ""), // Tailwind class applied via style
        }}
      >
        {logoText}
      </div>

      {/* DOMAIN INFO */}
      <div className="mb-4">
        <p className="text-lg sm:text-xl font-bold break-all text-(--foreground)">
          {domainName}
        </p>

        <div className="flex items-center gap-3 mt-2 text-xs text-(--foreground)/70">
          <span>{domainName.length} chars</span>
          <span>•</span>
          <span className="uppercase">{tld}</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-between gap-2">
        {/* COPY BUTTON */}
        <button
          onClick={handleCopy}
          className={`flex-1 px-3 py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition 
                      ${copied
                        ? "bg-green-500 text-white"
                        : "bg-(--background) hover:bg-(--primary) hover:text-white"
                      }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition
                      ${isSaved
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-(--background) text-(--foreground)/70 hover:bg-yellow-100 hover:text-yellow-600"
                      }`}
        >
          <Star size={16} className={isSaved ? "text-yellow-500" : "text-(--foreground)/50"} />
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default DomainCard;
