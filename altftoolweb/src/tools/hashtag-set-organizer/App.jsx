"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Hash,
  Tag,
  Plus,
  Trash2,
  Edit2,
  Heart,
  Pin,
  Copy,
  Search,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Download,
  RefreshCw,
  FileText,
  Layers,
  Zap,
  Clock,
  ArrowRight,
  X,
  XCircle,
  PlusCircle,
  Check,
  Activity,
  FileSpreadsheet,
  Sparkles,
  Share2,
  Grid,
  Filter,
  CheckCircle,
  Calendar,
  TrendingUp,
  SlidersHorizontal,
  Globe,
  Folder,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Constants & Helper Functions ---

const PLATFORMS = [
  { id: "instagram", label: "Instagram", limit: 30, limitType: "tags", desc: "Max 30 hashtags. Recommended 5-15." },
  { id: "tiktok", label: "TikTok", limit: 150, limitType: "chars", desc: "Character limit applies. Recommended 5-10 tags." },
  { id: "youtube", label: "YouTube", limit: 15, limitType: "tags", desc: "Max 15 hashtags. Over 60 ignores all." },
  { id: "linkedin", label: "LinkedIn", limit: 5, limitType: "tags", desc: "Recommended 3-5 high-relevance hashtags." },
  { id: "twitter", label: "X / Twitter", limit: 10, limitType: "tags", desc: "Recommended 2-3 hashtags due to character count." },
  { id: "custom", label: "Custom Platform", limit: 100, limitType: "tags", desc: "Custom configuration sets." }
];

const DEFAULT_CATEGORIES = [
  "Fashion", "Travel", "Tech", "Food", "Fitness", "Business", "Marketing", "Education"
];

const INITIAL_SETS = [
  {
    id: "set-1",
    name: "Travel Reels",
    description: "High-performance hashtags for scenic reels and travel vlogs.",
    tags: ["#travel", "#vacation", "#wanderlust", "#reelstravel", "#explorepage", "#instatravel", "#travelphotography", "#nature", "#adventure", "#trip"],
    platform: "instagram",
    category: "Travel",
    campaignId: "camp-2",
    isFavorite: true,
    notes: "Best posted with trending audio between 6 PM - 9 PM.",
    createdAt: new Date().toISOString()
  },
  {
    id: "set-2",
    name: "Fitness Growth",
    description: "Viral tags targeting fitness enthusiasts and daily gym routines.",
    tags: ["#fitness", "#gymmotivation", "#workout", "#gymlife", "#healthylifestyle", "#fitfam", "#tiktokfitness", "#workoutmotivation", "#gains"],
    platform: "tiktok",
    category: "Fitness",
    campaignId: "camp-1",
    isFavorite: true,
    notes: "Keep captions ultra-short to avoid overlapping the hashtags.",
    createdAt: new Date().toISOString()
  },
  {
    id: "set-3",
    name: "Tech Startup Pitch",
    description: "Professional networking tags for digital innovations.",
    tags: ["#technology", "#innovation", "#startup", "#future", "#launch", "#entrepreneur", "#business", "#productivity"],
    platform: "linkedin",
    category: "Tech",
    campaignId: "camp-1",
    isFavorite: false,
    notes: "Focus on AI and developer-focused networking threads.",
    createdAt: new Date().toISOString()
  },
  {
    id: "set-4",
    name: "Healthy Food Hacks",
    description: "Easy recipes, foodie vlogs, and kitchen aesthetic hacks.",
    tags: ["#foodie", "#recipe", "#tiktokfood", "#easyrecipes", "#foodtiktok", "#delicious", "#yummy", "#healthyeating"],
    platform: "tiktok",
    category: "Food",
    campaignId: "",
    isFavorite: false,
    notes: "Ideal for voiceover reels.",
    createdAt: new Date().toISOString()
  }
];

const INITIAL_CAMPAIGNS = [
  {
    id: "camp-1",
    name: "Launch 2026",
    description: "Product launch base campaign tracking new release hashtags.",
    baseTags: ["#Launch2026", "#NextGen", "#BrandNew"],
    createdAt: new Date().toISOString()
  },
  {
    id: "camp-2",
    name: "Summer Promotion",
    description: "E-commerce seasonal discount tags and retail promotions.",
    baseTags: ["#SummerSale", "#HotDeals", "#Promo"],
    createdAt: new Date().toISOString()
  }
];

const INITIAL_PINNED_TAGS = ["#viral", "#trending", "#foryou", "#marketing", "#grow", "#tips"];

// --- Helper to parse raw text inputs into clean hashtag list ---
const parseHashtags = (text) => {
  if (!text) return [];
  // Split by whitespace, comma, or newlines
  const rawParts = text.split(/[\s,;\n]+/);
  return rawParts
    .map(part => {
      let cleaned = part.trim();
      if (!cleaned) return "";
      // If it doesn't start with '#', prefix it
      if (!cleaned.startsWith("#")) {
        cleaned = "#" + cleaned;
      }
      // Keep only valid hashtag characters (remove special characters at end/middle except letters, numbers)
      return cleaned.replace(/[^a-zA-Z0-9#_]/g, "");
    })
    .filter(tag => tag && tag !== "#");
};

// --- Shared UI Components ---

const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0, headerActions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-(--card) border border-(--border) rounded-3xl p-5 md:p-6 backdrop-blur-md shadow-xl hover:border-blue-500/20 transition-all overflow-hidden ${className}`}
  >
    {title && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-(--border) pb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
            {Icon && <Icon size={18} />}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-(--foreground)">{title}</h3>
        </div>
        {headerActions}
      </div>
    )}
    {children}
  </motion.div>
);

const Header = () => {
  const [text, setText] = useState("");
  const fullText = "Hashtag Set Organizer";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 55);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-10"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[11px] font-bold uppercase tracking-wider mb-5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        Social Campaign Pipeline Active
      </div>
      <h1 className="heading !text-3xl sm:!text-4xl md:!text-6xl font-black mb-3 tracking-tight">
        {text}
      </h1>
      <p className="description text-sm md:text-lg opacity-80 max-w-xl mx-auto">
        Futuristic digital organizer to structure libraries, plan platform strategies, trace limits, and optimize social campaigns.
      </p>
    </motion.div>
  );
};

export default function HashtagSetOrganizer() {
  // --- Persistent Storage State ---
  const [sets, setSets] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [pinnedTags, setPinnedTags] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  // --- Runtime UI State ---
  const [activeTab, setActiveTab] = useState("libraries"); // libraries, campaigns, favorites, exporter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent"); // recent, alphabetical, tagCount, favoriteFirst
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  // --- Live Feedback Clipboard State ---
  const [copiedTagId, setCopiedTagId] = useState(null);
  const [copiedSetId, setCopiedSetId] = useState(null);
  const [copyFeedbackText, setCopyFeedbackText] = useState("");

  // --- Edit Form State ---
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState("");
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formTagsRaw, setFormTagsRaw] = useState("");
  const [formPlatform, setFormPlatform] = useState("instagram");
  const [formCategory, setFormCategory] = useState("Fashion");
  const [formCampaign, setFormCampaign] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [showFormCard, setShowFormCard] = useState(false);

  // --- Campaign Creator State ---
  const [campName, setCampName] = useState("");
  const [campDesc, setCampDesc] = useState("");
  const [campTagsRaw, setCampTagsRaw] = useState("");

  // --- Sticky Pinned Tag State ---
  const [newPinnedTag, setNewPinnedTag] = useState("");

  // --- JSON Backup / Restore State ---
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [isPrintFriendly, setIsPrintFriendly] = useState(false);

  // --- Live Widgets Config State ---
  const [widgetPlatform, setWidgetPlatform] = useState("instagram");

  // --- LocalStorage Loader ---
  useEffect(() => {
    const localSets = localStorage.getItem("hashtag_organizer_sets");
    const localCampaigns = localStorage.getItem("hashtag_organizer_campaigns");
    const localPinned = localStorage.getItem("hashtag_organizer_pinned");
    const localCategories = localStorage.getItem("hashtag_organizer_categories");

    if (localSets) setSets(JSON.parse(localSets));
    else setSets(INITIAL_SETS);

    if (localCampaigns) setCampaigns(JSON.parse(localCampaigns));
    else setCampaigns(INITIAL_CAMPAIGNS);

    if (localPinned) setPinnedTags(JSON.parse(localPinned));
    else setPinnedTags(INITIAL_PINNED_TAGS);

    if (localCategories) setCategories(JSON.parse(localCategories));
    else setCategories(DEFAULT_CATEGORIES);
  }, []);

  // --- LocalStorage Sync ---
  useEffect(() => {
    if (sets.length > 0) {
      localStorage.setItem("hashtag_organizer_sets", JSON.stringify(sets));
    }
  }, [sets]);

  useEffect(() => {
    if (campaigns.length > 0) {
      localStorage.setItem("hashtag_organizer_campaigns", JSON.stringify(campaigns));
    }
  }, [campaigns]);

  useEffect(() => {
    if (pinnedTags.length > 0) {
      localStorage.setItem("hashtag_organizer_pinned", JSON.stringify(pinnedTags));
    }
  }, [pinnedTags]);

  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem("hashtag_organizer_categories", JSON.stringify(categories));
    }
  }, [categories]);

  // --- Clipboard Copy Helper ---
  const handleCopyToClipboard = (text, typeId, type = "tag", feedback = "Copied Tag!") => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedbackText(feedback);
      if (type === "tag") {
        setCopiedTagId(typeId);
        setTimeout(() => setCopiedTagId(null), 1500);
      } else {
        setCopiedSetId(typeId);
        setTimeout(() => setCopiedSetId(null), 1800);
      }
    });
  };

  // --- Statistics Computations ---
  const stats = useMemo(() => {
    const totalSets = sets.length;
    const allTags = sets.reduce((acc, curr) => [...acc, ...curr.tags], []);
    const uniqueTags = new Set(allTags);
    const favoriteSets = sets.filter(s => s.isFavorite).length;
    const activeCamps = campaigns.length;

    return {
      totalSets,
      uniqueTags: uniqueTags.size,
      favoriteSets,
      activeCamps
    };
  }, [sets, campaigns]);

  // --- Active Platform Live Warnings Widget ---
  const activeWidgetPlatformConfig = useMemo(() => {
    return PLATFORMS.find(p => p.id === widgetPlatform);
  }, [widgetPlatform]);

  // --- Duplicate Analyzer ---
  const duplicateReport = useMemo(() => {
    const globalCount = {};
    sets.forEach(set => {
      set.tags.forEach(tag => {
        const lower = tag.toLowerCase();
        globalCount[lower] = (globalCount[lower] || 0) + 1;
      });
    });

    const duplicatesList = Object.keys(globalCount).filter(tag => globalCount[tag] > 1);

    // Map duplicate tag to which sets contain it
    const map = duplicatesList.map(tag => {
      const parentSets = sets
        .filter(s => s.tags.map(t => t.toLowerCase()).includes(tag))
        .map(s => ({ id: s.id, name: s.name }));
      return { tag, occurrences: globalCount[tag], sets: parentSets };
    });

    return map;
  }, [sets]);

  // --- Real-time Filtered Sets ---
  const filteredSets = useMemo(() => {
    let result = [...sets];

    // Real-time Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(set =>
        set.name.toLowerCase().includes(q) ||
        set.description.toLowerCase().includes(q) ||
        set.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Platform Filter
    if (selectedPlatform !== "all") {
      result = result.filter(set => set.platform === selectedPlatform);
    }

    // Category Filter
    if (selectedCategory !== "all") {
      result = result.filter(set => set.category === selectedCategory);
    }

    // Sorters
    if (sortBy === "alphabetical") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "tagCount") {
      result.sort((a, b) => b.tags.length - a.tags.length);
    } else if (sortBy === "favoriteFirst") {
      result.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
    } else {
      // default: recent (descending id/date)
      result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return result;
  }, [sets, searchQuery, selectedPlatform, selectedCategory, sortBy]);

  // --- Add/Edit Set Form Handler ---
  const handleSaveSet = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const cleanTags = parseHashtags(formTagsRaw);

    if (isEditing) {
      setSets(prev =>
        prev.map(s =>
          s.id === editId
            ? {
                ...s,
                name: formName.trim(),
                description: formDesc.trim(),
                tags: cleanTags,
                platform: formPlatform,
                category: formCategory,
                campaignId: formCampaign,
                notes: formNotes.trim()
              }
            : s
        )
      );
      setIsEditing(false);
      setEditId("");
    } else {
      const newSet = {
        id: `set-${Date.now()}`,
        name: formName.trim(),
        description: formDesc.trim(),
        tags: cleanTags,
        platform: formPlatform,
        category: formCategory,
        campaignId: formCampaign,
        isFavorite: false,
        notes: formNotes.trim(),
        createdAt: new Date().toISOString()
      };
      setSets(prev => [newSet, ...prev]);
    }

    // Reset fields
    setFormName("");
    setFormDesc("");
    setFormTagsRaw("");
    setFormNotes("");
    setFormCampaign("");
    setShowFormCard(false);
  };

  const handleEditSetTrigger = (set) => {
    setIsEditing(true);
    setEditId(set.id);
    setFormName(set.name);
    setFormDesc(set.description);
    setFormTagsRaw(set.tags.join("\n"));
    setFormPlatform(set.platform);
    setFormCategory(set.category);
    setFormCampaign(set.campaignId || "");
    setFormNotes(set.notes || "");
    setShowFormCard(true);
    // Smooth scroll to top of workspace
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteSet = (id) => {
    if (confirm("Delete this hashtag set? This cannot be undone.")) {
      setSets(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleToggleFavorite = (id) => {
    setSets(prev =>
      prev.map(s => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  // --- Campaign Handlers ---
  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!campName.trim()) return;

    const baseCleanTags = parseHashtags(campTagsRaw);

    const newCampaign = {
      id: `camp-${Date.now()}`,
      name: campName.trim(),
      description: campDesc.trim(),
      baseTags: baseCleanTags,
      createdAt: new Date().toISOString()
    };

    setCampaigns(prev => [...prev, newCampaign]);
    setCampName("");
    setCampDesc("");
    setCampTagsRaw("");
  };

  const handleDeleteCampaign = (campId) => {
    if (confirm("Delete this campaign? Hashtag sets assigned to this campaign will be unassigned.")) {
      setCampaigns(prev => prev.filter(c => c.id !== campId));
      setSets(prev =>
        prev.map(s => (s.campaignId === campId ? { ...s, campaignId: "" } : s))
      );
    }
  };

  const handleCopyCampaignCombined = (campaign) => {
    const assignedSets = sets.filter(s => s.campaignId === campaign.id);
    const allSetTags = assignedSets.reduce((acc, curr) => [...acc, ...curr.tags], []);
    // Combine base campaign tags and set tags, then deduplicate
    const combined = Array.from(new Set([...campaign.baseTags, ...allSetTags]));

    handleCopyToClipboard(
      combined.join(" "),
      campaign.id,
      "set",
      `Copied ${combined.length} Campaign Tags!`
    );
  };

  // --- Custom Categories Handler ---
  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories(prev => [...prev, trimmed]);
      setFormCategory(trimmed);
      setNewCategoryName("");
      setShowCategoryInput(false);
    }
  };

  // --- Sticky Pinned Tag Handlers ---
  const handleAddPinnedTag = (e) => {
    e.preventDefault();
    let cleaned = newPinnedTag.trim();
    if (!cleaned) return;
    if (!cleaned.startsWith("#")) cleaned = "#" + cleaned;
    cleaned = cleaned.replace(/[^a-zA-Z0-9#_]/g, "");

    if (cleaned && cleaned !== "#" && !pinnedTags.includes(cleaned)) {
      setPinnedTags(prev => [...prev, cleaned]);
      setNewPinnedTag("");
    }
  };

  const handleDeletePinnedTag = (tag) => {
    setPinnedTags(prev => prev.filter(t => t !== tag));
  };

  // --- Merge and Clean Duplicates in Selected Set ---
  const cleanDuplicatesInSet = (setId) => {
    setSets(prev =>
      prev.map(set => {
        if (set.id === setId) {
          const unique = Array.from(new Set(set.tags.map(t => t.toLowerCase()))).map(lower => {
            // Find first original case match
            return set.tags.find(t => t.toLowerCase() === lower);
          });
          return { ...set, tags: unique };
        }
        return set;
      })
    );
  };

  // --- Export / Import Backup Helpers ---
  const formattedTxtExport = useMemo(() => {
    let result = "=== HASHTAG LIBRARIES BACKUP ===\n\n";
    sets.forEach(set => {
      const platformLabel = PLATFORMS.find(p => p.id === set.platform)?.label || set.platform;
      result += `Set: ${set.name} [Platform: ${platformLabel} | Category: ${set.category}]\n`;
      if (set.description) result += `Desc: ${set.description}\n`;
      result += `Hashtags: ${set.tags.join(" ")}\n`;
      if (set.notes) result += `Notes: ${set.notes}\n`;
      result += "\n----------------------------------------\n\n";
    });
    return result;
  }, [sets]);

  const handleDownloadTxtBackup = () => {
    const element = document.createElement("a");
    const file = new Blob([formattedTxtExport], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "hashtag-sets-backup.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadJsonBackup = () => {
    const element = document.createElement("a");
    const dataObj = { sets, campaigns, pinnedTags, categories };
    const file = new Blob([JSON.stringify(dataObj, null, 2)], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = "hashtag-organizer-backup.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImportJsonBackup = () => {
    setImportError("");
    setImportSuccess(false);
    try {
      const parsed = JSON.parse(importJsonText);
      if (parsed && typeof parsed === "object") {
        if (parsed.sets && Array.isArray(parsed.sets)) setSets(parsed.sets);
        if (parsed.campaigns && Array.isArray(parsed.campaigns)) setCampaigns(parsed.campaigns);
        if (parsed.pinnedTags && Array.isArray(parsed.pinnedTags)) setPinnedTags(parsed.pinnedTags);
        if (parsed.categories && Array.isArray(parsed.categories)) setCategories(parsed.categories);
        setImportSuccess(true);
        setImportJsonText("");
      } else {
        setImportError("Invalid backup structure. Top element must be an object containing libraries.");
      }
    } catch (err) {
      setImportError("JSON parsing failed. Please verify syntax.");
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all settings and load default dashboard hashtag sets?")) {
      setSets(INITIAL_SETS);
      setCampaigns(INITIAL_CAMPAIGNS);
      setPinnedTags(INITIAL_PINNED_TAGS);
      setCategories(DEFAULT_CATEGORIES);
      localStorage.removeItem("hashtag_organizer_sets");
      localStorage.removeItem("hashtag_organizer_campaigns");
      localStorage.removeItem("hashtag_organizer_pinned");
      localStorage.removeItem("hashtag_organizer_categories");
    }
  };

  const handleClearAllData = () => {
    if (confirm("WARNING: Clear ALL hashtag sets and campaigns? This action cannot be undone.")) {
      setSets([]);
      setCampaigns([]);
      setPinnedTags([]);
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem("hashtag_organizer_sets", JSON.stringify([]));
      localStorage.setItem("hashtag_organizer_campaigns", JSON.stringify([]));
      localStorage.setItem("hashtag_organizer_pinned", JSON.stringify([]));
      localStorage.setItem("hashtag_organizer_categories", JSON.stringify(DEFAULT_CATEGORIES));
    }
  };

  // --- Platform Tag Limit Helper ---
  const checkPlatformLimits = (tags, platform) => {
    const config = PLATFORMS.find(p => p.id === platform);
    if (!config) return { count: 0, limit: 0, status: "ok" };

    if (config.limitType === "tags") {
      const count = tags.length;
      let status = "ok";
      if (count > config.limit) status = "over";
      else if (count >= config.limit - 3) status = "near";
      return { count, limit: config.limit, status, type: "tags" };
    } else {
      // chars limit for TikTok captions
      const charCount = tags.join(" ").length;
      let status = "ok";
      if (charCount > config.limit) status = "over";
      else if (charCount >= config.limit - 20) status = "near";
      return { count: charCount, limit: config.limit, status, type: "chars" };
    }
  };

  return (
    <div className={`w-full font-secondary selection:bg-blue-500/30 ${isPrintFriendly ? "print:bg-white print:text-black" : ""}`}>
      <div className="max-w-[1400px] mx-auto">
        <Header />

        {/* Dynamic Metric Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Saved Sets", value: stats.totalSets, icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Unique Hashtags", value: stats.uniqueTags, icon: Hash, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Pinned / Favorite Sets", value: stats.favoriteSets, icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
            { label: "Active Campaigns", value: stats.activeCamps, icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" }
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={i}
              className="bg-(--card) border border-(--border) p-4 rounded-3xl flex items-center justify-between shadow-md"
            >
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{stat.label}</span>
                <h3 className="text-xl sm:text-2xl font-black text-(--foreground) mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl ${stat.color} ${stat.bg}`}>
                <stat.icon size={20} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Sidebar Widgets */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Elegant Tab Navigation */}
            <div className="p-1.5 bg-(--card) border border-(--border) rounded-3xl grid grid-cols-4 gap-1">
              {[
                { id: "libraries", label: "Sets", icon: Grid },
                { id: "campaigns", label: "Camps", icon: Calendar },
                { id: "favorites", label: "Favs", icon: Pin },
                { id: "exporter", label: "Backup", icon: FileText }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 rounded-2xl transition-all flex flex-col items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-muted-foreground hover:text-(--foreground) hover:bg-blue-500/5"
                  }`}
                >
                  <tab.icon size={16} className="shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-tight text-center">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Platform limits widget */}
            <GlassCard title="Platform Strategy Limits" icon={SlidersHorizontal}>
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Choose Platform</label>
                  <select
                    value={widgetPlatform}
                    onChange={(e) => setWidgetPlatform(e.target.value)}
                    className="w-full bg-(--background) border border-(--border) rounded-2xl px-3 py-2 outline-none focus:border-blue-500/50"
                  >
                    {PLATFORMS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="bg-blue-500/5 p-3 rounded-2xl border border-blue-500/10 space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-muted-foreground">Limit Constraint:</span>
                    <span className="text-blue-500 uppercase tracking-widest text-[10px]">
                      {activeWidgetPlatformConfig?.limit} {activeWidgetPlatformConfig?.limitType}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed italic">{activeWidgetPlatformConfig?.desc}</p>
                </div>
              </div>
            </GlassCard>

            {/* Real-time Duplicate Detector widget */}
            <GlassCard title="Global Duplicates" icon={AlertTriangle}>
              <div className="space-y-4">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Scans all active hashtag sets to detect repeated tags across sets.
                </p>
                
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                  {duplicateReport.map((dup, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] flex items-center justify-between">
                      <span className="font-bold text-amber-500">{dup.tag}</span>
                      <span className="text-muted-foreground font-semibold uppercase">{dup.occurrences} sets</span>
                    </div>
                  ))}
                  {duplicateReport.length === 0 && (
                    <div className="flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground py-4 italic border border-dashed border-(--border) rounded-2xl">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      <span>No duplicate tags across sets!</span>
                    </div>
                  )}
                </div>

                {duplicateReport.length > 0 && (
                  <button
                    onClick={() => {
                      sets.forEach(set => cleanDuplicatesInSet(set.id));
                      alert("Cleaned up duplicates within individual sets!");
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-500 font-bold uppercase text-[9px] tracking-wider transition-all"
                  >
                    Resolve Internal Set Dups
                  </button>
                )}
              </div>
            </GlassCard>

            {/* Quick Actions Panel */}
            <GlassCard title="Workspace Settings" icon={Zap}>
              <div className="space-y-2">
                <button
                  onClick={handleResetDefaults}
                  className="w-full py-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-500 hover:bg-blue-500/10 font-bold uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={12} />
                  <span>Restore Factory Defaults</span>
                </button>
                <button
                  onClick={handleClearAllData}
                  className="w-full py-2.5 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={12} />
                  <span>Clear All Workspace</span>
                </button>
              </div>
            </GlassCard>

          </div>

          {/* Right Column: Main Dynamic Content */}
          <div className="lg:col-span-9 space-y-6">
            
            <AnimatePresence mode="wait">
              
              {/* LIBRARIES TAB */}
              {activeTab === "libraries" && (
                <motion.div
                  key="libraries"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6"
                >
                  
                  {/* Search, Filter & Sorters panel */}
                  <div className="bg-(--card) border border-(--border) p-5 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-4 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <input
                        type="text"
                        placeholder="Search set name, tags, description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-(--background) border border-(--border) rounded-2xl pl-12 pr-4 py-3 text-xs focus:border-blue-500/50 outline-none transition-colors"
                      />
                    </div>
                    
                    <div className="md:col-span-3 relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full bg-(--background) border border-(--border) rounded-2xl pl-11 pr-10 py-3 text-xs outline-none focus:border-blue-500/50 appearance-none text-(--foreground)"
                      >
                        <option value="all">All Platforms</option>
                        {PLATFORMS.map(p => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                    </div>
                    
                    <div className="md:col-span-3 relative">
                      <Folder className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-(--background) border border-(--border) rounded-2xl pl-11 pr-10 py-3 text-xs outline-none focus:border-blue-500/50 appearance-none text-(--foreground)"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                    </div>

                    <div className="md:col-span-2 relative">
                      <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-(--background) border border-(--border) rounded-2xl pl-11 pr-10 py-3 text-xs outline-none focus:border-blue-500/50 appearance-none text-(--foreground)"
                      >
                        <option value="recent">Newest</option>
                        <option value="alphabetical">Alphabetical</option>
                        <option value="tagCount">Tag Count</option>
                        <option value="favoriteFirst">Pinned First</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                    </div>
                  </div>

                  {/* Inline Category Chip filters */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 transition-all ${
                        selectedCategory === "all"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                          : "bg-(--card) border border-(--border) text-muted-foreground hover:border-blue-500/20"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 transition-all ${
                          selectedCategory === cat
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                            : "bg-(--card) border border-(--border) text-muted-foreground hover:border-blue-500/20"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Create New Set Form Button */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Showing {filteredSets.length} Hashtag Sets
                    </span>
                    <button
                      onClick={() => {
                        setShowFormCard(!showFormCard);
                        setIsEditing(false);
                        // Reset forms
                        setFormName("");
                        setFormDesc("");
                        setFormTagsRaw("");
                        setFormNotes("");
                        setFormCampaign("");
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-102 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                    >
                      {showFormCard ? <X size={14} /> : <PlusCircle size={14} />}
                      {showFormCard ? "Collapse Editor" : "Create Hashtag Set"}
                    </button>
                  </div>

                  {/* Add / Edit Form Card */}
                  <AnimatePresence>
                    {showFormCard && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <form onSubmit={handleSaveSet} className="bg-(--card) border border-(--border) rounded-3xl p-5 md:p-6 space-y-4">
                          <h3 className="text-sm font-black text-(--foreground) border-b border-(--border) pb-2 flex items-center gap-2 uppercase tracking-wider">
                            <Sliders size={16} className="text-blue-500" />
                            <span>{isEditing ? "Modify Hashtag Set" : "Configure New Hashtag Set"}</span>
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Left Form Col */}
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Set Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Travel Reels, Fashion Launch"
                                  value={formName}
                                  onChange={(e) => setFormName(e.target.value)}
                                  className="w-full bg-(--background) border border-(--border) rounded-2xl px-4 py-3 text-xs focus:border-blue-500/50 outline-none"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Description</label>
                                <input
                                  type="text"
                                  placeholder="A brief brief/goal of these hashtags"
                                  value={formDesc}
                                  onChange={(e) => setFormDesc(e.target.value)}
                                  className="w-full bg-(--background) border border-(--border) rounded-2xl px-4 py-3 text-xs focus:border-blue-500/50 outline-none"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Platform</label>
                                  <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                                    <select
                                      value={formPlatform}
                                      onChange={(e) => setFormPlatform(e.target.value)}
                                      className="w-full bg-(--background) border border-(--border) rounded-2xl pl-11 pr-10 py-3 text-xs outline-none focus:border-blue-500/50 appearance-none text-(--foreground)"
                                    >
                                      {PLATFORMS.map(p => (
                                        <option key={p.id} value={p.id}>{p.label}</option>
                                      ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between items-center mb-0.5">
                                    <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Category</label>
                                    <button
                                      type="button"
                                      onClick={() => setShowCategoryInput(!showCategoryInput)}
                                      className="text-[8px] font-black text-blue-500 uppercase hover:underline"
                                    >
                                      {showCategoryInput ? "Cancel" : "+ Custom"}
                                    </button>
                                  </div>

                                  {!showCategoryInput ? (
                                    <div className="relative">
                                      <Folder className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                                      <select
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value)}
                                        className="w-full bg-(--background) border border-(--border) rounded-2xl pl-11 pr-10 py-3 text-xs outline-none focus:border-blue-500/50 appearance-none text-(--foreground)"
                                      >
                                        {categories.map((c, i) => (
                                          <option key={i} value={c}>{c}</option>
                                        ))}
                                      </select>
                                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                                    </div>
                                  ) : (
                                    <div className="flex gap-1.5">
                                      <input
                                        type="text"
                                        placeholder="New Category"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="w-full bg-(--background) border border-(--border) rounded-2xl px-3 py-2 text-xs outline-none focus:border-blue-500/50 text-(--foreground)"
                                      />
                                      <button
                                        type="button"
                                        onClick={handleAddCategory}
                                        className="px-3 rounded-2xl bg-blue-600 text-white font-bold text-xs"
                                      >
                                        Add
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Associate Campaign</label>
                                <div className="relative">
                                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                                  <select
                                    value={formCampaign}
                                    onChange={(e) => setFormCampaign(e.target.value)}
                                    className="w-full bg-(--background) border border-(--border) rounded-2xl pl-11 pr-10 py-3 text-xs outline-none focus:border-blue-500/50 appearance-none text-(--foreground)"
                                  >
                                    <option value="">None (Standalone Set)</option>
                                    {campaigns.map(c => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                                </div>
                              </div>
                            </div>

                            {/* Right Form Col */}
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">
                                  Bulk Paste Hashtags (Space / Comma / Newline splits)
                                </label>
                                <textarea
                                  placeholder="Paste raw block of text: e.g. #travel, vacation wanderlust #photography"
                                  value={formTagsRaw}
                                  onChange={(e) => setFormTagsRaw(e.target.value)}
                                  className="w-full h-32 bg-(--background) border border-(--border) rounded-2xl p-4 text-xs focus:border-blue-500/50 outline-none resize-none font-mono"
                                  required
                                />
                                <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                                  <span>Auto-prefixes '#' to plain words.</span>
                                  <span className="font-bold text-blue-500">
                                    Parsed tags count: {parseHashtags(formTagsRaw).length}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Strategic Notes</label>
                                <textarea
                                  placeholder="Strategy, engagement schedules, target audiences..."
                                  value={formNotes}
                                  onChange={(e) => setFormNotes(e.target.value)}
                                  className="w-full h-20 bg-(--background) border border-(--border) rounded-2xl p-4 text-xs focus:border-blue-500/50 outline-none resize-none"
                                />
                              </div>
                            </div>

                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setShowFormCard(false);
                                setIsEditing(false);
                              }}
                              className="px-5 py-2.5 rounded-2xl border border-(--border) text-muted-foreground hover:text-(--foreground) hover:bg-blue-500/5 text-[10px] font-black uppercase tracking-wider"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider hover:scale-102 transition-all shadow-md shadow-blue-500/10"
                            >
                              {isEditing ? "Save Adjustments" : "Deploy Set"}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Saved Sets Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredSets.map((set) => {
                      const limitConfig = checkPlatformLimits(set.tags, set.platform);
                      
                      // Highlight card outline color based on platforms
                      let borderOutline = "hover:border-blue-500/40";
                      let badgeBg = "bg-blue-500/10 text-blue-500";
                      
                      if (set.platform === "instagram") {
                        borderOutline = "hover:border-pink-500/40";
                        badgeBg = "bg-pink-500/10 text-pink-500";
                      } else if (set.platform === "tiktok") {
                        borderOutline = "hover:border-zinc-400/40";
                        badgeBg = "bg-zinc-950 text-zinc-200 border border-zinc-700/50";
                      } else if (set.platform === "youtube") {
                        borderOutline = "hover:border-red-500/40";
                        badgeBg = "bg-red-500/10 text-red-500";
                      } else if (set.platform === "linkedin") {
                        borderOutline = "hover:border-indigo-500/40";
                        badgeBg = "bg-indigo-500/10 text-indigo-500";
                      } else if (set.platform === "twitter") {
                        borderOutline = "hover:border-slate-400/40";
                        badgeBg = "bg-slate-500/10 text-slate-400";
                      }

                      // Check for duplicate tags within this set
                      const setDuplicates = set.tags.filter((item, index) => set.tags.indexOf(item) !== index);
                      const hasDuplicates = setDuplicates.length > 0;

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          key={set.id}
                          className={`bg-(--card) border rounded-3xl p-5 md:p-6 backdrop-blur-md shadow-xl flex flex-col justify-between transition-all duration-300 ${
                            limitConfig.status === "over"
                              ? "border-red-500/50 shadow-red-500/5 hover:border-red-500/80"
                              : hasDuplicates
                              ? "border-amber-500/40 shadow-amber-500/5 hover:border-amber-500/70"
                              : `border-(--border) ${borderOutline}`
                          }`}
                        >
                          <div className="space-y-4">
                            
                            {/* Card Header Info */}
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${badgeBg}`}>
                                    {set.platform}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-blue-500/5 text-blue-400 border border-blue-500/10">
                                    {set.category}
                                  </span>
                                  {set.campaignId && (
                                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                      Campaign Active
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm sm:text-base font-black text-(--foreground) mt-2 flex items-center gap-2 truncate max-w-full" title={set.name}>
                                  {set.name}
                                </h4>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleToggleFavorite(set.id)}
                                  className={`p-2 rounded-xl border transition-all ${
                                    set.isFavorite
                                      ? "bg-pink-500/10 border-pink-500/30 text-pink-500"
                                      : "bg-blue-500/5 border-blue-500/10 text-muted-foreground hover:text-(--foreground)"
                                  }`}
                                >
                                  <Heart size={13} fill={set.isFavorite ? "currentColor" : "none"} />
                                </button>
                                <button
                                  onClick={() => handleEditSetTrigger(set)}
                                  className="p-2 rounded-xl bg-blue-500/5 border border-blue-500/10 text-muted-foreground hover:text-blue-500 transition-all"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteSet(set.id)}
                                  className="p-2 rounded-xl bg-red-500/5 border border-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Description & Notes */}
                            {set.description && (
                              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                {set.description}
                              </p>
                            )}

                            {/* Live Limit Meter Widget */}
                            <div className="space-y-1.5 pt-1.5 border-t border-(--border)">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-muted-foreground font-black uppercase tracking-wider">
                                  Pipeline Capacity
                                </span>
                                <span className={`font-black ${
                                  limitConfig.status === "over" ? "text-red-500 animate-pulse" : limitConfig.status === "near" ? "text-amber-500" : "text-blue-500"
                                }`}>
                                  {limitConfig.count} / {limitConfig.limit} {limitConfig.type === "chars" ? "chars" : "tags"}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-blue-500/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    limitConfig.status === "over"
                                      ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                      : limitConfig.status === "near"
                                      ? "bg-amber-500"
                                      : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                  }`}
                                  style={{ width: `${Math.min((limitConfig.count / limitConfig.limit) * 100, 100)}%` }}
                                />
                              </div>
                            </div>

                            {/* Duplicate Warning indicator */}
                            {hasDuplicates && (
                              <div className="p-2.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 text-[10px] text-amber-500 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <AlertTriangle size={12} />
                                  <span>Set contains {setDuplicates.length} duplicates</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => cleanDuplicatesInSet(set.id)}
                                  className="underline font-black uppercase text-[8px] tracking-wide"
                                >
                                  Cleanup
                                </button>
                              </div>
                            )}

                            {/* Hashtag Chips Grid */}
                            <div className="flex flex-wrap gap-1.5 pt-2 max-h-40 overflow-y-auto no-scrollbar">
                              {set.tags.map((tag, tagIdx) => {
                                const isDup = setDuplicates.map(t => t.toLowerCase()).includes(tag.toLowerCase());
                                const uniqueTagId = `${set.id}-${tagIdx}`;

                                return (
                                  <div key={tagIdx} className="relative group max-w-full">
                                    <button
                                      onClick={() => handleCopyToClipboard(tag, uniqueTagId, "tag", "Copied tag!")}
                                      className={`py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 max-w-full ${
                                        isDup
                                          ? "bg-amber-500/15 border border-amber-500/30 text-amber-500 hover:border-amber-500/50"
                                          : "bg-(--background) border border-(--border) text-muted-foreground hover:border-blue-500/40 hover:text-(--foreground)"
                                      }`}
                                    >
                                      <span className="truncate max-w-[120px]">{tag}</span>
                                      <Copy size={9} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </button>

                                    {/* Copied Popup Bubble */}
                                    <AnimatePresence>
                                      {copiedTagId === uniqueTagId && (
                                        <motion.span
                                          initial={{ opacity: 0, y: 5 }}
                                          animate={{ opacity: 1, y: -20 }}
                                          exit={{ opacity: 0 }}
                                          className="absolute left-1/2 -translate-x-1/2 bg-blue-600 text-white font-black uppercase text-[8px] tracking-wider px-2 py-0.5 rounded-lg z-10 whitespace-nowrap shadow-md"
                                        >
                                          Copied!
                                        </motion.span>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>

                          </div>

                          <div className="pt-5 mt-5 border-t border-(--border) flex gap-3">
                            <button
                              onClick={() => handleCopyToClipboard(set.tags.join(" "), set.id, "set", "Copied Set!")}
                              className="flex-1 py-3 px-3 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center justify-center gap-2 relative shadow-md shadow-blue-500/10"
                            >
                              <Copy size={13} />
                              <span>Copy Entire Set</span>

                              {/* Copied entire set feedback overlay */}
                              <AnimatePresence>
                                {copiedSetId === set.id && (
                                  <motion.span
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 rounded-2xl bg-emerald-600 flex items-center justify-center gap-1.5"
                                  >
                                    <Check size={14} className="text-white" />
                                    <span>{copyFeedbackText}</span>
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}

                    {filteredSets.length === 0 && (
                      <div className="col-span-full py-16 text-center border-2 border-dashed border-(--border) rounded-3xl bg-(--card)">
                        <Layers size={48} className="mx-auto text-muted-foreground/30 mb-4 animate-bounce-slow" />
                        <h4 className="text-sm font-bold text-(--foreground) mb-1">No matching hashtag sets found</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Try adjusting search filters, changing category selections, or create a brand new set above.
                        </p>
                      </div>
                    )}
                  </div>

                </motion.div>
              )}

              {/* CAMPAIGNS TAB */}
              {activeTab === "campaigns" && (
                <motion.div
                  key="campaigns"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6"
                >
                  
                  {/* Campaign Creator Card */}
                  <GlassCard title="Create Brand Campaign" icon={Sparkles}>
                    <form onSubmit={handleCreateCampaign} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Campaign Name</label>
                            <input
                              type="text"
                              placeholder="e.g. SummerSale, Launch2026"
                              value={campName}
                              onChange={(e) => setCampName(e.target.value)}
                              className="w-full bg-(--background) border border-(--border) rounded-2xl px-4 py-3 text-xs focus:border-blue-500/50 outline-none"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Description / Goal</label>
                            <input
                              type="text"
                              placeholder="Describe seasonal focus or promotional details"
                              value={campDesc}
                              onChange={(e) => setCampDesc(e.target.value)}
                              className="w-full bg-(--background) border border-(--border) rounded-2xl px-4 py-3 text-xs focus:border-blue-500/50 outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">
                            Base Campaign Hashtags (Always included in sets)
                          </label>
                          <textarea
                            placeholder="e.g. #Launch2026 #BrandCampaign #Promo"
                            value={campTagsRaw}
                            onChange={(e) => setCampTagsRaw(e.target.value)}
                            className="w-full h-[116px] bg-(--background) border border-(--border) rounded-2xl p-4 text-xs focus:border-blue-500/50 outline-none resize-none font-mono"
                          />
                        </div>

                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider hover:scale-102 transition-all shadow-md shadow-blue-500/10"
                        >
                          Launch Campaign
                        </button>
                      </div>
                    </form>
                  </GlassCard>

                  {/* Campaigns Directory */}
                  <div className="space-y-4">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">
                      Active Campaign Pipeline ({campaigns.length})
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {campaigns.map((camp) => {
                        const assignedSets = sets.filter(s => s.campaignId === camp.id);

                        return (
                          <motion.div
                            layout
                            key={camp.id}
                            className="bg-(--card) border border-(--border) rounded-3xl p-5 md:p-6 backdrop-blur-md shadow-xl hover:border-blue-500/10 transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    Global Campaign
                                  </span>
                                  <h4 className="text-sm sm:text-base font-black text-(--foreground) mt-2 truncate max-w-full" title={camp.name}>
                                    {camp.name}
                                  </h4>
                                </div>
                                <button
                                  onClick={() => handleDeleteCampaign(camp.id)}
                                  className="p-2 rounded-xl bg-red-500/5 border border-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {camp.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                  {camp.description}
                                </p>
                              )}

                              {/* Base Tags chips display */}
                              {camp.baseTags.length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest block">
                                    Campaign Anchor Tags
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {camp.baseTags.map((tag, idx) => (
                                      <span key={idx} className="px-2 py-0.5 bg-blue-500/5 border border-blue-500/10 rounded-lg text-[9px] font-bold text-blue-500">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Associated sets list */}
                              <div className="space-y-1.5 pt-2 border-t border-(--border)">
                                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest block">
                                  Assigned Hashtag Sets ({assignedSets.length})
                                </span>
                                <div className="space-y-1 max-h-24 overflow-y-auto no-scrollbar">
                                  {assignedSets.map((s) => (
                                    <div key={s.id} className="text-[10px] text-muted-foreground flex items-center justify-between py-1 border-b border-(--border)/30 last:border-0 gap-2">
                                      <span className="font-bold truncate max-w-[70%]" title={s.name}>{s.name}</span>
                                      <span className="uppercase text-[8px] font-black shrink-0">{s.platform}</span>
                                    </div>
                                  ))}
                                  {assignedSets.length === 0 && (
                                    <span className="text-[9px] text-muted-foreground italic block">No sets currently assigned.</span>
                                  )}
                                </div>
                              </div>

                            </div>

                            <div className="pt-4 mt-4 border-t border-(--border)">
                              <button
                                onClick={() => handleCopyCampaignCombined(camp)}
                                className="w-full py-2.5 rounded-2xl bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider hover:bg-amber-600 transition-all flex items-center justify-center gap-2 relative shadow-md"
                              >
                                <Copy size={12} />
                                <span>Copy Combined Pipeline Tags</span>

                                <AnimatePresence>
                                  {copiedSetId === camp.id && (
                                    <motion.span
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      className="absolute inset-0 rounded-2xl bg-emerald-600 flex items-center justify-center gap-1.5 text-white"
                                    >
                                      <CheckCircle2 size={13} />
                                      <span>{copyFeedbackText}</span>
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </button>
                            </div>

                          </motion.div>
                        );
                      })}

                      {campaigns.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-(--border) rounded-3xl bg-(--card)">
                          <Calendar size={40} className="mx-auto text-muted-foreground/20 mb-4" />
                          <h4 className="text-sm font-bold text-muted-foreground">No active campaigns planned yet.</h4>
                        </div>
                      )}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* FAVORITES & STICKY PINNED TAGS TAB */}
              {activeTab === "favorites" && (
                <motion.div
                  key="favorites"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8"
                >
                  
                  {/* Pinned Individual Tags Dashboard */}
                  <div className="md:col-span-4 space-y-6">
                    <GlassCard title="Individual Pinned Tags" icon={Pin}>
                      <div className="space-y-4">
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Keep frequent, general high-performance hashtags sticky for single-click copying.
                        </p>

                        <form onSubmit={handleAddPinnedTag} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add #viral..."
                            value={newPinnedTag}
                            onChange={(e) => setNewPinnedTag(e.target.value)}
                            className="flex-1 bg-(--background) border border-(--border) rounded-2xl px-3 py-2 text-xs outline-none focus:border-blue-500/50"
                          />
                          <button
                            type="submit"
                            className="px-3.5 rounded-2xl bg-blue-600 text-white font-bold text-xs"
                          >
                            Add
                          </button>
                        </form>

                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {pinnedTags.map((tag, idx) => (
                            <div key={idx} className="relative group max-w-full">
                              <button
                                onClick={() => handleCopyToClipboard(tag, `pin-${idx}`, "tag", "Copied pin!")}
                                className="py-1.5 px-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] font-bold text-blue-400 flex items-center gap-2 hover:bg-blue-500/10 transition-all max-w-full"
                              >
                                <span className="truncate max-w-[120px]">{tag}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePinnedTag(tag);
                                  }}
                                  className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                >
                                  <X size={10} />
                                </button>
                              </button>

                              <AnimatePresence>
                                {copiedTagId === `pin-${idx}` && (
                                  <motion.span
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: -20 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute left-1/2 -translate-x-1/2 bg-blue-600 text-white font-black uppercase text-[8px] tracking-wider px-2 py-0.5 rounded-lg z-10 whitespace-nowrap shadow-md"
                                  >
                                    Copied!
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                          {pinnedTags.length === 0 && (
                            <span className="text-[10px] text-muted-foreground italic">No pinned tags added yet.</span>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </div>

                  {/* Favorite Sets Dashboard */}
                  <div className="md:col-span-8 space-y-4">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block">
                      Pinned Hashtag Libraries
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sets.filter(s => s.isFavorite).map((set) => (
                        <div key={set.id} className="p-4 rounded-3xl bg-(--card) border border-(--border) hover:border-pink-500/20 transition-all flex flex-col justify-between shadow-md">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-wider bg-pink-500/10 text-pink-500 border border-pink-500/20">
                                  Fav Set
                                </span>
                                <h5 className="font-black text-xs text-(--foreground) mt-1 truncate max-w-full" title={set.name}>{set.name}</h5>
                              </div>
                              <button
                                onClick={() => handleToggleFavorite(set.id)}
                                className="text-pink-500 hover:text-muted-foreground transition-all"
                              >
                                <Heart size={14} fill="currentColor" />
                              </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-2">{set.description}</p>
                            <span className="text-[8px] font-black uppercase text-blue-500 tracking-wider block">
                              Hashtags count: {set.tags.length}
                            </span>
                          </div>

                          <div className="pt-3 mt-3 border-t border-(--border)">
                            <button
                              onClick={() => handleCopyToClipboard(set.tags.join(" "), set.id, "set", "Copied Set!")}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[8px] tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 relative shadow-sm"
                            >
                              <Copy size={10} />
                              <span>Copy Tags</span>

                              <AnimatePresence>
                                {copiedSetId === set.id && (
                                  <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 rounded-xl bg-emerald-600 flex items-center justify-center text-white"
                                  >
                                    <Check size={12} />
                                    <span>Copied!</span>
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </button>
                          </div>
                        </div>
                      ))}

                      {sets.filter(s => s.isFavorite).length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-(--border) rounded-3xl bg-(--card)">
                          <Heart size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                          <h4 className="text-xs font-bold text-muted-foreground">No favorite sets marked yet.</h4>
                        </div>
                      )}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* EXPORTER & BACKUP TAB */}
              {activeTab === "exporter" && (
                <motion.div
                  key="exporter"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6"
                >
                  
                  {/* Backup / Export controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <GlassCard title="Export Library Backup" icon={Download}>
                      <div className="space-y-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Secure your entire pipeline workflow. Export your saved libraries as clear-text files or structurally readable configurations.
                        </p>
                        
                        <div className="flex flex-wrap gap-2.5">
                          <button
                            onClick={handleDownloadTxtBackup}
                            className="flex-1 py-3 px-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 text-blue-500 font-bold uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-2"
                          >
                            <FileText size={13} />
                            <span>Download .TXT Backup</span>
                          </button>
                          <button
                            onClick={handleDownloadJsonBackup}
                            className="flex-1 py-3 px-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 text-blue-500 font-bold uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-2"
                          >
                            <FileSpreadsheet size={13} />
                            <span>Download JSON Config</span>
                          </button>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest block">Formatted preview</span>
                          <textarea
                            readOnly
                            value={formattedTxtExport}
                            className="w-full h-32 bg-(--background) border border-(--border) rounded-2xl p-4 text-[10px] outline-none font-mono resize-none"
                          />
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard title="Restore Config Backup" icon={RefreshCw}>
                      <div className="space-y-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Restore existing hashtag configurations by pasting parsed JSON formats in the configuration terminal below.
                        </p>

                        <div className="space-y-2">
                          <textarea
                            placeholder="Paste JSON config backing object..."
                            value={importJsonText}
                            onChange={(e) => setImportJsonText(e.target.value)}
                            className="w-full h-[142px] bg-(--background) border border-(--border) rounded-2xl p-4 text-[10px] outline-none font-mono resize-none focus:border-blue-500/50"
                          />
                          
                          {importError && (
                            <span className="text-[10px] font-bold text-red-500 block">{importError}</span>
                          )}
                          {importSuccess && (
                            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="shrink-0 text-emerald-500" />
                              <span>Configuration imported successfully!</span>
                            </span>
                          )}

                          <button
                            onClick={handleImportJsonBackup}
                            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-wider transition-all"
                          >
                            Deploy Config Restoration
                          </button>
                        </div>
                      </div>
                    </GlassCard>

                  </div>

                  {/* Print-friendly Toggle */}
                  <GlassCard title="Print / Archive Workspace View" icon={Share2}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                          Toggle a high-contrast print-optimized view of all sets. Remove dashboard layouts to keep the printable export extremely clean and structured.
                        </p>
                        <button
                          onClick={() => setIsPrintFriendly(!isPrintFriendly)}
                          className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                            isPrintFriendly
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/30"
                          }`}
                        >
                          {isPrintFriendly ? "Close Print Layout" : "Launch Print Layout"}
                        </button>
                      </div>

                      {isPrintFriendly && (
                        <div className="bg-white text-black p-6 rounded-3xl border border-zinc-200 mt-4 space-y-6">
                          <div className="border-b-2 border-zinc-900 pb-2">
                            <h3 className="text-lg font-black uppercase">Hashtag Organizer Archive Report</h3>
                            <span className="text-[10px] text-zinc-500">Generated: {new Date().toLocaleDateString()}</span>
                          </div>
                          
                          <div className="space-y-4 divide-y divide-zinc-200">
                            {sets.map((set) => (
                              <div key={set.id} className="pt-4 first:pt-0 space-y-1">
                                <h4 className="font-bold text-sm">{set.name} [{set.platform.toUpperCase()} | {set.category}]</h4>
                                {set.description && <p className="text-xs text-zinc-600">{set.description}</p>}
                                <p className="text-xs font-mono break-all">{set.tags.join(" ")}</p>
                                {set.notes && <p className="text-[10px] text-zinc-500 italic">Notes: {set.notes}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassCard>

                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </div>

        {/* Technical Footer */}
        <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity">
          {[
            { icon: Hash, title: "Campaign Pipeline", desc: "Deduplicated tag combinations to power professional social media marketing flows." },
            { icon: SlidersHorizontal, title: "Platform limit guards", desc: "Live character and tag-count constraints for Instagram, TikTok, LinkedIn, YouTube, and X." },
            { icon: Pin, title: "Sticky Pins Board", desc: "Single-click high-relevance tag copying overlays to accelerate curation speeds." }
          ].map((feat, i) => (
            <div key={i} className="flex gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 h-fit">
                <feat.icon size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-(--foreground) uppercase tracking-wider">{feat.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
