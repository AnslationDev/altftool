import React, { useCallback, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Grid2X2,
  Layers3,
  Linkedin,
  Maximize2,
  Minimize2,
  RotateCcw,
  Smartphone,
  Square,
  Star,
  Target,
  UploadCloud,
  Youtube,
} from "lucide-react";

const AD_DATA = {
  "Google Display Network (GDN)": [
    {
      size: "300x250",
      name: "Medium Rectangle",
      orientation: "Square",
      notes: "Most common size. Excellent for general targeting.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
      color: "violet",
    },
    {
      size: "336x280",
      name: "Large Rectangle",
      orientation: "Square",
      notes: "Similar to 300x250, often performs slightly better.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
      color: "blue",
    },
    {
      size: "728x90",
      name: "Leaderboard",
      orientation: "Horizontal",
      notes: "Often used above content on desktop. High visibility.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
      color: "sky",
    },
    {
      size: "300x600",
      name: "Half Page Ad (HPA)",
      orientation: "Vertical",
      notes: "High visibility, large format, great for branding.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
      color: "emerald",
    },
    {
      size: "160x600",
      name: "Wide Skyscraper",
      orientation: "Vertical",
      notes: "Common sidebar ad placement.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
      color: "rose",
    },
    {
      size: "970x90",
      name: "Large Leaderboard",
      orientation: "Horizontal",
      notes: "Premium desktop placement for maximum reach.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
      color: "amber",
    },
    {
      size: "320x100",
      name: "Large Mobile Banner",
      orientation: "Horizontal",
      notes: "Mobile-specific banner size for high CTR.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
      color: "teal",
    },
  ],
  "Facebook / Instagram Feeds": [
    {
      size: "1080x1080",
      name: "Square Feed Image/Video",
      orientation: "Square",
      notes: "Recommended for feeds and reliable cross-platform visibility.",
      maxFileSizeKB: 4096,
      fileFormats: "JPG, PNG, MP4, MOV",
      color: "blue",
    },
    {
      size: "1200x628",
      name: "Landscape Link Ad",
      orientation: "Horizontal",
      notes: "Good for link clicks when showing a wide image.",
      maxFileSizeKB: 4096,
      fileFormats: "JPG, PNG, MP4, MOV",
      color: "sky",
    },
    {
      size: "600x900",
      name: "Portrait Feed Image",
      orientation: "Vertical",
      notes: "Maximizes mobile feed space for stronger impact.",
      maxFileSizeKB: 4096,
      fileFormats: "JPG, PNG, MP4, MOV",
      color: "rose",
    },
    {
      size: "900x1600",
      name: "Full Screen Story/Reel",
      orientation: "Vertical",
      notes: "Used for Stories and Reels. Captures full attention.",
      maxFileSizeKB: 4096,
      fileFormats: "JPG, PNG, MP4, MOV",
      color: "violet",
    },
  ],
  "YouTube Video Ads": [
    {
      size: "300x250",
      name: "Companion Banner",
      orientation: "Square",
      notes: "Appears next to player on desktop for continued visibility.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
      color: "rose",
    },
    {
      size: "480x70",
      name: "Overlay Ad",
      orientation: "Horizontal",
      notes: "Appears on the lower 20% of the video content.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
      color: "amber",
    },
    {
      size: "1280x720",
      name: "Video Resolution",
      orientation: "Horizontal",
      notes: "Recommended minimum resolution for quality video content.",
      maxFileSizeKB: 100000,
      fileFormats: "MP4, MOV, AVI",
      color: "blue",
    },
  ],
  "LinkedIn Ads": [
    {
      size: "300x250",
      name: "Medium Rectangle",
      orientation: "Square",
      notes: "Used in sidebar and feed for quick visual connection.",
      maxFileSizeKB: 2048,
      fileFormats: "JPG, PNG, GIF",
      color: "blue",
    },
    {
      size: "728x90",
      name: "Leaderboard",
      orientation: "Horizontal",
      notes: "Standard desktop banner for awareness campaigns.",
      maxFileSizeKB: 2048,
      fileFormats: "JPG, PNG, GIF",
      color: "sky",
    },
    {
      size: "1200x627",
      name: "Sponsored Content Image",
      orientation: "Horizontal",
      notes: "Standard feed post size, optimal for native appearance.",
      maxFileSizeKB: 2048,
      fileFormats: "JPG, PNG",
      color: "emerald",
    },
  ],
};

const platforms = Object.keys(AD_DATA);
const orientations = ["All", "Horizontal", "Vertical", "Square"];

const platformMeta = {
  "Google Display Network (GDN)": {
    label: "Google",
    icon: "G",
    brand: "text-[#4285f4]",
  },
  "Facebook / Instagram Feeds": {
    label: "Facebook",
    icon: "f",
    brand: "text-[#1877f2]",
  },
  "YouTube Video Ads": {
    label: "YouTube",
    icon: Youtube,
    brand: "text-[#ff0000]",
  },
  "LinkedIn Ads": {
    label: "LinkedIn",
    icon: Linkedin,
    brand: "text-[#0a66c2]",
  },
};

const colorStyles = {
  violet: {
    text: "text-violet-600",
    panel: "from-violet-100 via-fuchsia-50 to-indigo-100",
    block: "from-violet-500 to-indigo-500 border-violet-700",
    pill: "bg-violet-50 text-violet-700",
  },
  blue: {
    text: "text-blue-600",
    panel: "from-sky-100 via-cyan-50 to-blue-100",
    block: "from-sky-500 to-blue-600 border-blue-700",
    pill: "bg-blue-50 text-blue-700",
  },
  sky: {
    text: "text-sky-600",
    panel: "from-cyan-100 via-sky-50 to-blue-100",
    block: "from-cyan-400 to-sky-500 border-sky-700",
    pill: "bg-sky-50 text-sky-700",
  },
  emerald: {
    text: "text-emerald-600",
    panel: "from-emerald-100 via-teal-50 to-green-100",
    block: "from-emerald-400 to-teal-600 border-emerald-700",
    pill: "bg-emerald-50 text-emerald-700",
  },
  rose: {
    text: "text-pink-500",
    panel: "from-rose-100 via-pink-50 to-fuchsia-100",
    block: "from-pink-400 to-rose-500 border-pink-700",
    pill: "bg-pink-50 text-pink-700",
  },
  amber: {
    text: "text-orange-500",
    panel: "from-amber-100 via-yellow-50 to-orange-100",
    block: "from-orange-400 to-amber-400 border-orange-600",
    pill: "bg-orange-50 text-orange-700",
  },
  teal: {
    text: "text-teal-600",
    panel: "from-teal-100 via-cyan-50 to-emerald-100",
    block: "from-teal-400 to-emerald-500 border-teal-700",
    pill: "bg-teal-50 text-teal-700",
  },
};

function parseSize(size) {
  const [width, height] = size.split("x").map(Number);
  return { width: width || 0, height: height || 0 };
}

function formatFileSize(kb) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(kb >= 10000 ? 0 : 1)} MB` : `${kb} KB`;
}

function sortAds(ads, sortBy, direction) {
  return [...ads].sort((a, b) => {
    const aSize = parseSize(a.size);
    const bSize = parseSize(b.size);
    const aValue = sortBy === "area" ? aSize.width * aSize.height : aSize[sortBy];
    const bValue = sortBy === "area" ? bSize.width * bSize.height : bSize[sortBy];
    return direction === "asc" ? aValue - bValue : bValue - aValue;
  });
}

function AdPreview({ ad }) {
  const { width, height } = parseSize(ad.size);
  const ratio = width / height;
  const max = 122;
  const previewWidth = ratio >= 1 ? max : Math.max(30, max * ratio);
  const previewHeight = ratio >= 1 ? Math.max(18, max / ratio) : max;
  const colors = colorStyles[ad.color];

  return (
    <div className={`relative flex h-[128px] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${colors.panel}`}>
      <Bookmark className="absolute right-4 top-3 h-6 w-6 text-blue-600" strokeWidth={2.2} />
      <div
        className={`flex items-center justify-center rounded border-2 bg-gradient-to-br ${colors.block} shadow-[0_12px_22px_rgba(15,23,42,0.18)]`}
        style={{ width: `${previewWidth}px`, height: `${previewHeight}px` }}
      >
        <span className="select-none text-[11px] font-extrabold text-white drop-shadow-sm">
          {ad.size}
        </span>
      </div>
    </div>
  );
}

function OrientationIcon({ orientation, className = "h-4 w-4" }) {
  if (orientation === "Horizontal") return <Minimize2 className={className} />;
  if (orientation === "Vertical") return <Maximize2 className={className} />;
  if (orientation === "Square") return <Square className={className} />;
  return <Grid2X2 className={className} />;
}

function PlatformIcon({ platform }) {
  const meta = platformMeta[platform];
  const Icon = meta.icon;
  if (typeof Icon === "string") {
    return (
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-md text-base font-black leading-none ${meta.brand}`}
      >
        {Icon}
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-md">
      <Icon className={`h-5 w-5 ${meta.brand}`} fill="currentColor" strokeWidth={0} />
    </span>
  );
}

function AdCard({ ad }) {
  const colors = colorStyles[ad.color];

  return (
    <article className="flex min-h-[308px] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(17,24,39,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(17,24,39,0.12)]">
      <AdPreview ad={ad} />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className={`text-2xl font-black leading-none ${colors.text}`}>{ad.size}</h3>
          <p className="mt-1 text-sm font-semibold text-[#25366f]">{ad.size} pixels</p>
        </div>
        <span className={`inline-flex min-w-[74px] items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-bold ${colors.pill}`}>
          <OrientationIcon orientation={ad.orientation} />
          {ad.orientation}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
          <UploadCloud className="h-3.5 w-3.5" />
          {formatFileSize(ad.maxFileSizeKB)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">
          <FileText className="h-3.5 w-3.5" />
          {ad.fileFormats}
        </span>
      </div>
      <div className="mt-4 flex grow flex-col">
        <h4 className="flex items-center gap-2 text-base font-black text-[#10184a]">
          <Layers3 className="h-4 w-4 text-violet-600" />
          {ad.name}
        </h4>
        <p className="mt-2 text-sm font-medium leading-6 text-[#415083]">{ad.notes}</p>
      </div>
    </article>
  );
}

function CustomBannerPreview({ width, height, area }) {
  const resolvedWidth = width || (area ? Math.round(Math.sqrt(area)) : 0);
  const resolvedHeight = height || (area && resolvedWidth ? Math.round(area / resolvedWidth) : 0);
  const canPreview = resolvedWidth > 0 && resolvedHeight > 0;
  const ratio = canPreview ? resolvedWidth / resolvedHeight : 1;
  const maxWidth = 420;
  const maxHeight = 210;
  let previewWidth = maxWidth;
  let previewHeight = maxWidth / ratio;

  if (previewHeight > maxHeight) {
    previewHeight = maxHeight;
    previewWidth = maxHeight * ratio;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 via-sky-50 to-violet-50 p-6 text-center sm:col-span-2 lg:col-span-3">
      <p className="text-sm font-black text-[#25366f]">
        No exact database match found, but here is your custom banner preview.
      </p>
      <div className="mt-6 flex min-h-[250px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 p-6">
        {canPreview ? (
          <div
            className="relative flex items-center justify-center rounded-lg border-2 border-teal-700 bg-gradient-to-br from-teal-400 via-sky-500 to-violet-600 shadow-[0_18px_45px_rgba(15,23,42,0.22)]"
            style={{
              width: `${Math.max(42, previewWidth)}px`,
              height: `${Math.max(28, previewHeight)}px`,
            }}
          >
            <div className="absolute inset-2 rounded-md border border-white/35" />
            <span className="px-3 text-center text-sm font-black text-white drop-shadow">
              {resolvedWidth}x{resolvedHeight}
            </span>
          </div>
        ) : (
          <p className="text-sm font-bold text-[#66709a]">
            Fill width and height to generate a banner preview.
          </p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-black">
        {resolvedWidth ? <span className="rounded-full bg-teal-100 px-3 py-1 text-teal-700">Width {resolvedWidth}px</span> : null}
        {resolvedHeight ? <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Height {resolvedHeight}px</span> : null}
        {resolvedWidth && resolvedHeight ? (
          <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-700">
            Area {resolvedWidth * resolvedHeight}px
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function App() {
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [filterOrientation, setFilterOrientation] = useState("All");
  const [sortBy, setSortBy] = useState("area");
  const [sortDirection, setSortDirection] = useState("asc");
  const [dimensionFilters, setDimensionFilters] = useState({
    width: "",
    height: "",
    area: "",
  });

  const filteredAds = useMemo(() => {
    const platformAds = AD_DATA[selectedPlatform] || [];
    const orientationFiltered =
      filterOrientation === "All"
        ? platformAds
        : platformAds.filter((ad) => ad.orientation === filterOrientation);

    const dimensionFiltered = orientationFiltered.filter((ad) => {
      const { width, height } = parseSize(ad.size);
      const area = width * height;
      const widthValue = Number(dimensionFilters.width);
      const heightValue = Number(dimensionFilters.height);
      const areaValue = Number(dimensionFilters.area);

      if (dimensionFilters.width && width !== widthValue) return false;
      if (dimensionFilters.height && height !== heightValue) return false;
      if (dimensionFilters.area && area !== areaValue) return false;
      return true;
    });

    return sortAds(dimensionFiltered, sortBy, sortDirection);
  }, [dimensionFilters, filterOrientation, selectedPlatform, sortBy, sortDirection]);

  const toggleSort = useCallback(
    (key) => {
      if (key === sortBy) {
        setSortDirection((value) => (value === "asc" ? "desc" : "asc"));
        return;
      }
      setSortBy(key);
      setSortDirection("asc");
    },
    [sortBy]
  );

  const hasDimensionFilter =
    dimensionFilters.width || dimensionFilters.height || dimensionFilters.area;
  const customPreview = {
    width: Number(dimensionFilters.width) || 0,
    height: Number(dimensionFilters.height) || 0,
    area: Number(dimensionFilters.area) || 0,
  };

  const updateDimensionFilter = (key, value) => {
    setDimensionFilters((filters) => ({
      ...filters,
      [key]: value.replace(/\D/g, ""),
    }));
  };

  const resetDimensionFilters = () => {
    setDimensionFilters({ width: "", height: "", area: "" });
  };

  return (
    <div className="min-h-screen bg-[#f6f9ff] text-[#10184a]">
      <section
        className="relative overflow-hidden bg-[#071044] bg-cover bg-center px-4 pb-14 pt-7 text-white sm:px-8"
        style={{ backgroundImage: "url('/ad-banner-size-finder-bg.svg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#071044] via-[#071044]/88 to-[#071044]/12" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#071044] to-transparent" />
        <div className="relative mx-auto flex min-h-[142px] max-w-6xl items-center justify-between gap-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-teal-400 shadow-2xl shadow-cyan-500/20 sm:h-[72px] sm:w-[72px]">
              <BadgeCheck className="h-9 w-9 sm:h-10 sm:w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-[42px]">
                Ad Banner <span className="text-teal-300">Size Finder</span>
              </h1>
              <p className="mt-2 text-sm font-semibold text-indigo-100 sm:text-base">
                Find the perfect ad banner size for every platform
              </p>
            </div>
          </div>
          <div className="hidden h-28 w-[330px] lg:block" aria-hidden="true" />
        </div>
      </section>

      <main className="relative mx-auto -mt-10 max-w-6xl px-2 pb-10 sm:px-6">
        <div className="overflow-hidden rounded-t-2xl bg-white shadow-[0_22px_70px_rgba(15,23,42,0.16)]">
          <div className="space-y-5 p-4 sm:p-6">
            <section className="flex items-center justify-between gap-5 rounded-xl bg-gradient-to-r from-sky-50 via-indigo-50 to-violet-50 p-5">
                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-lg">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white">
                        <Star className="h-6 w-6 fill-white" />
                      </div>
                    </div>
                    <p className="max-w-2xl text-sm font-semibold leading-6 text-[#25366f] sm:text-base">
                      A premium, filterable, and sortable database of the most common and
                      effective digital ad creative sizes across major platforms.
                    </p>
                  </div>
                  <div className="hidden items-end gap-1.5 md:flex">
                    {[20, 32, 44, 58, 78].map((height) => (
                      <span
                        key={height}
                        className="w-3 rounded-t bg-gradient-to-t from-violet-500 to-cyan-400"
                        style={{ height: `${height}px` }}
                      />
                    ))}
                    <Target className="h-12 w-12 text-violet-600" />
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-black">Select Platform</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {platforms.map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => {
                          setSelectedPlatform(platform);
                          setFilterOrientation("All");
                          resetDimensionFilters();
                        }}
                        className={`flex h-12 items-center justify-center gap-3 rounded-lg border px-4 text-sm font-black transition ${
                          selectedPlatform === platform
                            ? "border-teal-500 bg-teal-50 text-teal-700 shadow-[0_10px_24px_rgba(20,184,166,0.16)]"
                            : "border-slate-200 bg-white text-[#10184a] hover:border-indigo-200 hover:bg-slate-50"
                        }`}
                        aria-pressed={selectedPlatform === platform}
                      >
                        <PlatformIcon platform={platform} />
                        {platformMeta[platform].label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-black">Filter & Sort</h2>
                  <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.25fr]">
                    <div>
                      <p className="mb-3 text-sm font-bold text-[#25366f]">Filter by Orientation</p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {orientations.map((orientation) => (
                          <button
                            key={orientation}
                            type="button"
                            onClick={() => setFilterOrientation(orientation)}
                            className={`flex h-14 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-black transition ${
                              filterOrientation === orientation
                                ? "border-teal-500 bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/20"
                                : "border-slate-200 bg-white text-[#10184a] hover:bg-slate-50"
                            }`}
                          >
                            <OrientationIcon orientation={orientation} />
                            {orientation}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-[#25366f]">Filter by Size & Sort</p>
                        {hasDimensionFilter ? (
                          <button
                            type="button"
                            onClick={resetDimensionFilters}
                            className="inline-flex items-center gap-1 text-xs font-black text-teal-700 hover:text-teal-900"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                          </button>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {["width", "height", "area"].map((key) => (
                          <label
                            key={key}
                            className={`flex h-14 items-center rounded-lg border bg-white pl-4 pr-2 transition ${
                              sortBy === key
                                ? "border-teal-200 bg-teal-50 text-teal-700"
                                : "border-slate-200 bg-white text-[#25366f] hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="text"
                              inputMode="numeric"
                              value={dimensionFilters[key]}
                              onChange={(event) => updateDimensionFilter(key, event.target.value)}
                              placeholder={key === "area" ? "Area" : key === "width" ? "Width" : "Height"}
                              aria-label={`Filter by ${key}`}
                              className="min-w-0 flex-1 bg-transparent text-sm font-black capitalize text-[#25366f] outline-none placeholder:text-[#25366f]"
                            />
                            <button
                              type="button"
                              onClick={() => toggleSort(key)}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-teal-700 hover:bg-white"
                              aria-label={`Sort by ${key}`}
                            >
                              {sortBy === key && sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </label>
                        ))}
                      </div>
                      <p className="mt-2 text-xs font-semibold text-[#66709a]">
                        Example: width 300, height 600, or area 180000.
                      </p>
                    </div>
                  </div>
                </section>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <h2 className="flex items-center gap-3 text-xl font-black">
                    <PlatformIcon platform={selectedPlatform} />
                    Sizes for:
                    <span className="text-teal-600">{selectedPlatform}</span>
                  </h2>
                  <span className="text-sm font-bold text-[#66709a]">Showing {filteredAds.length} ads</span>
                </div>

                <section className="grid gap-4 lg:grid-cols-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
                    {filteredAds.map((ad) => (
                      <AdCard key={`${selectedPlatform}-${ad.size}-${ad.name}`} ad={ad} />
                    ))}
                    {filteredAds.length === 0 && (
                      <CustomBannerPreview
                        width={customPreview.width}
                        height={customPreview.height}
                        area={customPreview.area}
                      />
                    )}
                  </div>

                  <aside className="flex min-h-[308px] flex-col justify-between rounded-xl bg-gradient-to-br from-violet-100 via-indigo-100 to-blue-200 p-6">
                    <div>
                      <h3 className="text-xl font-black leading-7 text-violet-800">
                        Not sure <br /> which size <br /> to use?
                      </h3>
                      <p className="mt-4 text-sm font-semibold leading-6 text-[#25366f]">
                        Use multiple sizes to maximise performance across placements.
                      </p>
                    </div>
                    <div className="my-6 flex items-end justify-center gap-4">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-teal-400 to-blue-600 shadow-lg" />
                      <div className="rounded-xl border-4 border-violet-600 bg-white p-4 shadow-xl">
                        <Target className="h-16 w-16 text-violet-600" />
                      </div>
                    </div>
                    <button className="flex h-14 items-center justify-center gap-3 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 px-4 text-sm font-black text-white shadow-xl">
                      Learn Best Practices
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </aside>
                </section>

                <section className="grid gap-4 rounded-xl bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-5 md:grid-cols-3">
                  {[
                    [Smartphone, "Better Performance", "Different sizes perform better on different placements.", "text-blue-600"],
                    [CheckCircle2, "Fast Loading", "Keep creatives under platform limits for faster loading.", "text-teal-600"],
                    [Target, "Smart Targeting", "Test multiple sizes to find what works best.", "text-orange-500"],
                  ].map(([Icon, title, text, color]) => (
                    <div key={title} className="flex items-center gap-5 md:border-r md:border-slate-200 md:last:border-r-0">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                        <Icon className={`h-9 w-9 ${color}`} />
                      </div>
                      <div>
                        <h3 className={`font-black ${color}`}>{title}</h3>
                        <p className="mt-1 text-sm font-semibold leading-5 text-[#25366f]">{text}</p>
                      </div>
                    </div>
                  ))}
                </section>
          </div>
        </div>
      </main>
    </div>
  );
}
