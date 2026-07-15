"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Columns,
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
  ChevronDown,
  Award,
  Crown,
  MessageSquare,
  Eye,
  Trophy,
  Play,
  Printer,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Configuration Constants ---

const PLATFORMS = [
  { 
    id: "facebook", 
    label: "Facebook Ads", 
    icon: "facebook",
    limits: { headline: 40, description: 125 },
    desc: "Headline: 40 chars recommended. Description: 125 chars." 
  },
  { 
    id: "instagram", 
    label: "Instagram Ads", 
    icon: "instagram",
    limits: { headline: 30, description: 125 },
    desc: "Focus on eye-catching visual. Caption: 125 chars recommended." 
  },
  { 
    id: "google", 
    label: "Google Search Ads", 
    icon: "google",
    limits: { headline: 30, description: 90 },
    desc: "Strict limits. Headline: Max 30 chars. Description: Max 90 chars." 
  },
  { 
    id: "linkedin", 
    label: "LinkedIn Ads", 
    icon: "linkedin",
    limits: { headline: 70, description: 150 },
    desc: "Professional tone. Headline: 70 chars. Intro Text: 150 chars." 
  },
  { 
    id: "tiktok", 
    label: "TikTok Ads", 
    icon: "tiktok",
    limits: { headline: 20, description: 150 },
    desc: "Short, punchy captions overlaying videos. Max 150 chars." 
  },
  { 
    id: "youtube", 
    label: "YouTube Ads", 
    icon: "youtube",
    limits: { headline: 100, description: 5000 },
    desc: "Headline overlay: Max 100 chars. Description: 5000 chars." 
  },
  { 
    id: "custom", 
    label: "Custom Platform", 
    icon: "globe",
    limits: { headline: 100, description: 1000 },
    desc: "Custom setup limits apply." 
  }
];

const CAMPAIGN_TYPES = [
  "Product Launch",
  "Brand Awareness",
  "Sales Campaign",
  "Lead Generation",
  "Retargeting",
  "Seasonal Offer",
  "Custom"
];

const STATUS_STAGES = [
  { id: "idea", label: "Idea", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  { id: "draft", label: "Draft", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { id: "ready", label: "Ready", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { id: "testing", label: "Testing", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { id: "review", label: "Review", color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  { id: "finalized", label: "Finalized", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  { id: "completed", label: "Completed", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" }
];

const TONE_OPTIONS = ["Professional", "Playful", "Urgency", "Bold", "Informative", "Empathetic", "Casual"];
const FUNNEL_STAGES = ["TOFU (Top of Funnel)", "MOFU (Middle of Funnel)", "BOFU (Bottom of Funnel)"];
const ANGLES = ["Benefit-Driven", "Pain Point Focus", "FOMO (Fear of Missing Out)", "Social Proof", "Price/Discount", "Storytelling", "Question/Hook"];

const INITIAL_CAMPAIGNS = [
  {
    id: "camp-1",
    name: "SaaS Workspace Launch",
    type: "Product Launch",
    platform: "google",
    goal: "Lead Sign-ups",
    priority: "high",
    status: "testing",
    startDate: "2026-05-10",
    endDate: "2026-06-15",
    description: "Launch marketing campaign for the new serverless developer workspace modules.",
    audienceNotes: "Frontend developers, SaaS startups, tech leads looking for quick workspace setup tools.",
    funnelNotes: "Drive cold traffic to the landing page and split test benefit vs FOMO strategies.",
    offerStrategy: "14-day free trial on developer premium subscription plans.",
    observations: "Urgency version seems to generate higher click-through-rates in early search volumes.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    variants: [
      {
        id: "var-1",
        name: "Variant A (Benefit)",
        headline: "Code 2x Faster With Next Workspace",
        description: "Deploy serverless modules in seconds. Experience 99.9% uptime with our managed cloud setups.",
        cta: "Start Free Trial",
        offer: "14-day Free Trial",
        angle: "Benefit-Driven",
        funnelStage: "TOFU (Top of Funnel)",
        tone: "Professional",
        isWinner: false,
        metrics: { ctr: 2.45, conversion: 1.82, cost: 1.45 }
      },
      {
        id: "var-2",
        name: "Variant B (FOMO / Urgency)",
        headline: "Stop Coding Infrastructure Setup",
        description: "Don't get left behind. Join 50,000+ developers building faster with our developer workspace.",
        cta: "Claim Free Trial",
        offer: "50% off first 3 months",
        angle: "FOMO (Fear of Missing Out)",
        funnelStage: "TOFU (Top of Funnel)",
        tone: "Bold",
        isWinner: true,
        metrics: { ctr: 3.82, conversion: 2.64, cost: 0.98 }
      }
    ]
  },
  {
    id: "camp-2",
    name: "Retail Summer Fit Offer",
    type: "Seasonal Offer",
    platform: "instagram",
    goal: "Store Sales",
    priority: "medium",
    status: "draft",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    description: "Promoting organic cotton summer dress collection to young female shoppers.",
    audienceNotes: "Female 18-35 interested in sustainable fashion, summer aesthetics, and local shipping.",
    funnelNotes: "Retarget website visitors who added to cart but didn't checkout.",
    offerStrategy: "30% off total purchase or free express shipping on orders over $50.",
    observations: "Plan to test video reels with discount code highlighted in captions.",
    createdAt: new Date().toISOString(),
    variants: [
      {
        id: "var-3",
        name: "Variant A (Discount Code)",
        headline: "Summer Aesthetics: 30% Off Today",
        description: "Elevate your summer wardrobe with premium organic fits. Use code SUMMER30 for discounts.",
        cta: "Shop Now",
        offer: "30% Off Code: SUMMER30",
        angle: "Price/Discount",
        funnelStage: "BOFU (Bottom of Funnel)",
        tone: "Playful",
        isWinner: false,
        metrics: { ctr: 1.85, conversion: 0.95, cost: 2.10 }
      },
      {
        id: "var-4",
        name: "Variant B (Free Shipping)",
        headline: "Free Express Shipping This Week",
        description: "Don't wait! Shipped free directly to your door. Upgrade your closet with eco-friendly fabrics.",
        cta: "Shop The Sale",
        offer: "Free Shipping",
        angle: "Price/Discount",
        funnelStage: "BOFU (Bottom of Funnel)",
        tone: "Urgency",
        isWinner: false,
        metrics: { ctr: 2.15, conversion: 1.25, cost: 1.80 }
      }
    ]
  }
];

// --- Simulated Comments Bank ---
const SIMULATED_FEEDBACK = {
  headlineTooLong: [
    { sender: "Copywriter Bot", text: "This headline exceeds recommended character limits. It might get truncated in the user feed.", status: "warning" }
  ],
  headlineGood: [
    { sender: "SEO Strategist", text: "Headline length looks ideal! Excellent keyword prominence.", status: "success" }
  ],
  descriptionTooLong: [
    { sender: "Platform QA", text: "The description is quite long. Mobile users will have to click 'See More' to view the CTA details.", status: "warning" }
  ],
  noOffer: [
    { sender: "Manager Bot", text: "No explicit offer details found. Consider adding a discount or free shipping hook.", status: "info" }
  ],
  successGeneral: [
    { sender: "Creative Director", text: "A/B setup looks solid. Tones are sufficiently distinct to get a clear testing outcome.", status: "success" }
  ]
};

// --- Shared UI Component ---
const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0, headerActions }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-(--card) border border-(--border) rounded-3xl p-4 md:p-5 backdrop-blur-md shadow-xl hover:border-blue-500/20 transition-all min-w-0 overflow-hidden ${className}`}
  >
    {title && (
      <div className="flex flex-wrap items-center justify-between mb-5 gap-3 border-b border-(--border) pb-3">
        <div className="flex items-center gap-2 min-w-[150px] flex-1">
          <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
            {Icon && <Icon size={18} />}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-(--foreground) tracking-tight leading-tight whitespace-normal">{title}</h3>
        </div>
        {headerActions && <div className="shrink-0">{headerActions}</div>}
      </div>
    )}
    {children}
  </motion.div>
);

// --- Header Typing Intro ---
const Header = () => {
  const [text, setText] = useState("");
  const fullText = "Ad Copy A/B Planner";

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
      className="text-center mb-8"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider mb-4">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        Testing Intelligence Center Active
      </div>
      <h1 className="heading !text-3xl sm:!text-4xl md:!text-5xl font-black mb-2 tracking-tight">
        {text}
      </h1>
      <p className="description text-xs md:text-sm opacity-80 max-w-xl mx-auto">
        Futuristic campaign workspace to write marketing copies, evaluate side-by-side versions, preview live ads, and organize test roadmaps.
      </p>
    </motion.div>
  );
};

// --- Custom Premium Select Component ---
const CustomSelect = ({ label, value, onChange, options, placeholder = "Select option", className = "", inline = false, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${inline ? "" : "space-y-1.5"} ${className}`}>
      {label && (
        <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-(--background) border border-(--border) hover:border-blue-500/30 active:scale-[0.99] rounded-2xl px-4 py-3 text-xs flex justify-between items-center text-(--foreground) transition-all text-left font-semibold cursor-pointer"
      >
        <span className="flex items-center gap-2 truncate">
          {Icon && <Icon size={14} className="text-muted-foreground shrink-0" />}
          <span className="truncate">
            {options.find(o => (typeof o === "string" ? o : o.id) === value)?.label || 
             (options.find(o => (typeof o === "string" ? o : o.id) === value) || value || placeholder)}
          </span>
        </span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 shrink-0 ml-1.5 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click outside backdrop blocker */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="absolute z-50 w-full mt-1.5 bg-(--card) border border-(--border) rounded-2xl shadow-xl overflow-hidden max-h-56 overflow-y-auto no-scrollbar backdrop-blur-lg"
            >
              {options.map((opt) => {
                const optVal = typeof opt === "string" ? opt : opt.id;
                const optLabel = typeof opt === "string" ? opt : opt.label;
                const isSelected = value === optVal;
                return (
                  <button
                    key={optVal}
                    type="button"
                    onClick={() => {
                      onChange(optVal);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-xs text-left transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white font-bold"
                        : "text-(--foreground) hover:bg-blue-500/10"
                    }`}
                  >
                    <span className="truncate">{optLabel}</span>
                    {isSelected && <Check size={12} className="shrink-0" />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const getPlatformEmoji = (platformId) => {
  switch (platformId) {
    case "facebook": return "👥";
    case "instagram": return "📸";
    case "google": return "🔍";
    case "linkedin": return "💼";
    case "tiktok": return "🎵";
    case "youtube": return "📺";
    default: return "🌐";
  }
};


export default function AdCopyABPlanner() {
  // --- Persistent Storage State ---
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");

  // --- Runtime UI State ---
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, workspace, compare, timeline, export
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // --- Form & Editor States ---
  const [isEditingCampaign, setIsEditingCampaign] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  
  // Campaign Form Data
  const [formCampName, setFormCampName] = useState("");
  const [formCampType, setFormCampType] = useState("Product Launch");
  const [formCampPlatform, setFormCampPlatform] = useState("facebook");
  const [formCampGoal, setFormCampGoal] = useState("");
  const [formCampPriority, setFormCampPriority] = useState("medium");
  const [formCampStatus, setFormCampStatus] = useState("idea");
  const [formCampStart, setFormCampStart] = useState("");
  const [formCampEnd, setFormCampEnd] = useState("");
  const [formCampDesc, setFormCampDesc] = useState("");

  // Selected Variant Details (for workspace editing)
  const [editingVariantId, setEditingVariantId] = useState("");
  const [variantName, setVariantName] = useState("");
  const [variantHeadline, setVariantHeadline] = useState("");
  const [variantDesc, setVariantDesc] = useState("");
  const [variantCta, setVariantCta] = useState("Shop Now");
  const [variantOffer, setVariantOffer] = useState("");
  const [variantAngle, setVariantAngle] = useState("Benefit-Driven");
  const [variantFunnel, setVariantFunnel] = useState("TOFU (Top of Funnel)");
  const [variantTone, setVariantTone] = useState("Professional");

  // Campaign Strategy Notes states
  const [stratAudience, setStratAudience] = useState("");
  const [stratFunnel, setStratFunnel] = useState("");
  const [stratOffer, setStratOffer] = useState("");
  const [stratObs, setStratObs] = useState("");

  // Preview Mockups Active Device/Style State
  const [previewVariantId, setPreviewVariantId] = useState("");

  // Print friendly view state
  const [isPrintFriendly, setIsPrintFriendly] = useState(false);

  // Backup file inputs
  const [importJson, setImportJson] = useState("");
  const [importStatus, setImportStatus] = useState("");

  // Simulated Comments Trigger
  const [teamComments, setTeamComments] = useState([]);

  // --- LocalStorage Loading ---
  useEffect(() => {
    const localCamps = localStorage.getItem("ad_copy_planner_campaigns");
    if (localCamps) {
      const parsed = JSON.parse(localCamps);
      setCampaigns(parsed);
      if (parsed.length > 0) {
        setSelectedCampaignId(parsed[0].id);
      }
    } else {
      setCampaigns(INITIAL_CAMPAIGNS);
      if (INITIAL_CAMPAIGNS.length > 0) {
        setSelectedCampaignId(INITIAL_CAMPAIGNS[0].id);
      }
    }
  }, []);

  // --- LocalStorage Syncing ---
  useEffect(() => {
    if (campaigns.length > 0) {
      localStorage.setItem("ad_copy_planner_campaigns", JSON.stringify(campaigns));
    }
  }, [campaigns]);

  // --- Current Campaign Selector Helper ---
  const activeCampaign = useMemo(() => {
    return campaigns.find(c => c.id === selectedCampaignId) || null;
  }, [campaigns, selectedCampaignId]);

  // Sync active campaign text blocks into Strategy edit fields
  useEffect(() => {
    if (activeCampaign) {
      setStratAudience(activeCampaign.audienceNotes || "");
      setStratFunnel(activeCampaign.funnelNotes || "");
      setStratOffer(activeCampaign.offerStrategy || "");
      setStratObs(activeCampaign.observations || "");

      // Select first variant as active for preview/edit if none is selected
      if (activeCampaign.variants && activeCampaign.variants.length > 0) {
        setPreviewVariantId(activeCampaign.variants[0].id);
        const firstVar = activeCampaign.variants[0];
        setEditingVariantId(firstVar.id);
        setVariantName(firstVar.name);
        setVariantHeadline(firstVar.headline);
        setVariantDesc(firstVar.description);
        setVariantCta(firstVar.cta);
        setVariantOffer(firstVar.offer);
        setVariantAngle(firstVar.angle);
        setVariantFunnel(firstVar.funnelStage);
        setVariantTone(firstVar.tone);
      } else {
        setPreviewVariantId("");
        setEditingVariantId("");
      }
    }
  }, [selectedCampaignId, campaigns]);

  // Calculate live review checklist and warnings for editing variant
  const activeVariantWarnings = useMemo(() => {
    if (!activeCampaign || !variantHeadline) return [];
    const platformConfig = PLATFORMS.find(p => p.id === activeCampaign.platform);
    if (!platformConfig) return [];

    const issues = [];
    const headLen = variantHeadline.length;
    const descLen = variantDesc.length;

    if (headLen > platformConfig.limits.headline) {
      issues.push({ text: `Headline exceeds recommended ${platformConfig.limits.headline} characters (Currently: ${headLen})`, type: "danger" });
    }
    if (descLen > platformConfig.limits.description) {
      issues.push({ text: `Description exceeds recommended ${platformConfig.limits.description} characters (Currently: ${descLen})`, type: "danger" });
    }
    if (headLen > 0 && headLen < 10) {
      issues.push({ text: "Headline is quite short. Try adding a key benefit.", type: "warning" });
    }
    if (!variantOffer) {
      issues.push({ text: "No promotional offer or discount is configured for this copy.", type: "info" });
    }

    return issues;
  }, [activeCampaign, variantHeadline, variantDesc, variantOffer]);

  // Compute live comments based on variant copies
  useEffect(() => {
    if (!activeCampaign) {
      setTeamComments([]);
      return;
    }

    const platformConfig = PLATFORMS.find(p => p.id === activeCampaign.platform);
    const comments = [];

    // General setup note
    comments.push({
      sender: "Strategist Bot",
      text: `Optimizing copy for ${platformConfig?.label || "the platform"} targeting the ${variantFunnel || "funnel"} stage.`,
      status: "info"
    });

    if (variantHeadline.length > (platformConfig?.limits.headline || 40)) {
      comments.push(SIMULATED_FEEDBACK.headlineTooLong[0]);
    } else if (variantHeadline.length > 15) {
      comments.push(SIMULATED_FEEDBACK.headlineGood[0]);
    }

    if (variantDesc.length > (platformConfig?.limits.description || 120)) {
      comments.push(SIMULATED_FEEDBACK.descriptionTooLong[0]);
    }

    if (!variantOffer) {
      comments.push(SIMULATED_FEEDBACK.noOffer[0]);
    } else {
      comments.push({
        sender: "Promo Lead",
        text: `The hook: "${variantOffer}" adds excellent click incentive.`,
        status: "success"
      });
    }

    if (activeCampaign.variants && activeCampaign.variants.length > 1) {
      comments.push(SIMULATED_FEEDBACK.successGeneral[0]);
    }

    setTeamComments(comments);

  }, [variantHeadline, variantDesc, variantOffer, activeCampaign, variantFunnel]);

  // --- Dashboard Metrics & Stats ---
  const stats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter(c => c.status === "testing").length;
    const completed = campaigns.filter(c => c.status === "completed").length;
    const review = campaigns.filter(c => c.status === "review").length;
    
    // Count variants
    const totalVariants = campaigns.reduce((acc, curr) => acc + (curr.variants?.length || 0), 0);
    
    // Calculate progress
    let completionPercent = 0;
    if (total > 0) {
      const weightSum = campaigns.reduce((acc, c) => {
        if (c.status === "completed") return acc + 100;
        if (c.status === "finalized") return acc + 90;
        if (c.status === "review") return acc + 75;
        if (c.status === "testing") return acc + 50;
        if (c.status === "ready") return acc + 30;
        if (c.status === "draft") return acc + 15;
        return acc + 5;
      }, 0);
      completionPercent = Math.round(weightSum / total);
    }

    return { total, active, completed, review, totalVariants, completionPercent };
  }, [campaigns]);

  // Filtered Campaigns for Dashboard Summary lists
  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.variants?.some(v => v.headline.toLowerCase().includes(q))
      );
    }

    if (filterPlatform !== "all") {
      result = result.filter(c => c.platform === filterPlatform);
    }

    if (filterStatus !== "all") {
      result = result.filter(c => c.status === filterStatus);
    }

    return result;
  }, [campaigns, searchQuery, filterPlatform, filterStatus]);

  // --- Campaign Handlers ---
  const handleSaveCampaign = (e) => {
    e.preventDefault();
    if (!formCampName.trim()) return;

    if (isEditingCampaign && selectedCampaignId) {
      setCampaigns(prev => prev.map(c => {
        if (c.id === selectedCampaignId) {
          return {
            ...c,
            name: formCampName.trim(),
            type: formCampType,
            platform: formCampPlatform,
            goal: formCampGoal.trim(),
            priority: formCampPriority,
            status: formCampStatus,
            startDate: formCampStart,
            endDate: formCampEnd,
            description: formCampDesc.trim()
          };
        }
        return c;
      }));
      setIsEditingCampaign(false);
    } else {
      const newCamp = {
        id: `camp-${Date.now()}`,
        name: formCampName.trim(),
        type: formCampType,
        platform: formCampPlatform,
        goal: formCampGoal.trim(),
        priority: formCampPriority,
        status: formCampStatus,
        startDate: formCampStart || new Date().toISOString().split("T")[0],
        endDate: formCampEnd || new Date(Date.now() + 30*24*60*60*1000).toISOString().split("T")[0],
        description: formCampDesc.trim(),
        audienceNotes: "",
        funnelNotes: "",
        offerStrategy: "",
        observations: "",
        createdAt: new Date().toISOString(),
        variants: [
          {
            id: `var-${Date.now()}-1`,
            name: "Variant A (Default)",
            headline: "Headline A",
            description: "Ad copywriting goes here. Add value hooks and clear benefit pitches.",
            cta: "Learn More",
            offer: "",
            angle: "Benefit-Driven",
            funnelStage: "TOFU (Top of Funnel)",
            tone: "Professional",
            isWinner: false,
            metrics: { ctr: 0, conversion: 0, cost: 0 }
          },
          {
            id: `var-${Date.now()}-2`,
            name: "Variant B (Default)",
            headline: "Headline B",
            description: "Alternative A/B version description. Try changing the tone or highlight a discount.",
            cta: "Shop Now",
            offer: "",
            angle: "Pain Point Focus",
            funnelStage: "TOFU (Top of Funnel)",
            tone: "Bold",
            isWinner: false,
            metrics: { ctr: 0, conversion: 0, cost: 0 }
          }
        ]
      };
      setCampaigns(prev => [newCamp, ...prev]);
      setSelectedCampaignId(newCamp.id);
    }

    setShowCampaignModal(false);
    // Reset inputs
    setFormCampName("");
    setFormCampGoal("");
    setFormCampDesc("");
  };

  const handleEditCampaignTrigger = (campaign) => {
    setIsEditingCampaign(true);
    setFormCampName(campaign.name);
    setFormCampType(campaign.type);
    setFormCampPlatform(campaign.platform);
    setFormCampGoal(campaign.goal);
    setFormCampPriority(campaign.priority);
    setFormCampStatus(campaign.status);
    setFormCampStart(campaign.startDate);
    setFormCampEnd(campaign.endDate);
    setFormCampDesc(campaign.description);
    setShowCampaignModal(true);
  };

  const handleDeleteCampaign = (id) => {
    if (confirm("Are you sure you want to delete this campaign planner workspace?")) {
      const remaining = campaigns.filter(c => c.id !== id);
      setCampaigns(remaining);
      if (remaining.length > 0) {
        setSelectedCampaignId(remaining[0].id);
      } else {
        setSelectedCampaignId("");
      }
    }
  };

  const handleAddCampaignTrigger = () => {
    setIsEditingCampaign(false);
    setFormCampName("");
    setFormCampType("Product Launch");
    setFormCampPlatform("facebook");
    setFormCampGoal("");
    setFormCampPriority("medium");
    setFormCampStatus("idea");
    setFormCampStart(new Date().toISOString().split("T")[0]);
    setFormCampEnd(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setFormCampDesc("");
    setShowCampaignModal(true);
  };

  // --- Campaign Strategy Saves ---
  const saveStrategyNotes = () => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === selectedCampaignId) {
        return {
          ...c,
          audienceNotes: stratAudience,
          funnelNotes: stratFunnel,
          offerStrategy: stratOffer,
          observations: stratObs
        };
      }
      return c;
    }));
    alert("Strategy & Notes saved successfully!");
  };

  // --- Variant Handlers ---
  const handleSelectVariantToEdit = (variant) => {
    setEditingVariantId(variant.id);
    setVariantName(variant.name);
    setVariantHeadline(variant.headline);
    setVariantDesc(variant.description);
    setVariantCta(variant.cta);
    setVariantOffer(variant.offer);
    setVariantAngle(variant.angle);
    setVariantFunnel(variant.funnelStage);
    setVariantTone(variant.tone);
  };

  const handleSaveVariantData = () => {
    if (!editingVariantId || !selectedCampaignId) return;

    setCampaigns(prev => prev.map(camp => {
      if (camp.id === selectedCampaignId) {
        const updatedVariants = camp.variants.map(v => {
          if (v.id === editingVariantId) {
            // Re-simulate metrics slightly if copies change
            const isCopyChanged = v.headline !== variantHeadline || v.description !== variantDesc;
            const updatedMetrics = isCopyChanged 
              ? {
                  ctr: Number((2 + Math.random() * 3).toFixed(2)),
                  conversion: Number((0.5 + Math.random() * 2).toFixed(2)),
                  cost: Number((0.5 + Math.random() * 1.5).toFixed(2))
                }
              : v.metrics;

            return {
              ...v,
              name: variantName,
              headline: variantHeadline,
              description: variantDesc,
              cta: variantCta,
              offer: variantOffer,
              angle: variantAngle,
              funnelStage: variantFunnel,
              tone: variantTone,
              metrics: updatedMetrics
            };
          }
          return v;
        });
        return { ...camp, variants: updatedVariants };
      }
      return camp;
    }));
  };

  const handleAddVariant = () => {
    if (!selectedCampaignId || !activeCampaign) return;
    
    const letter = String.fromCharCode(65 + activeCampaign.variants.length); // A, B, C...
    const newVariant = {
      id: `var-${Date.now()}`,
      name: `Variant ${letter} (${variantAngle || "Alternative"})`,
      headline: "Write alternative headline...",
      description: "Alternative description content targeting secondary messaging angles.",
      cta: activeCampaign.variants[0]?.cta || "Learn More",
      offer: activeCampaign.variants[0]?.offer || "",
      angle: "Question/Hook",
      funnelStage: "TOFU (Top of Funnel)",
      tone: "Bold",
      isWinner: false,
      metrics: { ctr: 0, conversion: 0, cost: 0 }
    };

    setCampaigns(prev => prev.map(c => {
      if (c.id === selectedCampaignId) {
        return {
          ...c,
          variants: [...c.variants, newVariant]
        };
      }
      return c;
    }));

    handleSelectVariantToEdit(newVariant);
    setPreviewVariantId(newVariant.id);
  };

  const handleDeleteVariant = (varId) => {
    if (!selectedCampaignId || !activeCampaign) return;
    if (activeCampaign.variants.length <= 1) {
      alert("A campaign must contain at least one ad copy variant.");
      return;
    }

    if (confirm("Delete this variant copy?")) {
      const remainingVariants = activeCampaign.variants.filter(v => v.id !== varId);
      setCampaigns(prev => prev.map(c => {
        if (c.id === selectedCampaignId) {
          return { ...c, variants: remainingVariants };
        }
        return c;
      }));

      if (editingVariantId === varId && remainingVariants.length > 0) {
        handleSelectVariantToEdit(remainingVariants[0]);
      }
    }
  };

  const handleDuplicateVariant = (v) => {
    if (!selectedCampaignId || !activeCampaign) return;
    const duplicated = {
      ...v,
      id: `var-${Date.now()}`,
      name: `${v.name} (Copy)`,
      isWinner: false
    };

    setCampaigns(prev => prev.map(c => {
      if (c.id === selectedCampaignId) {
        return {
          ...c,
          variants: [...c.variants, duplicated]
        };
      }
      return c;
    }));

    handleSelectVariantToEdit(duplicated);
    setPreviewVariantId(duplicated.id);
  };

  const handleSetWinner = (varId) => {
    if (!selectedCampaignId) return;

    setCampaigns(prev => prev.map(c => {
      if (c.id === selectedCampaignId) {
        const updated = c.variants.map(v => ({
          ...v,
          isWinner: v.id === varId ? !v.isWinner : false
        }));
        return { ...c, variants: updated };
      }
      return c;
    }));
  };

  // --- Print Friendly Style Helper ---
  const triggerPrintLayout = () => {
    window.print();
  };

  // --- Export and Backup Restore Handlers ---
  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(campaigns, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `ad-copy-planner-backup.json`);
    dlAnchorElem.click();
  };

  const handleImportBackup = () => {
    setImportStatus("");
    try {
      const parsed = JSON.parse(importJson);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].variants) {
        setCampaigns(parsed);
        setSelectedCampaignId(parsed[0].id);
        setImportStatus("success");
        setImportJson("");
      } else {
        setImportStatus("invalid structure. Make sure it contains campaigns array.");
      }
    } catch (e) {
      setImportStatus("failed to parse JSON syntax.");
    }
  };

  const handleResetWorkspace = () => {
    if (confirm("Reset all campaign planning workspaces to factory defaults?")) {
      setCampaigns(INITIAL_CAMPAIGNS);
      setSelectedCampaignId(INITIAL_CAMPAIGNS[0].id);
      localStorage.removeItem("ad_copy_planner_campaigns");
    }
  };

  // --- Mock Ad Platform Details Map ---
  const activePlatformLogo = (platformId) => {
    switch (platformId) {
      case "facebook": return "bg-blue-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm shadow";
      case "instagram": return "bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 text-white font-bold rounded-2xl w-8 h-8 flex items-center justify-center text-sm shadow";
      case "google": return "bg-white border text-red-500 font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm shadow";
      case "linkedin": return "bg-blue-700 text-white font-bold rounded-sm w-8 h-8 flex items-center justify-center text-sm shadow";
      case "tiktok": return "bg-black text-teal-400 font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm border border-teal-500 shadow";
      case "youtube": return "bg-red-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm shadow";
      default: return "bg-gray-700 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm shadow";
    }
  };

  const activePlatformLabelShort = (platformId) => {
    const match = PLATFORMS.find(p => p.id === platformId);
    return match ? match.label : "Custom Ad";
  };

  return (
    <div className="w-full font-secondary selection:bg-blue-500/30">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        
        {/* Dynamic Typing Header */}
        <Header />

        {/* Global Stats Dashboard Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Total Campaigns", value: stats.total, icon: Layers, color: "text-blue-500 bg-blue-500/10" },
            { label: "Active Tests", value: stats.active, icon: Activity, color: "text-purple-500 bg-purple-500/10" },
            { label: "Draft Copies", value: stats.totalVariants, icon: Columns, color: "text-yellow-500 bg-yellow-500/10" },
            { label: "Pending Review", value: stats.review, icon: MessageSquare, color: "text-pink-500 bg-pink-500/10" },
            { label: "Completed Tests", value: stats.completed, icon: Trophy, color: "text-emerald-500 bg-emerald-500/10" },
            { label: "Plan Completion", value: `${stats.completionPercent}%`, icon: Sparkles, color: "text-amber-500 bg-amber-500/10" }
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              key={i}
              className="bg-(--card) border border-(--border) p-4 rounded-3xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-blue-500/35 transition-all min-w-0"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest leading-tight break-words pr-2">{stat.label}</span>
                <div className={`p-2 rounded-xl text-xs shrink-0 ${stat.color}`}>
                  <stat.icon size={14} />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-(--foreground) mt-1">{stat.value}</h3>
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-500 group-hover:w-full transition-all duration-300" />
            </motion.div>
          ))}
        </div>

        {/* Workspace Shell */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT SIDEBAR: Campaign Navigation & Platform Stats */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Elegant Tab Selectors */}
            <div className="p-1.5 bg-(--card) border border-(--border) rounded-3xl grid grid-cols-5 gap-1 shadow-md">
              {[
                { id: "dashboard", label: "Home", icon: Grid },
                { id: "workspace", label: "Editor", icon: Sliders },
                { id: "compare", label: "A/B", icon: Columns },
                { id: "timeline", label: "Time", icon: Calendar },
                { id: "export", label: "Share", icon: Share2 }
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
                  <span className="text-[8px] font-black uppercase tracking-tight text-center">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Campaign List Selector */}
            <GlassCard 
              title="Campaign Workspaces" 
              icon={Folder}
              headerActions={
                <button 
                  onClick={handleAddCampaignTrigger}
                  className="p-1.5 rounded-xl bg-blue-600 text-white hover:scale-105 transition-all text-xs flex items-center gap-1 font-bold uppercase tracking-wider px-2.5"
                >
                  <Plus size={12} />
                  <span>New</span>
                </button>
              }
            >
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                {campaigns.map(camp => {
                  const isActive = camp.id === selectedCampaignId;
                  const platformConfig = PLATFORMS.find(p => p.id === camp.platform);
                  const statusMatch = STATUS_STAGES.find(s => s.id === camp.status);
                  return (
                    <div
                      key={camp.id}
                      onClick={() => setSelectedCampaignId(camp.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 min-w-0 overflow-hidden ${
                        isActive 
                          ? "bg-blue-500/10 border-blue-500/50 shadow-md shadow-blue-500/5" 
                          : "bg-(--background) border-(--border) hover:border-blue-500/20"
                      }`}
                    >
                      <div className="space-y-2 min-w-0">
                        <h4 className="text-xs font-bold text-(--foreground) leading-snug whitespace-normal break-normal">
                          {camp.name}
                        </h4>
                        <span className="inline-flex w-fit max-w-full text-[8px] px-2 py-0.5 rounded-full border border-blue-500/20 text-blue-500 font-extrabold uppercase bg-blue-500/5 whitespace-nowrap">
                          {platformConfig?.label.split(" ")[0]}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-1 text-[9px] text-muted-foreground min-w-0">
                        <span className={`px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap ${statusMatch?.color}`}>
                          {statusMatch?.label}
                        </span>
                        <span className="capitalize font-black tracking-wider text-[8px] text-muted-foreground/75 whitespace-nowrap">
                          Priority: {camp.priority}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {campaigns.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">No campaigns found. Create one to begin.</p>
                )}
              </div>
            </GlassCard>

            {/* Strategy Context Summary Widget */}
            {activeCampaign && (
              <GlassCard title="Campaign Details" icon={Zap}>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between gap-3 border-b border-(--border) pb-2 min-w-0">
                    <span className="text-muted-foreground font-semibold">Goal Objective:</span>
                    <span className="text-(--foreground) font-bold text-right break-words min-w-0">{activeCampaign.goal || "Not Configured"}</span>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-(--border) pb-2 min-w-0">
                    <span className="text-muted-foreground font-semibold">Campaign Type:</span>
                    <span className="text-(--foreground) font-bold text-right break-words min-w-0">{activeCampaign.type}</span>
                  </div>
                  <div className="flex justify-between border-b border-(--border) pb-2">
                    <span className="text-muted-foreground font-semibold">Total Variants:</span>
                    <span className="text-blue-500 font-bold">{activeCampaign.variants?.length || 0} copies</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-semibold">Launch Schedule:</span>
                    <span className="text-(--foreground) font-mono text-[10px]">{activeCampaign.startDate}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-(--border)">
                    <button
                      onClick={() => handleEditCampaignTrigger(activeCampaign)}
                      className="flex-1 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 font-black uppercase text-[8px] tracking-wider transition-all flex items-center justify-center gap-1"
                    >
                      <Edit2 size={10} />
                      <span>Edit Settings</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(activeCampaign.id)}
                      className="py-2 px-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all flex items-center justify-center"
                      title="Delete Campaign"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Quick backup buttons */}
            <GlassCard title="Workspace Utility" icon={SlidersHorizontal}>
              <div className="space-y-2">
                <button
                  onClick={handleDownloadBackup}
                  className="w-full py-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-500 hover:bg-blue-500/10 font-bold uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Download size={12} />
                  <span>Download Backup File</span>
                </button>
                <button
                  onClick={handleResetWorkspace}
                  className="w-full py-2.5 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={12} />
                  <span>Restore Factory Defaults</span>
                </button>
              </div>
            </GlassCard>

          </div>

          {/* RIGHT COLUMN: Tab Page Views */}
          <div className="lg:col-span-9 space-y-6">
            
            <AnimatePresence mode="wait">

              {/* 1. DASHBOARD OVERVIEW TAB */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6"
                >
                  {/* Campaign Search and Filters bar */}
                  <div className="bg-(--card) border border-(--border) p-5 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center shadow-md">
                    <div className="md:col-span-4 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <input
                        type="text"
                        placeholder="Search campaign name, goal, copies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-(--background) border border-(--border) rounded-2xl pl-12 pr-4 py-3 text-xs focus:border-blue-500/50 outline-none transition-colors"
                      />
                    </div>
                    
                    <CustomSelect
                      value={filterPlatform}
                      onChange={setFilterPlatform}
                      options={[{ id: "all", label: "All Ad Platforms" }, ...PLATFORMS]}
                      icon={Globe}
                      className="md:col-span-3 z-30"
                      inline
                    />

                    <CustomSelect
                      value={filterStatus}
                      onChange={setFilterStatus}
                      options={[{ id: "all", label: "All Test Statuses" }, ...STATUS_STAGES]}
                      icon={Folder}
                      className="md:col-span-3 z-30"
                      inline
                    />

                    <div className="md:col-span-2">
                      <button
                        onClick={handleAddCampaignTrigger}
                        className="w-full py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:scale-102 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer"
                      >
                        <PlusCircle size={14} />
                        <span>Add Copy</span>
                      </button>
                    </div>
                  </div>

                  {/* Campaign Cards List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredCampaigns.map((camp, cIdx) => {
                      const platformConfig = PLATFORMS.find(p => p.id === camp.platform);
                      const statusConfig = STATUS_STAGES.find(s => s.id === camp.status);
                      const winners = camp.variants?.filter(v => v.isWinner) || [];

                      return (
                        <motion.div
                          key={camp.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: cIdx * 0.05 }}
                          className="bg-(--card) border border-(--border) rounded-3xl p-4 md:p-5 shadow-md hover:border-blue-500/20 transition-all flex flex-col justify-between gap-4 min-w-0 overflow-hidden"
                        >
                          {/* Card Header */}
                          <div className="flex justify-between items-start gap-3 border-b border-(--border) pb-3 min-w-0">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full max-w-full break-words ${
                                  camp.priority === "high" 
                                    ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                                    : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                }`}>
                                  {camp.priority} Priority
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border max-w-full break-words ${statusConfig?.color}`}>
                                  {statusConfig?.label}
                                </span>
                              </div>
                              <h3 className="text-base font-black text-(--foreground) leading-snug break-words">{camp.name}</h3>
                            </div>
                            <span className="text-lg shadow-sm p-2 rounded-2xl bg-(--background) border border-(--border) shrink-0">
                              {camp.platform === "facebook" && "👥"}
                              {camp.platform === "instagram" && "📸"}
                              {camp.platform === "google" && "🔍"}
                              {camp.platform === "linkedin" && "💼"}
                              {camp.platform === "tiktok" && "🎵"}
                              {camp.platform === "youtube" && "📺"}
                              {camp.platform === "custom" && "🌐"}
                            </span>
                          </div>

                          {/* Info Rows */}
                          <div className="space-y-2 text-xs">
                            <p className="text-muted-foreground leading-relaxed break-words">{camp.description || "No description provided."}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                              <div className="p-2 rounded-xl bg-(--background) border border-(--border) min-w-0">
                                <span className="text-muted-foreground uppercase text-[8px] font-bold block mb-0.5">Platform Setup</span>
                                <span className="font-extrabold text-(--foreground) break-words block">{platformConfig?.label}</span>
                              </div>
                              <div className="p-2 rounded-xl bg-(--background) border border-(--border) min-w-0">
                                <span className="text-muted-foreground uppercase text-[8px] font-bold block mb-0.5">Conversion Goal</span>
                                <span className="font-extrabold text-(--foreground) break-words block">{camp.goal || "Generic Conversion"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Variants Overview */}
                          <div className="space-y-2 bg-(--background)/50 border border-(--border)/75 p-3 rounded-2xl">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground block mb-1">A/B Testing Variants ({camp.variants?.length || 0})</span>
                            <div className="space-y-1.5">
                              {camp.variants?.map((v, vIdx) => (
                                <div key={v.id} className="flex justify-between items-center gap-2 text-xs min-w-0">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="font-mono text-[10px] text-muted-foreground">{vIdx+1}.</span>
                                    <span className="font-semibold text-(--foreground) break-words min-w-0">{v.name}</span>
                                    {v.isWinner && <Crown size={12} className="text-yellow-500 shrink-0 fill-yellow-500/20" />}
                                  </div>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-(--card) text-muted-foreground border border-(--border)/60 font-semibold shrink-0 max-w-[110px] break-words">{v.tone}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-(--border) sm:items-center justify-between min-w-0">
                            <span className="text-[9px] text-muted-foreground font-mono break-words min-w-0">
                              Timeline: {camp.startDate} to {camp.endDate}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedCampaignId(camp.id);
                                setActiveTab("workspace");
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all flex items-center gap-1"
                            >
                              <span>Manage Copy</span>
                              <ArrowRight size={10} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}

                    {filteredCampaigns.length === 0 && (
                      <div className="md:col-span-2 py-12 text-center border border-dashed border-(--border) rounded-3xl">
                        <AlertTriangle className="text-yellow-500 mx-auto mb-3" size={32} />
                        <h4 className="text-sm font-bold text-(--foreground) mb-1">No campaign plans match criteria</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">Try resetting active dashboard filters or click the button below to add a new campaign draft.</p>
                        <button
                          onClick={() => {
                            setFilterPlatform("all");
                            setFilterStatus("all");
                            setSearchQuery("");
                          }}
                          className="mt-4 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 font-bold uppercase text-[9px] tracking-wider transition-all"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 2. WORKSPACE / EDIT COPY TAB */}
              {activeTab === "workspace" && activeCampaign && (
                <motion.div
                  key="workspace"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6 animate-workspace-open"
                >
                  
                  {/* Top Campaign Info Header & Variant select tabs */}
                  <div className="bg-(--card) border border-(--border) p-4 md:p-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md min-w-0 overflow-hidden">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[9px] px-2 py-0.5 rounded-full border border-blue-500/20 text-blue-500 uppercase tracking-widest font-black bg-blue-500/5 break-words">
                          {activePlatformLabelShort(activeCampaign.platform)}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full border border-purple-500/20 text-purple-500 uppercase tracking-widest font-black bg-purple-500/5 break-words">
                          {activeCampaign.type}
                        </span>
                      </div>
                      <h2 className="text-lg font-black text-(--foreground) tracking-tight break-words">{activeCampaign.name}</h2>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1">
                      {activeCampaign.variants?.map((v) => {
                        const isEditingThis = v.id === editingVariantId;
                        return (
                          <button
                            key={v.id}
                            onClick={() => handleSelectVariantToEdit(v)}
                            className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                              isEditingThis 
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" 
                                : "bg-(--background) border border-(--border) text-muted-foreground hover:border-blue-500/20"
                            }`}
                          >
                            <span className="max-w-[180px] break-words text-left leading-tight">{v.name}</span>
                            {v.isWinner && <Crown size={11} className="text-yellow-400 fill-yellow-400/20" />}
                          </button>
                        );
                      })}
                      <button
                        onClick={handleAddVariant}
                        className="p-2 rounded-2xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all shrink-0"
                        title="Add Variant Version"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Main editing grid splits: Inputs vs Live Previews */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT COLUMN: Variant Form inputs */}
                    <div className="xl:col-span-7 space-y-6">
                      
                      {editingVariantId ? (
                        <div className="bg-(--card) border border-(--border) rounded-3xl p-5 md:p-6 space-y-4 shadow-sm">
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-(--border) pb-3 min-w-0">
                            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2 min-w-0">
                              <Sliders size={14} className="text-blue-500" />
                              <span className="break-words">Configure Copy Specifications</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleSetWinner(editingVariantId)}
                                className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border transition-all ${
                                  activeCampaign.variants.find(v => v.id === editingVariantId)?.isWinner
                                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/25"
                                    : "bg-(--background) border-(--border) text-muted-foreground hover:text-(--foreground)"
                                }`}
                              >
                                <Award size={10} />
                                  <span className="hidden sm:inline">Winner Selection</span>
                              </button>
                              <button
                                onClick={() => handleDuplicateVariant(activeCampaign.variants.find(v => v.id === editingVariantId))}
                                className="p-1 px-2 rounded-xl bg-(--background) border border-(--border) text-muted-foreground hover:text-(--foreground)"
                                title="Duplicate Variant"
                              >
                                <Copy size={11} />
                              </button>
                              <button
                                onClick={() => handleDeleteVariant(editingVariantId)}
                                className="p-1 px-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20"
                                title="Delete Variant"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Variant Label Name</label>
                              <input
                                type="text"
                                value={variantName}
                                onChange={(e) => { setVariantName(e.target.value); setTimeout(handleSaveVariantData, 50); }}
                                className="w-full bg-(--background) border border-(--border) rounded-2xl px-4 py-3 text-xs focus:border-blue-500/50 outline-none font-bold"
                              />
                            </div>

                            <CustomSelect
                              label="Call-To-Action (CTA)"
                              value={variantCta}
                              onChange={(val) => { setVariantCta(val); setTimeout(handleSaveVariantData, 50); }}
                              options={["Shop Now", "Learn More", "Sign Up", "Start Free Trial", "Download Now", "Apply Now", "Book Now", "Contact Us"]}
                            />

                            <CustomSelect
                              label="Messaging Angle"
                              value={variantAngle}
                              onChange={(val) => { setVariantAngle(val); setTimeout(handleSaveVariantData, 50); }}
                              options={ANGLES}
                            />

                            <CustomSelect
                              label="Tone Style"
                              value={variantTone}
                              onChange={(val) => { setVariantTone(val); setTimeout(handleSaveVariantData, 50); }}
                              options={TONE_OPTIONS}
                            />

                            <CustomSelect
                              label="Funnel Segment"
                              value={variantFunnel}
                              onChange={(val) => { setVariantFunnel(val); setTimeout(handleSaveVariantData, 50); }}
                              options={FUNNEL_STAGES}
                            />

                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Value Offer Hook</label>
                              <input
                                type="text"
                                placeholder="e.g. 50% discount, Free shipping"
                                value={variantOffer}
                                onChange={(e) => { setVariantOffer(e.target.value); setTimeout(handleSaveVariantData, 50); }}
                                className="w-full bg-(--background) border border-(--border) rounded-2xl px-4 py-3 text-xs focus:border-blue-500/50 outline-none"
                              />
                            </div>

                          </div>

                          {/* Headline Input Area */}
                          <div className="space-y-1.5 pt-2">
                            <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground">
                              <label>Ad Headline Copy</label>
                              <span className={variantHeadline.length > (PLATFORMS.find(p => p.id === activeCampaign.platform)?.limits.headline || 40) ? "text-red-500" : "text-blue-500 font-mono"}>
                                {variantHeadline.length} / {PLATFORMS.find(p => p.id === activeCampaign.platform)?.limits.headline} recommended
                              </span>
                            </div>
                            <input
                              type="text"
                              value={variantHeadline}
                              onChange={(e) => { setVariantHeadline(e.target.value); setTimeout(handleSaveVariantData, 50); }}
                              className="w-full bg-(--background) border border-(--border) rounded-2xl px-4 py-3 text-xs font-extrabold focus:border-blue-500/50 outline-none text-(--foreground)"
                              placeholder="Write a compelling title hook..."
                            />
                            {/* Visual Progress Bar for Headline Limit */}
                            <div className="h-1 bg-gray-500/10 rounded-full overflow-hidden w-full">
                              <div 
                                className={`h-full transition-all duration-150 ${variantHeadline.length > (PLATFORMS.find(p => p.id === activeCampaign.platform)?.limits.headline || 40) ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min((variantHeadline.length / (PLATFORMS.find(p => p.id === activeCampaign.platform)?.limits.headline || 40)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Description Input Area */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground">
                              <label>Primary Text / Body Copy</label>
                              <span className={variantDesc.length > (PLATFORMS.find(p => p.id === activeCampaign.platform)?.limits.description || 125) ? "text-red-500" : "text-blue-500 font-mono"}>
                                {variantDesc.length} / {PLATFORMS.find(p => p.id === activeCampaign.platform)?.limits.description} recommended
                              </span>
                            </div>
                            <textarea
                              rows={4}
                              value={variantDesc}
                              onChange={(e) => { setVariantDesc(e.target.value); setTimeout(handleSaveVariantData, 50); }}
                              className="w-full bg-(--background) border border-(--border) rounded-2xl p-4 text-xs focus:border-blue-500/50 outline-none resize-none leading-relaxed text-(--foreground)"
                              placeholder="Draft the body text details..."
                            />
                            {/* Visual Progress Bar for Description Limit */}
                            <div className="h-1 bg-gray-500/10 rounded-full overflow-hidden w-full">
                              <div 
                                className={`h-full transition-all duration-150 ${variantDesc.length > (PLATFORMS.find(p => p.id === activeCampaign.platform)?.limits.description || 125) ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min((variantDesc.length / (PLATFORMS.find(p => p.id === activeCampaign.platform)?.limits.description || 125)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* QA Checklist Warning box */}
                          {activeVariantWarnings.length > 0 && (
                          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl text-[10px] space-y-1 min-w-0">
                              <span className="font-black text-red-500 flex items-center gap-1 uppercase tracking-wider mb-1">
                                <AlertTriangle size={11} />
                                <span>Copy Constraints Feedback:</span>
                              </span>
                              {activeVariantWarnings.map((w, idx) => (
                                <p key={idx} className="text-muted-foreground leading-relaxed break-words">
                                  • {w.text}
                                </p>
                              ))}
                            </div>
                          )}

                        </div>
                      ) : (
                        <div className="bg-(--card) border border-(--border) p-8 text-center rounded-3xl">
                          <p className="text-xs text-muted-foreground italic">Add or select a variant copy to edit.</p>
                        </div>
                      )}

                      {/* Collaborative Simulated Team Comments critique section */}
                      <GlassCard title="Automated Copy Advisor Comments" icon={MessageSquare}>
                        <div className="space-y-3">
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Simulated virtual agency team providing immediate creative advice on your drafted variants:
                          </p>

                          <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1 no-scrollbar">
                            {teamComments.map((com, idx) => (
                              <div key={idx} className="p-2.5 rounded-2xl bg-(--background) border border-(--border) flex gap-2 min-w-0">
                                <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-500 text-[9px] font-black h-fit shrink-0 tracking-wider">
                                  {com.sender.split(" ")[0]}
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                  <span className="text-[8px] font-bold text-muted-foreground">{com.sender}</span>
                                  <p className="text-[10px] text-(--foreground) leading-relaxed break-words">{com.text}</p>
                                </div>
                              </div>
                            ))}
                            {teamComments.length === 0 && (
                              <p className="text-xs text-muted-foreground italic text-center py-4">Draft headline copy to start automated evaluations.</p>
                            )}
                          </div>
                        </div>
                      </GlassCard>

                    </div>

                    {/* RIGHT COLUMN: Realistic Live Mock ad Previews */}
                    <div className="xl:col-span-5 space-y-6">
                      
                      <GlassCard 
                        title="Live Platform Ad Preview" 
                        icon={Eye}
                      >
                        <p className="text-[10px] text-muted-foreground leading-relaxed mb-4">
                          Realistic visual representation of this mockup on <strong>{activePlatformLabelShort(activeCampaign.platform)}</strong>:
                        </p>

                        <div className="w-full bg-(--background) border border-(--border) rounded-3xl p-4 overflow-hidden relative shadow-inner">
                          
                          {/* PLATFORM MOCKUP: FACEBOOK */}
                          {activeCampaign.platform === "facebook" && (
                            <div className="w-full bg-white text-black p-3.5 border rounded-2xl font-sans text-xs space-y-3 shadow-md max-w-sm mx-auto">
                              <div className="flex items-center gap-2">
                                <div className={activePlatformLogo("facebook")}>F</div>
                                <div>
                                  <div className="font-extrabold text-[12px] text-slate-900 leading-tight">Sponsored Brand</div>
                                  <div className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                                    <span>Sponsored</span>
                                    <span>•</span>
                                    <span>🌐</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-slate-800 leading-relaxed text-[11px] break-words whitespace-pre-wrap">{variantDesc || "Draft primary text details..."}</p>
                              
                              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                                {/* Simulated image banner */}
                                <div className="h-36 w-full bg-gradient-to-r from-blue-600/30 to-purple-600/20 flex flex-col items-center justify-center relative p-3">
                                  <span className="text-[9px] bg-slate-900/60 text-white font-bold uppercase tracking-wider rounded px-2.5 py-1">Banner Visual Backdrop</span>
                                  <span className="text-[10px] font-black text-slate-700 mt-2 text-center break-words">{variantOffer || "Value Hook Details"}</span>
                                </div>
                                <div className="p-3 flex justify-between items-center gap-2 border-t bg-slate-100/70">
                                  <div className="min-w-0">
                                    <span className="text-[9px] text-slate-500 uppercase tracking-tight block">ALFTTOOL.COM/GO</span>
                                    <h4 className="font-extrabold text-slate-800 text-[11px] break-words">{variantHeadline || "Headline Hook"}</h4>
                                  </div>
                                  <button className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-[10px] py-1.5 px-3 rounded shrink-0 border border-slate-300 uppercase">
                                    {variantCta}
                                  </button>
                                </div>
                              </div>
                              
                              {/* Reactions footer */}
                              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 font-medium">
                                <span className="flex items-center gap-1">👍❤️ 128 likes</span>
                                <span>14 comments • 3 shares</span>
                              </div>
                            </div>
                          )}

                          {/* PLATFORM MOCKUP: INSTAGRAM */}
                          {activeCampaign.platform === "instagram" && (
                            <div className="w-full bg-white text-black p-3 border rounded-2xl font-sans text-xs shadow-md max-w-sm mx-auto">
                              <div className="flex items-center justify-between gap-1.5 mb-2.5">
                                <div className="flex items-center gap-2">
                                  <div className={activePlatformLogo("instagram")}>I</div>
                                  <div>
                                    <div className="font-bold text-[11px] text-slate-900">sponsored_creator</div>
                                    <div className="text-[9px] text-slate-500">Sponsored</div>
                                  </div>
                                </div>
                                <span className="font-bold text-slate-700">•••</span>
                              </div>
                              
                              {/* Square image display */}
                              <div className="aspect-square w-full bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-yellow-500/30 flex flex-col items-center justify-center p-4 relative">
                                <span className="text-[9px] bg-slate-900/60 text-white font-extrabold uppercase px-2 py-1 rounded">Instagram Feed Asset</span>
                                <h4 className="text-center font-black text-slate-800 text-sm mt-3 px-4 drop-shadow-sm break-words">{variantHeadline || "Alternative Headline"}</h4>
                                <span className="absolute bottom-4 left-4 right-4 text-center text-[10px] bg-white/80 border border-purple-500/20 text-purple-700 px-3 py-1 rounded-full font-black uppercase tracking-wider break-words">
                                  {variantOffer || "Exclusive Offer"}
                                </span>
                              </div>

                              {/* CTA Banner strip */}
                              <div className="bg-slate-50 border-y py-2 px-3 flex justify-between items-center gap-1 hover:bg-slate-100/50 cursor-pointer">
                                <span className="text-[11px] text-blue-600 font-bold">{variantCta}</span>
                                <span className="text-blue-500 text-xs font-bold">➔</span>
                              </div>

                              {/* Likes & caption block */}
                              <div className="pt-2 space-y-1 text-[11px]">
                                <div className="font-bold text-slate-900">2,410 likes</div>
                                <p className="leading-relaxed">
                                  <span className="font-bold mr-1.5">sponsored_creator</span>
                                  <span className="text-slate-800 break-words whitespace-pre-wrap">{variantDesc || "Draft caption details..."}</span>
                                </p>
                              </div>
                            </div>
                          )}

                          {/* PLATFORM MOCKUP: GOOGLE SEARCH */}
                          {activeCampaign.platform === "google" && (
                            <div className="w-full bg-white text-slate-800 p-3.5 border rounded-2xl font-sans text-xs shadow-md max-w-sm mx-auto space-y-2">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-sm font-bold text-[8px] uppercase">Sponsored</span>
                                <span>altftool.com</span>
                                <span>➔</span>
                                <span>promo</span>
                              </div>
                              <h4 className="text-blue-800 hover:underline font-medium text-[15px] cursor-pointer break-words leading-tight">
                                {variantHeadline || "Build Fast Workspace - Free Trial"} | {variantOffer || "50% Off Code"}
                              </h4>
                              <p className="text-slate-600 text-[11px] leading-relaxed break-words">
                                {variantDesc || "Explore cloud configurations. Launch serverless dev instances in 1 click."}
                              </p>
                              
                              {/* Sub links mockup */}
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 border-t text-[11px] text-blue-800">
                                <div>
                                  <span className="font-medium hover:underline cursor-pointer block">{variantCta}</span>
                                  <span className="text-slate-500 text-[9px] line-clamp-1">Register now for exclusive rewards.</span>
                                </div>
                                <div>
                                  <span className="font-medium hover:underline cursor-pointer block">Pricing Rates</span>
                                  <span className="text-slate-500 text-[9px] line-clamp-1">Explore flat tiers for teams.</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* PLATFORM MOCKUP: LINKEDIN */}
                          {activeCampaign.platform === "linkedin" && (
                            <div className="w-full bg-white text-slate-800 p-3.5 border rounded-2xl font-sans text-xs shadow-md max-w-sm mx-auto space-y-3">
                              <div className="flex items-center gap-2">
                                <div className={activePlatformLogo("linkedin")}>in</div>
                                <div>
                                  <div className="font-bold text-[11.5px] text-slate-900 leading-tight">Enterprise Solutions Inc.</div>
                                  <div className="text-[9px] text-slate-500 font-semibold">50,000+ followers • Promoted</div>
                                </div>
                              </div>
                              <p className="text-slate-900 text-[11px] leading-relaxed break-words whitespace-pre-wrap">{variantDesc}</p>
                              
                              <div className="border border-slate-200 rounded overflow-hidden">
                                <div className="h-32 w-full bg-gradient-to-r from-blue-700/20 to-teal-600/10 flex flex-col items-center justify-center p-4 text-center">
                                  <span className="text-[8px] bg-slate-900/60 text-white font-extrabold uppercase px-2 py-0.5 rounded tracking-widest mb-1.5">LinkedIn Sponsor</span>
                                  <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-wide max-w-[220px] leading-snug break-words">{variantHeadline || "Headline Hook"}</h4>
                                  <span className="text-[9px] text-slate-600 italic mt-1.5 max-w-[220px] break-words">{variantOffer || "Value Hook"}</span>
                                </div>
                                <div className="p-3 bg-slate-100 flex justify-between items-center border-t gap-2">
                                  <div className="min-w-0">
                                    <h4 className="font-extrabold text-slate-800 text-[11px] break-words">{variantHeadline || "Headline Hook"}</h4>
                                    <span className="text-slate-500 text-[9px] truncate block">enterprise-hub.com</span>
                                  </div>
                                  <button className="bg-transparent border border-blue-700 hover:bg-blue-50 text-blue-700 font-bold text-[10px] py-1 px-3.5 rounded-full shrink-0">
                                    {variantCta}
                                  </button>
                                </div>
                              </div>
                              
                              <div className="flex gap-4 text-[10px] text-slate-500 font-bold border-t pt-2.5">
                                <span>👍 Like</span>
                                <span>💬 Comment</span>
                                <span>🔁 Repost</span>
                                <span>📤 Send</span>
                              </div>
                            </div>
                          )}

                          {/* PLATFORM MOCKUP: TIKTOK */}
                          {activeCampaign.platform === "tiktok" && (
                            <div className="w-full bg-black text-white p-4 border border-zinc-800 rounded-3xl font-sans text-xs shadow-md max-w-xs mx-auto aspect-[9/16] relative flex flex-col justify-end overflow-hidden group">
                              {/* Background Video Simulator */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-indigo-950 z-0 flex flex-col items-center justify-center p-6 text-center">
                                <span className="p-2.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[9px] font-black uppercase tracking-widest animate-pulse">Video Preview Loop</span>
                                <h4 className="text-sm font-black text-slate-200 mt-4 break-words uppercase tracking-wide leading-snug">{variantHeadline}</h4>
                                <p className="text-[9px] text-slate-400 mt-2 italic">{variantOffer}</p>
                              </div>

                              {/* Overlaid UI content */}
                              <div className="z-10 w-full space-y-3 bg-gradient-to-t from-black/80 to-transparent p-2">
                                
                                <div className="flex justify-between items-end">
                                  <div className="space-y-1.5 min-w-0 flex-1">
                                    <div className="font-bold text-[12px] text-white flex items-center gap-1.5">
                                      <span>@viral_brand</span>
                                      <span className="bg-teal-500 text-black px-1 py-0.2 rounded text-[7px] font-black">AD</span>
                                    </div>
                                    <p className="text-[11px] text-slate-200 leading-normal break-words">{variantDesc}</p>
                                  </div>

                                  {/* Right side floating action icons */}
                                  <div className="flex flex-col items-center gap-4 text-center text-[10px] font-bold text-white shrink-0 ml-3 mb-1">
                                    <div className="flex flex-col items-center">
                                      <span className="p-2 rounded-full bg-slate-900/60 border text-md">❤️</span>
                                      <span className="text-[8px] text-slate-300">12.5k</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="p-2 rounded-full bg-slate-900/60 border text-md">💬</span>
                                      <span className="text-[8px] text-slate-300">452</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="p-2 rounded-full bg-slate-900/60 border text-md">🔁</span>
                                      <span className="text-[8px] text-slate-300">89</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Interactive bottom CTA banner button */}
                                <div className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-black rounded-lg font-black uppercase text-center tracking-widest text-[11px] transition-all cursor-pointer">
                                  {variantCta}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* PLATFORM MOCKUP: YOUTUBE */}
                          {activeCampaign.platform === "youtube" && (
                            <div className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl overflow-hidden font-sans text-xs shadow-md max-w-sm mx-auto">
                              <div className="aspect-video w-full bg-gradient-to-br from-red-600/30 to-zinc-950 flex flex-col items-center justify-center p-4 relative">
                                <span className="text-[9px] bg-red-600 text-white font-extrabold uppercase px-2 py-0.5 rounded tracking-widest mb-1.5">YouTube Ad Stream</span>
                                <h4 className="font-extrabold text-slate-100 text-center text-[12px] uppercase leading-snug max-w-[220px] break-words">{variantHeadline || "Headline Hook"}</h4>
                                <span className="text-[9px] text-slate-400 mt-1 max-w-[220px] break-words">{variantOffer || "Value Hook"}</span>
                                
                                {/* Overlay banner mockup at bottom */}
                                <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/90 border border-slate-800 rounded flex justify-between items-center gap-2">
                                  <div className="min-w-0">
                                    <span className="text-[8px] text-yellow-500 font-extrabold uppercase block tracking-wider leading-none">Sponsored</span>
                                    <h5 className="font-extrabold text-slate-100 text-[10px] break-words leading-tight mt-0.5">{variantHeadline || "Headline Hook"}</h5>
                                    <span className="text-slate-400 text-[8px] truncate block leading-none">altftool.com</span>
                                  </div>
                                  <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold text-[9px] py-1 px-3.5 rounded uppercase shrink-0">
                                    {variantCta}
                                  </button>
                                </div>
                              </div>
                              <div className="p-3 bg-slate-950 space-y-1">
                                <div className="flex justify-between items-center text-[10px] text-slate-400">
                                  <span>Skip Ad in 5s...</span>
                                  <span>Ad 1 of 2</span>
                                </div>
                                <p className="text-[10px] text-slate-300 break-words">{variantDesc || "Draft description details..."}</p>
                              </div>
                            </div>
                          )}

                          {/* PLATFORM MOCKUP: CUSTOM/GENERIC */}
                          {activeCampaign.platform === "custom" && (
                            <div className="w-full bg-(--card) text-(--foreground) p-4 border border-(--border) rounded-2xl text-xs shadow-md max-w-sm mx-auto space-y-3">
                              <h4 className="font-black text-sm border-b pb-2 uppercase tracking-widest text-blue-500">Generic Banner Ad</h4>
                              <h5 className="font-bold text-xs break-words">{variantHeadline || "Enter headline hook..."}</h5>
                              <p className="text-muted-foreground leading-relaxed text-[11px] break-words">{variantDesc || "Enter description details..."}</p>
                              <div className="p-2 rounded bg-(--background) border border-(--border) text-[10px] flex justify-between items-center gap-2 min-w-0">
                                <div className="min-w-0">
                                  <span className="text-[8px] text-muted-foreground uppercase block font-bold">Offer Attachment</span>
                                  <span className="font-bold text-emerald-500 break-words block">{variantOffer || "None Added"}</span>
                                </div>
                                <button className="bg-blue-600 text-white rounded font-bold px-3 py-1.5 uppercase text-[9px] tracking-wider">
                                  {variantCta}
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      </GlassCard>

                      {/* Strategy notes inline card */}
                      <GlassCard title="Campaign Strategy Notes" icon={FileText}>
                        <div className="space-y-4 text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Target Audience</label>
                            <textarea
                              rows={2}
                              value={stratAudience}
                              onChange={(e) => setStratAudience(e.target.value)}
                              className="w-full bg-(--background) border border-(--border) rounded-xl p-3 text-xs focus:border-blue-500/50 outline-none resize-none text-(--foreground)"
                              placeholder="Describe core target demographic, age brackets, interests..."
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Funnel Position Hook</label>
                            <textarea
                              rows={2}
                              value={stratFunnel}
                              onChange={(e) => setStratFunnel(e.target.value)}
                              className="w-full bg-(--background) border border-(--border) rounded-xl p-3 text-xs focus:border-blue-500/50 outline-none resize-none text-(--foreground)"
                              placeholder="How does this copy align with cold traffic vs warm retargeting goals?"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Promotional Angle/Offer</label>
                            <textarea
                              rows={2}
                              value={stratOffer}
                              onChange={(e) => setStratOffer(e.target.value)}
                              className="w-full bg-(--background) border border-(--border) rounded-xl p-3 text-xs focus:border-blue-500/50 outline-none resize-none text-(--foreground)"
                              placeholder="Highlight discount thresholds, BOGO terms, shipping rules..."
                            />
                          </div>

                          <button
                            onClick={saveStrategyNotes}
                            className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold uppercase text-[9px] tracking-wider hover:scale-102 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 size={12} />
                            <span>Save Strategic Framework</span>
                          </button>
                        </div>
                      </GlassCard>

                    </div>

                  </div>

                </motion.div>
              )}

              {/* 3. SIDE-BY-SIDE COMPARE TAB */}
              {activeTab === "compare" && activeCampaign && (
                <motion.div
                  key="compare"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-(--card) border border-(--border) p-4 md:p-5 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-md min-w-0 overflow-hidden">
                    <div className="min-w-0">
                      <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Compare Live Versions</span>
                      <h2 className="text-base font-black text-(--foreground) mt-0.5 break-words">A/B Message Matrix Panel</h2>
                    </div>
                    
                    {/* Exporter button */}
                    <button
                      onClick={triggerPrintLayout}
                      className="px-4 py-2.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shrink-0"
                    >
                      <Printer size={12} />
                      <span>Print Comparison</span>
                    </button>
                  </div>

                  {/* Side by side columns layout */}
                  <div className="w-full overflow-x-auto pb-4 no-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start min-w-[300px] md:min-w-[800px] lg:min-w-0">
                      {activeCampaign.variants?.map((v, idx) => (
                        <div 
                          key={v.id} 
                          className={`bg-(--card) border rounded-3xl p-4 md:p-5 shadow-md transition-all flex flex-col justify-between gap-5 relative overflow-hidden min-w-0 ${
                            v.isWinner 
                              ? "border-yellow-500/60 bg-gradient-to-b from-yellow-500/5 to-transparent" 
                              : "border-(--border) hover:border-blue-500/25"
                          }`}
                        >
                          {/* Winner overlay crown */}
                          {v.isWinner && (
                            <div className="absolute top-4 right-4 bg-yellow-500 text-black px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 animate-pulse shadow-md">
                              <Crown size={10} className="fill-black" />
                              <span>Winner Copy</span>
                            </div>
                          )}

                          <div className="space-y-4">
                            {/* Title Label */}
                            <div className="border-b border-(--border) pb-2.5">
                              <span className="font-mono text-[10px] text-muted-foreground uppercase block font-extrabold">Variant Configuration {idx+1}</span>
                              <h3 className="text-sm font-black text-(--foreground) mt-0.5 break-words pr-16">{v.name}</h3>
                            </div>

                            {/* Metric values list */}
                            <div className="p-3 bg-(--background) rounded-2xl border border-(--border) space-y-1.5 text-[11px]">
                              <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground block mb-1">Simulated Performance Stats</span>
                              <div className="flex justify-between items-center gap-2 min-w-0">
                                <span className="text-muted-foreground font-medium">Click Through Rate (CTR):</span>
                                <span className="font-extrabold text-blue-500 shrink-0">{v.metrics?.ctr ? `${v.metrics.ctr}%` : "No Traffic"}</span>
                              </div>
                              <div className="flex justify-between items-center gap-2 min-w-0">
                                <span className="text-muted-foreground font-medium">Conversion Lift:</span>
                                <span className="font-extrabold text-emerald-500 shrink-0">{v.metrics?.conversion ? `${v.metrics.conversion}%` : "No Conversion"}</span>
                              </div>
                              <div className="flex justify-between items-center gap-2 min-w-0">
                                <span className="text-muted-foreground font-medium">Cost Per Conversion:</span>
                                <span className="font-extrabold text-slate-800 dark:text-slate-200 shrink-0">{v.metrics?.cost ? `$${v.metrics.cost}` : "No Cost"}</span>
                              </div>
                            </div>

                            {/* Copy Texts comparison */}
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <span className="text-[8px] uppercase tracking-widest font-black text-muted-foreground">Headline Hook</span>
                                <p className="p-3 rounded-2xl bg-(--background) border border-(--border)/60 text-xs font-black text-(--foreground) leading-snug break-words">
                                  {v.headline}
                                </p>
                                <span className="text-[8px] text-muted-foreground font-mono block text-right">{v.headline.length} chars</span>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[8px] uppercase tracking-widest font-black text-muted-foreground">Primary Copy Block</span>
                                <p className="p-3.5 rounded-2xl bg-(--background) border border-(--border)/60 text-xs text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                                  {v.description}
                                </p>
                                <span className="text-[8px] text-muted-foreground font-mono block text-right">{v.description.length} chars</span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                                <div className="p-2 rounded-xl bg-(--background) border border-(--border)/50 min-w-0">
                                  <span className="text-muted-foreground text-[8px] uppercase font-bold block">Tone</span>
                                  <span className="font-extrabold text-(--foreground) block mt-0.5 break-words">{v.tone}</span>
                                </div>
                                <div className="p-2 rounded-xl bg-(--background) border border-(--border)/50 min-w-0">
                                  <span className="text-muted-foreground text-[8px] uppercase font-bold block">CTA Action</span>
                                  <span className="font-extrabold text-(--foreground) block mt-0.5 break-words">{v.cta}</span>
                                </div>
                              </div>

                              <div className="p-2 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[10px]">
                                <span className="text-muted-foreground text-[8px] uppercase font-bold block">Value Hook</span>
                                <span className="font-black text-blue-500 block mt-0.5 break-words">{v.offer || "No Promo Configured"}</span>
                              </div>
                            </div>

                          </div>

                          {/* Winner action button */}
                          <div className="border-t border-(--border) pt-3">
                            <button
                              onClick={() => handleSetWinner(v.id)}
                              className={`w-full py-2 rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-1.5 border ${
                                v.isWinner
                                  ? "bg-yellow-500 text-black border-yellow-500"
                                  : "bg-(--background) border-(--border) text-muted-foreground hover:text-(--foreground)"
                              }`}
                            >
                              <Trophy size={11} />
                              <span>{v.isWinner ? "Unmark Winner" : "Select Winner Copy"}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* 4. CAMPAIGN TIMELINE PLANNER TAB */}
              {activeTab === "timeline" && activeCampaign && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-(--card) border border-(--border) p-5 rounded-3xl shadow-md">
                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Active Schedule Roadmap</span>
                    <h2 className="text-base font-black text-(--foreground) mt-0.5">Campaign Testing Sequence</h2>
                  </div>

                  {/* Visual Gantt Phase Timeline */}
                  <GlassCard title="Testing Milestones & Progress" icon={Clock}>
                    <div className="space-y-6">
                      
                      <div className="flex flex-col md:flex-row justify-between text-xs text-muted-foreground border-b pb-4 gap-3">
                        <div>
                          <span className="font-semibold block mb-0.5">Testing Start Date:</span>
                          <span className="font-mono text-(--foreground) font-bold">{activeCampaign.startDate}</span>
                        </div>
                        <div>
                          <span className="font-semibold block mb-0.5">Estimated Complete:</span>
                          <span className="font-mono text-(--foreground) font-bold">{activeCampaign.endDate}</span>
                        </div>
                        <div>
                          <span className="font-semibold block mb-0.5">Sequence Status:</span>
                          <span className="text-blue-500 font-extrabold uppercase bg-blue-500/5 px-2.5 py-1 rounded border border-blue-500/20">{activeCampaign.status}</span>
                        </div>
                      </div>

                      {/* Interactive visual roadmap phases */}
                      <div className="space-y-4">
                        {[
                          { stage: "idea", label: "Phase 1: Idea Brainstorming", desc: "Define campaign goal benchmarks and structure audience messaging angles." },
                          { stage: "draft", label: "Phase 2: Copywriting Drafts", desc: "Write Variant A and Variant B with specific value offer attachments." },
                          { stage: "ready", label: "Phase 3: QA Review Checkpoints", desc: "Validate platform character counts and check tone parameters." },
                          { stage: "testing", label: "Phase 4: Active Split Testing", desc: "Publish copy variations to ad networks to monitor live CTR weights." },
                          { stage: "completed", label: "Phase 5: Campaign Launch Winner", desc: "Select winner copy based on conversion lift and execute full budget." }
                        ].map((phase, idx) => {
                          // Simple logic to color roadmap phases based on status
                          const currentStageIdx = STATUS_STAGES.findIndex(s => s.id === activeCampaign.status);
                          const phaseStageIdx = STATUS_STAGES.findIndex(s => s.id === phase.stage);
                          const isFinished = phaseStageIdx < currentStageIdx || activeCampaign.status === "completed";
                          const isCurrent = activeCampaign.status === phase.stage;

                          return (
                            <div key={idx} className="flex gap-4 items-start relative">
                              {/* Left line decorator */}
                              <div className="flex flex-col items-center shrink-0 mt-1">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${
                                  isFinished 
                                    ? "bg-emerald-500 border-emerald-500 text-white" 
                                    : isCurrent
                                      ? "bg-blue-600 border-blue-600 text-white animate-pulse"
                                      : "bg-(--card) border-(--border) text-muted-foreground"
                                }`}>
                                  {isFinished ? "✓" : idx + 1}
                                </div>
                                {idx < 4 && <div className={`w-[2px] h-12 mt-1.5 ${isFinished ? 'bg-emerald-500' : 'bg-(--border)'}`} />}
                              </div>
                              <div className="space-y-1 pt-0.5">
                                <h4 className={`text-xs font-extrabold ${isCurrent ? 'text-blue-500' : 'text-(--foreground)'}`}>
                                  {phase.label}
                                </h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">{phase.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </GlassCard>

                  {/* Notes Strategy observation block */}
                  <GlassCard title="Campaign Observations Log" icon={MessageSquare}>
                    <div className="space-y-3">
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Document testing insights, audience feedback, and conversion highlights:
                      </p>
                      <textarea
                        rows={4}
                        value={stratObs}
                        onChange={(e) => {
                          setStratObs(e.target.value);
                          // Auto sync back to memory
                          setCampaigns(prev => prev.map(c => {
                            if (c.id === selectedCampaignId) {
                              return { ...c, observations: e.target.value };
                            }
                            return c;
                          }));
                        }}
                        className="w-full bg-(--background) border border-(--border) rounded-2xl p-4 text-xs focus:border-blue-500/50 outline-none resize-none leading-relaxed text-(--foreground)"
                        placeholder="Log active results observations here..."
                      />
                    </div>
                  </GlassCard>

                </motion.div>
              )}

              {/* 5. EXPORT / SHARE BACKUPS TAB */}
              {activeTab === "export" && (
                <motion.div
                  key="export"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-(--card) border border-(--border) p-5 rounded-3xl shadow-md">
                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Share & Export Manager</span>
                    <h2 className="text-base font-black text-(--foreground) mt-0.5">Planner Data Backups</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* JSON Import backup card */}
                    <GlassCard title="Import Planner Backup File" icon={Upload}>
                      <div className="space-y-4">
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Paste your downloaded <code>.json</code> backup code block below to load old campaigns:
                        </p>
                        <textarea
                          rows={6}
                          value={importJson}
                          onChange={(e) => setImportJson(e.target.value)}
                          placeholder='Paste JSON code block here: e.g. [{"name": "Summer Campaign", ...}]'
                          className="w-full bg-(--background) border border-(--border) rounded-2xl p-3 text-xs outline-none focus:border-blue-500/50 font-mono resize-none"
                        />
                        <button
                          onClick={handleImportBackup}
                          className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle size={12} />
                          <span>Validate & Import Planner</span>
                        </button>
                        {importStatus && (
                          <div className={`p-2.5 rounded-xl text-[10px] text-center border font-bold ${
                            importStatus === "success" 
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }`}>
                            {importStatus === "success" ? "Backup restored successfully!" : `Error: ${importStatus}`}
                          </div>
                        )}
                      </div>
                    </GlassCard>

                    {/* Print Preview Layout Card */}
                    <GlassCard title="Generate Print Report" icon={Printer}>
                      <div className="space-y-4">
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Renders a clean, structured print document optimized for physical files or team PDF sharing:
                        </p>
                        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-2 text-[11px] leading-relaxed">
                          <p><strong>Print Setup Highlights:</strong></p>
                          <p>• Clean side-by-side variant columns layout</p>
                          <p>• Strategy guidelines notes details included</p>
                          <p>• Visual checklist status tags rendered</p>
                        </div>
                        <button
                          onClick={triggerPrintLayout}
                          className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10"
                        >
                          <Printer size={13} />
                          <span>Generate PDF / Print Preview</span>
                        </button>
                      </div>
                    </GlassCard>

                  </div>

                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </div>

      </div>

      {/* --- ADD / EDIT CAMPAIGN MODAL DIALOG --- */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-(--card) border border-(--border) rounded-3xl w-full max-w-lg overflow-visible shadow-2xl relative"
          >
            <div className="flex justify-between items-center p-5 border-b border-(--border)">
              <h3 className="text-sm font-black uppercase tracking-wider text-(--foreground) flex items-center gap-2">
                <Sliders size={16} className="text-blue-500" />
                <span>{isEditingCampaign ? "Modify Campaign Settings" : "Configure New Campaign"}</span>
              </h3>
              <button 
                onClick={() => setShowCampaignModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-muted-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Campaign Name</label>
                <input
                  type="text"
                  value={formCampName}
                  onChange={(e) => setFormCampName(e.target.value)}
                  placeholder="e.g. Winter Sale Promo, Lead Funnel Split"
                  className="w-full bg-(--background) border border-(--border) rounded-2xl px-4 py-3 text-xs outline-none focus:border-blue-500/50 text-(--foreground)"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 overflow-visible">
                <CustomSelect
                  label="Platform"
                  value={formCampPlatform}
                  onChange={setFormCampPlatform}
                  options={PLATFORMS.map(p => ({ id: p.id, label: `${getPlatformEmoji(p.id)} ${p.label}` }))}
                />

                <CustomSelect
                  label="Campaign Type"
                  value={formCampType}
                  onChange={setFormCampType}
                  options={CAMPAIGN_TYPES}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end overflow-visible">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Goal Objective</label>
                  <input
                    type="text"
                    value={formCampGoal}
                    onChange={(e) => setFormCampGoal(e.target.value)}
                    placeholder="e.g. Lead Sign-ups"
                    className="w-full bg-(--background) border border-(--border) rounded-2xl px-4 py-3 text-xs outline-none focus:border-blue-500/50 text-(--foreground) font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Priority</label>
                  <div className="grid grid-cols-3 gap-1 bg-(--background) p-1 rounded-2xl border border-(--border)">
                    {["low", "medium", "high"].map((pr) => (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => setFormCampPriority(pr)}
                        className={`py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                          formCampPriority === pr
                            ? pr === "high"
                              ? "bg-red-500 text-white shadow-sm font-bold"
                              : pr === "medium"
                              ? "bg-blue-600 text-white shadow-sm font-bold"
                              : "bg-gray-600 text-white shadow-sm font-bold"
                            : "text-muted-foreground hover:text-(--foreground)"
                        }`}
                      >
                        {pr}
                      </button>
                    ))}
                  </div>
                </div>

                <CustomSelect
                  label="Status Phase"
                  value={formCampStatus}
                  onChange={setFormCampStatus}
                  options={STATUS_STAGES}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Start Date</label>
                  <input
                    type="date"
                    value={formCampStart}
                    onChange={(e) => setFormCampStart(e.target.value)}
                    className="w-full bg-(--background) border border-(--border) rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-500/50 text-(--foreground)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">End Date</label>
                  <input
                    type="date"
                    value={formCampEnd}
                    onChange={(e) => setFormCampEnd(e.target.value)}
                    className="w-full bg-(--background) border border-(--border) rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-500/50 text-(--foreground)"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">Campaign Description</label>
                <textarea
                  rows={3}
                  value={formCampDesc}
                  onChange={(e) => setFormCampDesc(e.target.value)}
                  placeholder="Outline description parameters..."
                  className="w-full bg-(--background) border border-(--border) rounded-2xl p-3 text-xs outline-none focus:border-blue-500/50 resize-none text-(--foreground)"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 rounded-2xl font-bold uppercase text-[9px] tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold uppercase text-[9px] tracking-wider"
                >
                  Save Workspace
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* --- PRINT ONLY LAYOUT: Hidden on screen via CSS print queries --- */}
      <div className="hidden print:block bg-white text-black p-8 font-sans space-y-8 min-h-screen">
        <div className="border-b-2 pb-4">
          <h1 className="text-2xl font-black uppercase tracking-tight">Ad Copy A/B Planner Report</h1>
          <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
        </div>

        {activeCampaign ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-xs border-b pb-4">
              <div>
                <p><strong>Campaign Name:</strong> {activeCampaign.name}</p>
                <p><strong>Platform Setup:</strong> {activePlatformLabelShort(activeCampaign.platform)}</p>
                <p><strong>Priority Status:</strong> {activeCampaign.priority.toUpperCase()} | {activeCampaign.status.toUpperCase()}</p>
              </div>
              <div>
                <p><strong>Conversion Goal:</strong> {activeCampaign.goal || "Generic Objective"}</p>
                <p><strong>Campaign Type:</strong> {activeCampaign.type}</p>
                <p><strong>Timeline Schedule:</strong> {activeCampaign.startDate} to {activeCampaign.endDate}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1">Strategic Framework Notes</h3>
              <p className="text-xs text-gray-700"><strong>Target Audience:</strong> {activeCampaign.audienceNotes || "No audience description logged."}</p>
              <p className="text-xs text-gray-700"><strong>Funnel Strategy:</strong> {activeCampaign.funnelNotes || "No funnel positioning details logged."}</p>
              <p className="text-xs text-gray-700"><strong>Offer Positioning:</strong> {activeCampaign.offerStrategy || "No promo offers details logged."}</p>
              <p className="text-xs text-gray-700"><strong>Campaign Observations:</strong> {activeCampaign.observations || "No timeline observations logged."}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1">A/B testing Copies Comparison</h3>
              <div className="grid grid-cols-2 gap-6">
                {activeCampaign.variants?.map((v, idx) => (
                  <div key={v.id} className="border p-4 rounded-xl space-y-3">
                    <h4 className="font-bold border-b pb-1.5">Variant {idx+1}: {v.name} {v.isWinner ? "🏆 (Winner Copy)" : ""}</h4>
                    <p className="text-xs"><strong>Tone Label:</strong> {v.tone} | <strong>Messaging Hook:</strong> {v.angle}</p>
                    <p className="text-xs"><strong>Value Hook:</strong> {v.offer || "None Added"}</p>
                    <div className="p-2.5 bg-gray-100 rounded border">
                      <p className="font-extrabold text-[13px] text-gray-800 leading-snug">"{v.headline}"</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded border">
                      <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">"{v.description}"</p>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono text-right">Headline: {v.headline.length} chars | Description: {v.description.length} chars</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs italic">No campaign configurations selected for report generation.</p>
        )}
      </div>

    </div>
  );
}
