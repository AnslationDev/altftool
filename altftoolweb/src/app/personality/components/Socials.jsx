"use client";

export default function Socials() {
  const brands = [
    {
      name: "coinbase",
      svg: (
        <svg
          viewBox="0 0 190 60"
          fill="none"
          className="h-15 md:h-15 w-auto"
          style={{ color: "var(--muted-foreground)" }}
        >
          <text
            x="0"
            y="42"
            fontFamily="'Manrope',sans-serif"
            fontSize="34"
            fontWeight="700"
            fill="currentColor"
            letterSpacing="-1"
          >
            coinbase
          </text>
        </svg>
      ),
    },

    {
      name: "Spotify",
      svg: (
        <svg
          viewBox="0 0 180 60"
          fill="none"
          className="h-15 md:h-15 w-auto"
          style={{ color: "var(--muted-foreground)" }}
        >
          <circle cx="24" cy="30" r="20" fill="currentColor" />

          <path
            d="M15 24c7-2 15-1 20 2"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M16 30c6-1.5 13-1 18 1.5"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M18 36c5-1 10-0.5 14 1"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <text
            x="52"
            y="40"
            fontFamily="'Manrope',sans-serif"
            fontSize="30"
            fontWeight="700"
            fill="currentColor"
            letterSpacing="-1"
          >
            Spotify
          </text>
        </svg>
      ),
    },

    {
      name: "slack",
      svg: (
        <svg
          viewBox="0 0 150 60"
          fill="none"
          className="h-15 md:h-15 w-auto"
          style={{ color: "var(--muted-foreground)" }}
        >
          {/* Slack icon */}
          <g transform="translate(0,10)">
            <rect
              x="8"
              y="0"
              width="8"
              height="18"
              rx="4"
              fill="currentColor"
            />
            <rect
              x="8"
              y="20"
              width="8"
              height="18"
              rx="4"
              fill="currentColor"
            />

            <rect
              x="0"
              y="12"
              width="18"
              height="8"
              rx="4"
              fill="currentColor"
            />
            <rect
              x="20"
              y="12"
              width="18"
              height="8"
              rx="4"
              fill="currentColor"
            />
          </g>

          <text
            x="52"
            y="40"
            fontFamily="'Manrope',sans-serif"
            fontSize="30"
            fontWeight="700"
            fill="currentColor"
            letterSpacing="-1"
          >
            slack
          </text>
        </svg>
      ),
    },

    {
      name: "Dropbox",
      svg: (
        <svg
          viewBox="0 0 210 60"
          fill="none"
          className="h-15 md:h-15 w-auto"
          style={{ color: "var(--muted-foreground)" }}
        >
          <g transform="translate(0,8)">
            <polygon points="10,10 22,2 34,10 22,18" fill="currentColor" />
            <polygon points="36,10 48,2 60,10 48,18" fill="currentColor" />
            <polygon points="10,26 22,18 34,26 22,34" fill="currentColor" />
            <polygon points="36,26 48,18 60,26 48,34" fill="currentColor" />
          </g>

          <text
            x="74"
            y="40"
            fontFamily="'Manrope',sans-serif"
            fontSize="30"
            fontWeight="700"
            fill="currentColor"
            letterSpacing="-1"
          >
            Dropbox
          </text>
        </svg>
      ),
    },

    {
      name: "webflow",
      svg: (
        <svg
          viewBox="0 0 170 60"
          fill="none"
          className="h-15 md:h-15 w-auto"
          style={{ color: "var(--muted-foreground)" }}
        >
          <text
            x="0"
            y="40"
            fontFamily="'Manrope',sans-serif"
            fontSize="30"
            fontWeight="800"
            fontStyle="italic"
            fill="currentColor"
            letterSpacing="-1"
          >
            webflow
          </text>
        </svg>
      ),
    },

    {
      name: "zoom",
      svg: (
        <svg
          viewBox="0 0 120 60"
          fill="none"
          className="h-15 md:h-15 w-auto"
          style={{ color: "var(--muted-foreground)" }}
        >
          <text
            x="0"
            y="40"
            fontFamily="'Manrope',sans-serif"
            fontSize="30"
            fontWeight="700"
            fill="currentColor"
            letterSpacing="-1"
          >
            zoom
          </text>
        </svg>
      ),
    },
  ];

  return (
    <section
      className="w-full py-10"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="flex items-center justify-between gap-10 overflow-x-auto scrollbar-hide">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex-shrink-0 opacity-90 hover:opacity-100 transition"
            >
              {brand.svg}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}