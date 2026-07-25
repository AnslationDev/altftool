"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Square,
  LayoutGrid,
  FileText,
  UploadCloud,
  Info, // For How It Works
  HelpCircle, // For FAQs
  Shield, // For Privacy Policy
  MousePointerClick, // For step 1
  ListFilter, // For step 2
  Eye, // For step 3
  CheckCircle, // General Check Icon
  Layers, // Used for Ad Size Card Name
  Send, // For Footer feedback
  Code, // For Footer development
} from "lucide-react";

// --- Static Data ---

const AD_DATA = {
  "Google Display Network (GDN)": [
    {
      size: "300x250",
      name: "Medium Rectangle",
      orientation: "Square",
      notes: "Most common size. Excellent for general targeting.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
    },
    {
      size: "336x280",
      name: "Large Rectangle",
      orientation: "Square",
      notes: "Similar to 300x250, often performs slightly better.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
    },
    {
      size: "728x90",
      name: "Leaderboard",
      orientation: "Horizontal",
      notes: "Often used above content on desktop. High visibility.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
    },
    {
      size: "300x600",
      name: "Half Page Ad (HPA)",
      orientation: "Vertical",
      notes: "High visibility, large format, great for branding.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
    },
    {
      size: "160x600",
      name: "Wide Skyscraper",
      orientation: "Vertical",
      notes: "Common sidebar ad placement.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
    },
    {
      size: "970x90",
      name: "Large Leaderboard",
      orientation: "Horizontal",
      notes: "Premium desktop placement for maximum reach.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
    },
    {
      size: "320x100",
      name: "Large Mobile Banner",
      orientation: "Horizontal",
      notes: "Mobile-specific banner size for high CTR.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
    },
  ],
  "Facebook / Instagram Feeds": [
    {
      size: "1080x1080",
      name: "Square Feed Image/Video",
      orientation: "Square",
      notes: "Highly recommended for feeds. Ensures cross-platform visibility.",
      maxFileSizeKB: 4096,
      fileFormats: "JPG, PNG, MP4, MOV",
    },
    {
      size: "1200x628",
      name: "Landscape Link Ad (1.91:1)",
      orientation: "Horizontal",
      notes: "Good for link clicks when showing a wide image.",
      maxFileSizeKB: 4096,
      fileFormats: "JPG, PNG, MP4, MOV",
    },
    {
      size: "600x900",
      name: "Portrait Feed Image (2:3)",
      orientation: "Vertical",
      notes: "Maximizes screen space on mobile for impact.",
      maxFileSizeKB: 4096,
      fileFormats: "JPG, PNG, MP4, MOV",
    },
    {
      size: "900x1600",
      name: "Full Screen Story/Reel (9:16)",
      orientation: "Vertical",
      notes: "Used for Stories and Reels. Captures full attention.",
      maxFileSizeKB: 4096,
      fileFormats: "JPG, PNG, MP4, MOV",
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
    },
    {
      size: "480x70",
      name: "Overlay Ad",
      orientation: "Horizontal",
      notes: "Appears on the lower 20% of the video content.",
      maxFileSizeKB: 150,
      fileFormats: "JPG, PNG, GIF",
    },
    {
      size: "1280x720",
      name: "Video Resolution (Standard HD)",
      orientation: "Horizontal",
      notes: "Recommended minimum resolution for high-quality video content.",
      maxFileSizeKB: 100000,
      fileFormats: "MP4, MOV, AVI",
    }, // Large file size for video content
  ],
  "LinkedIn Ads": [
    {
      size: "300x250",
      name: "Medium Rectangle",
      orientation: "Square",
      notes: "Used in sidebar and feed for quick visual connection.",
      maxFileSizeKB: 2048,
      fileFormats: "JPG, PNG, GIF",
    },
    {
      size: "728x90",
      name: "Leaderboard",
      orientation: "Horizontal",
      notes: "Standard desktop banner for awareness campaigns.",
      maxFileSizeKB: 2048,
      fileFormats: "JPG, PNG, GIF",
    },
    {
      size: "1200x627",
      name: "Sponsored Content Image (1.91:1)",
      orientation: "Horizontal",
      notes: "Standard feed post size, optimal for native appearance.",
      maxFileSizeKB: 2048,
      fileFormats: "JPG, PNG",
    },
  ],
};

const platforms = Object.keys(AD_DATA);
const allOrientations = ["All", "Horizontal", "Vertical", "Square"];
const views = {
  DIRECTORY: "directory",
  HOW_IT_WORKS: "howItWorks",
  FAQS: "faqs",
  PRIVACY_POLICY: "privacyPolicy",
};

// --- Utility Functions (Omitted for brevity, kept for functionality) ---

// Parses 'WxH' string to get dimensions
const parseSize = (size) => {
  const [width, height] = size.split("x").map(Number);
  return { width: width || 0, height: height || 0 };
};

// Sort function factory
const getComparator = (sortBy, sortDirection) => (a, b) => {
  const sizeA = parseSize(a.size);
  const sizeB = parseSize(b.size);

  let comparison = 0;
  if (sortBy === "width") {
    comparison = sizeA.width - sizeB.width;
  } else if (sortBy === "height") {
    comparison = sizeA.height - sizeB.height;
  } else if (sortBy === "area") {
    comparison = sizeA.width * sizeA.height - sizeB.width * sizeB.height;
  }

  return sortDirection === "asc" ? comparison : -comparison;
};

// --- Component: AdSizeCard (Highly Detailed and Impressive Visual) ---

const AdSizeCard = ({ ad }) => {
  const { size, name, orientation, notes, maxFileSizeKB, fileFormats } = ad;
  const { width, height } = parseSize(size);

  const Icon =
    orientation === "Horizontal"
      ? Minimize2
      : orientation === "Vertical"
      ? Maximize2
      : Square;

  // Logic for Aspect Ratio Visualization
  const maxVisualizationSize = 100; // Max width/height of the container
  const aspectRatio = width / height;

  let visualWidth = maxVisualizationSize;
  let visualHeight = maxVisualizationSize;

  if (width > height) {
    visualHeight = visualWidth / aspectRatio;
  } else if (height > width) {
    visualWidth = visualHeight * aspectRatio;
  }

  // Format file size nicely
  const formattedFileSize =
    maxFileSizeKB >= 1024
      ? `${(maxFileSizeKB / 1024).toFixed(1)} MB`
      : `${maxFileSizeKB} KB`;

  return (
    <div className="bg-(--background) p-4 border border-gray-100 rounded-xl shadow-xl transition duration-300 hover:shadow-2xl hover:-translate-y-0.5 flex flex-col h-full">
      {/* Visual Aspect Ratio Block */}
      <div className="flex justify-center items-center h-[120px] mb-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-inner p-3">
        <div
          style={{ width: `${visualWidth}px`, height: `${visualHeight}px` }}
          className="bg-indigo-600 border-2 border-indigo-700 rounded-md shadow-md transition-all duration-300 flex items-center justify-center relative"
        >
          <span className="text-[10px] text-(--foreground) font-bold opacity-80 select-none pointer-events-none">
            {size}
          </span>
        </div>
      </div>

      {/* Primary Size & Orientation */}
      <div className="flex justify-between items-start mb-3 border-b pb-2 border-gray-100">
        <div>
          <div className="text-3xl font-extrabold text-indigo-700">{size}</div>
          <p className="text-sm text-(--muted-foreground) font-medium">
            {width}x{height} pixels
          </p>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-(--muted) border border-gray-100">
          <Icon className="w-5 h-5 text-indigo-500" aria-hidden="true" />
          <span className="text-xs font-semibold text-indigo-600 mt-1">
            {orientation}
          </span>
        </div>
      </div>

      {/* File Specs Badges */}
      <div className="flex space-x-2 mb-3">
        <div className="flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
          <UploadCloud className="w-3 h-3 mr-1" />
          {formattedFileSize}
        </div>
        <div className="flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-gray-900">
          <FileText className="w-3 h-3 mr-1" />
          {fileFormats.split(",")[0].trim()}...
        </div>
      </div>

      {/* Name and Notes */}
      <h3 className="text-lg font-bold text-(--foreground) mb-1 flex items-center">
        <Layers className="w-4 h-4 mr-2 text-indigo-500" />
        {name}
      </h3>
      <p className="text-sm text-(--muted-foreground) grow">{notes}</p>
    </div>
  );
};

// --- Component: How It Works ---

const HowItWorks = () => {
  const steps = [
    {
      icon: MousePointerClick,
      title: "Select Your Platform",
      description:
        "Choose the digital advertising platform you are designing for (e.g., Google, Facebook, LinkedIn). This narrows down the relevant specifications.",
    },
    {
      icon: ListFilter,
      title: "Filter and Sort",
      description:
        "Use the filter controls to show only horizontal, vertical, or square orientations. Optionally, sort the results by width, height, or total area to find the largest or smallest sizes.",
    },
    {
      icon: Eye,
      title: "View Specs and Visualize",
      description:
        "Each card displays the exact dimensions (WxH), the name, crucial notes, file formats, and the maximum file size. The colored block provides an instant visual reference for the aspect ratio.",
    },
  ];

  return (
    <div className="bg-(--background) p-6 md:p-10 rounded-xl shadow-2xl ring-1 ring-gray-100">
      <h2 className="text-3xl font-extrabold text-indigo-700 mb-6 border-b pb-3">
        <Info className="w-8 h-8 inline mr-3 align-text-bottom" /> How It Works
      </h2>
      <p className="text-(--muted-foreground) mb-8 max-w-3xl">
        The Ad Size Directory is designed for speed and clarity. Follow these
        simple steps to find the exact creative specifications you need.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-start p-6 bg-(--muted) rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex items-center justify-center w-14 h-14 bg-indigo-500 text-(--foreground) rounded-full mb-4 shadow-xl">
              <step.icon className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold text-indigo-600 mb-1">
              STEP {index + 1}
            </span>
            <h3 className="text-xl font-bold text-(--foreground) mb-2">
              {step.title}
            </h3>
            <p className="text-(--muted-foreground) text-sm">{step.description}</p>
          </div>
        ))}
      </div>

      {/* Premium Image Placeholder */}
      <div className="mt-12 p-8 bg-indigo-50 border border-indigo-200 rounded-xl text-center shadow-lg">
        <div className="flex items-center justify-center space-x-6 text-indigo-700">
          <LayoutGrid className="w-10 h-10" />
          <Square className="w-10 h-10" />
          <Minimize2 className="w-10 h-10" />
        </div>
        <p className="mt-4 text-xl font-semibold text-indigo-800">
          Visualize Dimensions, Not Guesswork. Get the specs right, every time.
        </p>
      </div>
    </div>
  );
};

// --- Component: FAQ Section (Accordion) ---

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border border-(--border)">
    <button
      className="flex justify-between items-center w-full py-4 text-left font-semibold text-(--foreground) hover:text-indigo-600 transition-colors"
      onClick={onClick}
      aria-expanded={isOpen}
    >
      <span>{question}</span>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-indigo-500" />
      ) : (
        <ChevronDown className="w-5 h-5 text-(--muted-foreground)" />
      )}
    </button>
    <div
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isOpen ? "max-h-96 opacity-100 py-3" : "max-h-0 opacity-0"
      }`}
    >
      <p className="text-(--muted-foreground) text-sm pr-4">{answer}</p>
    </div>
  </div>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Are these dimensions the absolute minimum/maximum required?",
      a: "The dimensions listed are the standard, most widely accepted and recommended sizes by each respective platform. Always double-check the platform's official documentation for campaigns with highly specific or unusual creative types.",
    },
    {
      q: "Why are file size limits different across platforms?",
      a: "File size limits depend on the platform's user experience goals and rendering requirements. For instance, high-traffic display networks (like GDN) enforce smaller limits (around 150KB) for faster page load times, while social feeds (like Facebook) allow larger files (up to 4MB) to support higher-quality imagery and video in native posts.",
    },
    {
      q: "How is 'area' calculated for sorting?",
      a: "The 'area' sorting option calculates the total number of pixels (Width x Height) for each ad size, allowing you to quickly find the largest or smallest ad formats regardless of their orientation.",
    },
    {
      q: "What does the visualization block represent?",
      a: "The small colored block is a proportional representation of the ad's aspect ratio (width to height). It helps you instantly visualize the shape without needing to imagine the pixel dimensions.",
    },
  ];

  return (
    <div className="bg-(--background) p-6 md:p-10 rounded-xl shadow-2xl ring-1 ring-gray-100">
      <h2 className="text-3xl font-extrabold text-indigo-700 mb-8 border-b pb-3">
        <HelpCircle className="w-8 h-8 inline mr-3 align-text-bottom" />{" "}
        Frequently Asked Questions
      </h2>
      <div
  className="plain-button-override  ">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.q}
            answer={faq.a}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
};

// --- Component: Privacy Policy ---

const PrivacyPolicy = () => (
  <div className="bg-(--background) p-6 md:p-10 rounded-xl shadow-2xl ring-1 ring-gray-100">
    <h2 className="text-3xl font-extrabold text-indigo-700 mb-6 border-b pb-3">
      <Shield className="w-8 h-8 inline mr-3 align-text-bottom" /> Privacy
      Policy
    </h2>
    <div className="space-y-6 text-(--muted-foreground)">
      <p className="text-sm italic">Effective Date: November 20, 2025</p>

      <h3 className="text-xl font-bold text-(--foreground) flex items-center">
        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
        1. Information We Collect
      </h3>
      <p>
        This Ad Size Directory application is designed to be a static reference
        tool. **We collect absolutely no personal data** from our users. We do
        not use cookies, tracking pixels, or any form of persistent user
        identification. All filtering and sorting operations are performed
        locally within your browser.
      </p>

      <h3 className="text-xl font-bold text-(--foreground) flex items-center">
        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
        2. Data Storage and Processing
      </h3>
      <p>
        The ad size data is static and embedded directly within the
        application's code. No data is stored on external servers, and no user
        input (search, filter, or sort preferences) is logged or transmitted
        externally.
      </p>

      <h3 className="text-xl font-bold text-(--foreground) flex items-center">
        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
        3. External Links
      </h3>
      <p>
        While this app does not contain active external links, the
        specifications themselves are based on third-party platforms (Google,
        Facebook, etc.). We encourage users to consult the official privacy
        policies of those external platforms when engaging in advertising
        activities.
      </p>

      <p className="text-sm font-medium pt-4 border-t border-gray-100">
        **Commitment:** Our goal is to provide a useful tool with the highest
        standard of user privacy. Your usage is anonymous and untracked.
      </p>
    </div>
  </div>
);

// --- Component: Footer (New Impressive Section with Gradient) ---

// --- Main Application Component ---

const App = () => {
  // State for Directory filtering and sorting
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [filterOrientation, setFilterOrientation] = useState("All");
  const [sortBy, setSortBy] = useState("area"); // 'width', 'height', 'area'
  const [sortDirection, setSortDirection] = useState("asc"); // 'asc', 'desc'

  // State for Navigation
  const [currentView, setCurrentView] = useState(views.DIRECTORY);

  // Toggle sort direction
  const toggleSort = useCallback(
    (key) => {
      if (sortBy === key) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortBy(key);
        setSortDirection("asc");
      }
    },
    [sortBy, sortDirection]
  );

  // Memoize the filtered and sorted list of ads
  const filteredAndSortedAds = useMemo(() => {
    const data = AD_DATA[selectedPlatform] || [];

    // 1. Filter
    const filtered =
      filterOrientation === "All"
        ? data
        : data.filter((ad) => ad.orientation === filterOrientation);

    // 2. Sort
    const comparator = getComparator(sortBy, sortDirection);
    return [...filtered].sort(comparator);
  }, [selectedPlatform, filterOrientation, sortBy, sortDirection]);

  // Helper for sorting buttons
  const getSortIcon = (key) => {
    if (sortBy !== key) return <ChevronDown className="w-4 h-4 opacity-50" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-indigo-500" />
    ) : (
      <ChevronDown className="w-4 h-4 text-indigo-500" />
    );
  };

  // Tab data for navigation
  const tabs = [
    { id: views.DIRECTORY, name: "Directory", icon: LayoutGrid },
    { id: views.HOW_IT_WORKS, name: "How It Works", icon: Info },
    { id: views.FAQS, name: "FAQs", icon: HelpCircle },
    { id: views.PRIVACY_POLICY, name: "Policy", icon: Shield },
  ];

  // --- Render Functions for Directory View ---

  const platformsPanel = (
    <div className="bg-(--background) p-4 rounded-xl shadow-lg ring-1 ring-gray-200 mb-6">
      <h2 className="text-lg font-semibold mb-3 text-(--foreground)">
        Select Platform
      </h2>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`
              px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
              ${
                selectedPlatform === platform
                  ? "bg-indigo-600 text-(--foreground) shadow-md hover:bg-indigo-700 ring-4 ring-indigo-300"
                  : "bg-(--background) text-(--foreground) ring-1 ring-gray-200 hover:bg-(--muted)"
              }
            `}
            aria-pressed={selectedPlatform === platform}
          >
            {platform.split(" ")[0]}
          </button>
        ))}
      </div>
    </div>
  );

  const filterAndSortPanel = (
    <div className="bg-(--background) p-4 rounded-xl shadow-lg ring-1 ring-gray-200 mb-6">
      <h2 className="text-lg font-semibold mb-3 text-(--foreground)">
        Filter & Sort
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Orientation Filter */}
        <div>
          <label className="block text-sm font-medium text-(--foreground) mb-1">
            Filter by Orientation
          </label>
          <div className="flex space-x-2">
            {allOrientations.map((orientation) => (
              <button
                key={orientation}
                onClick={() => setFilterOrientation(orientation)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition duration-150
                  ${
                    filterOrientation === orientation
                      ? "bg-indigo-500 text-(--foreground) shadow-sm"
                      : "bg-(--background) text-(--foreground) ring-1 ring-gray-200 hover:bg-(--muted)"
                  }
                `}
                aria-label={`Filter by ${orientation}`}
              >
                {orientation === "Horizontal" && (
                  <Minimize2 className="w-4 h-4 inline mr-1" />
                )}
                {orientation === "Vertical" && (
                  <Maximize2 className="w-4 h-4 inline mr-1" />
                )}
                {orientation === "Square" && (
                  <Square className="w-4 h-4 inline mr-1" />
                )}
                {orientation === "All" && (
                  <LayoutGrid className="w-4 h-4 inline mr-1" />
                )}
                {orientation}
              </button>
            ))}
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="md:col-span-2 lg:col-span-2">
          <label className="block text-sm font-medium text-(--foreground) mb-1">
            Sort by Dimension
          </label>
          <div className="flex space-x-2">
            {["width", "height", "area"].map((key) => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition duration-150
                  ${
                    sortBy === key
                      ? "bg-indigo-100 text-indigo-700 shadow-sm"
                      : "bg-(--background) text-(--foreground) ring-1 ring-gray-200 hover:bg-(--muted)"
                  }
                `}
                aria-label={`Sort by ${key} ${
                  sortBy === key
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : ""
                }`}
              >
                <span className="capitalize">{key}</span>
                {getSortIcon(key)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const directoryView = (
    <>
      <p className="text-(--muted-foreground) mb-6 max-w-3xl">
        A premium, filterable, and sortable database of the most common and
        effective digital ad creative sizes across major platforms.
      </p>

      {platformsPanel}
      {filterAndSortPanel}

      {/* Results Header */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border border-(--border)">
        <h3 className="text-xl font-bold text-(--foreground)">
          Sizes for: <span className="text-indigo-600">{selectedPlatform}</span>
        </h3>
        <span className="text-sm font-medium text-(--muted-foreground)">
          Showing {filteredAndSortedAds.length} ad
          {filteredAndSortedAds.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Ad Size Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedAds.length > 0 ? (
          filteredAndSortedAds.map((ad, index) => (
            <AdSizeCard key={index} ad={ad} />
          ))
        ) : (
          <div className="lg:col-span-4 p-8 text-center bg-(--background) rounded-xl shadow-lg">
            <p className="text-xl text-(--muted-foreground)">
              No ad sizes found for the current filters. Try selecting 'All'
              orientation.
            </p>
          </div>
        )}
      </div>
    </>
  );

  // --- Conditional Main Content Rendering ---
  const renderMainContent = () => {
    switch (currentView) {
      case views.HOW_IT_WORKS:
        return <HowItWorks />;
      case views.FAQS:
        return <FAQSection />;
      case views.PRIVACY_POLICY:
        return <PrivacyPolicy />;
      case views.DIRECTORY:
      default:
        return directoryView;
    }
  };

  return (
    <div
      className={`min-h-screen font-[Inter] bg-(--muted) text-(--foreground) transition-colors duration-300`}
    >
      <header className="py-4 shadow-md bg-(--background) sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-indigo-600 mb-3">
            Ad-Banner-Size-Finder
          </h1>
          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 border-b border border-(--border)">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-t-lg transition-all duration-200
                  ${
                    currentView === tab.id
                      ? "text-indigo-600 border-b-2 border-indigo-600 bg-(--muted)"
                      : "text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)"
                  }
                `}
                aria-current={currentView === tab.id ? "page" : undefined}
              >
                <tab.icon className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="inline sm:hidden">
                  {tab.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4 pt-6">
        {/* Render content based on selected tab */}
        <div className="min-h-[60vh]">{renderMainContent()}</div>
      </main>

      {/* Impressive Footer - Removed as per user request */}
    </div>
  );
};

export default App;
// import React from "react";
// import AdSizeFinder from "./adSizeFinder";

// const App = () => {
//   return (
//     <div className="App">
//       <AdSizeFinder />
//     </div>
//   );
// };

// export default App;
