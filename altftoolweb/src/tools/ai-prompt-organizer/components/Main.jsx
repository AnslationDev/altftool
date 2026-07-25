"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Plus,
  Copy,
  Check,
  Star,
  Sparkles,
  Wand2,
  Pencil,
  CopyPlus,
  Share2,
  Trash2,
  MoreHorizontal,
  X,
  Send,
  Bot,
  User,
  Users,
  Eye,
  RotateCcw,
  Link2,
  Mail,
  Twitter,
  Tag,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  LibraryBig,
  PenTool,
  Code,
  Megaphone,
  Palette,
  Briefcase,
  Globe,
  Hash,
  Zap,
  Command,
  Download,
  FileText,
  FileDown,
  Table,
  Lightbulb,
} from "lucide-react";

/* ---------------------------------------------------------------------------
   Seed data
--------------------------------------------------------------------------- */

const INITIAL_PROMPTS = [
  {
    id: "1",
    title: "Write a Product Launch Email",
    category: "Marketing",
    description: "Create a high-converting product launch email that builds excitement and drives sales.",
    content:
      "Write a high-converting product launch email for [PRODUCT_NAME]. Highlight the core benefit [BENEFIT], address the primary pain point [PAIN_POINT], and include a strong, single call to action [CTA]. Keep the tone exciting yet professional.",
    tags: ["Marketing", "Email", "Launch"],
    model: "GPT-5",
    lastEdited: "Edited 2h ago",
    usageCount: "2.4K",
    isFavorite: false,
    author: "You",
    type: "Personal",
  },
  {
    id: "2",
    title: "Explain Quantum Computing",
    category: "Writing",
    description: "Explain quantum computing in simple, intuitive terms with a concrete analogy.",
    content:
      "Explain quantum computing in simple terms to a [TARGET_AUDIENCE]. Use a concrete analogy (like a coin spinning or a maze helper) to describe superposition and entanglement without using complex linear algebra terms.",
    tags: ["Education", "Science", "Explainer"],
    model: "Claude 3.5",
    lastEdited: "Edited 1d ago",
    usageCount: "1.8K",
    isFavorite: true,
    author: "You",
    type: "Team",
  },
  {
    id: "3",
    title: "React Performance Tuner",
    category: "Coding",
    description: "Analyze and optimize React render cycles and hook dependencies.",
    content:
      "Analyze the following React component for unnecessary re-renders. Check the dependencies of useEffect, useMemo, and useCallback. Refactor the code to extract expensive logic or isolate state updates:\n\n[PASTE_COMPONENT]",
    tags: ["React", "Performance", "Clean Code"],
    model: "Claude 3.5",
    lastEdited: "Edited 3h ago",
    usageCount: "940",
    isFavorite: false,
    author: "You",
    type: "Personal",
  },
  {
    id: "4",
    title: "Midjourney Cinematic Director",
    category: "Design",
    description: "Generates ultra-realistic photographic scene descriptions for Midjourney v6.",
    content:
      "A professional cinematic wide-angle shot of [SCENE], shot on 35mm anamorphic lens, realistic lighting, detailed skin textures, natural volumetric dust particles, shot on RED camera --ar 16:9 --style raw",
    tags: ["Midjourney", "Art Direction", "Lighting"],
    model: "Gemini",
    lastEdited: "Edited 5d ago",
    usageCount: "3.2K",
    isFavorite: true,
    author: "You",
    type: "Personal",
  },
  {
    id: "5",
    title: "SEO Blog Outline Builder",
    category: "SEO",
    description: "Build a search-optimized blog outline mapped to user intent and keyword clusters.",
    content:
      "Act as an SEO content strategist. For the target keyword [KEYWORD], create a full blog outline: map the search intent, propose an H1 and H2/H3 structure, list secondary keywords to include, and suggest a meta title and description under 155 characters.",
    tags: ["SEO", "Blog", "Keywords"],
    model: "GPT-5",
    lastEdited: "Edited 6h ago",
    usageCount: "1.2K",
    isFavorite: true,
    author: "You",
    type: "Team",
  },
  {
    id: "6",
    title: "Meeting Notes Summarizer",
    category: "Productivity",
    description: "Turn a raw meeting transcript into concise notes with action items and owners.",
    content:
      "Summarize the following meeting transcript into: (1) a 3-line summary, (2) key decisions, and (3) action items formatted as a table with Owner and Due date columns.\n\n[PASTE_TRANSCRIPT]",
    tags: ["Productivity", "Meetings", "Summary"],
    model: "Claude 3.5",
    lastEdited: "Edited 2d ago",
    usageCount: "760",
    isFavorite: false,
    author: "You",
    type: "Personal",
  },
];

const CATEGORY_META = [
  { name: "Writing", icon: PenTool, accent: "text-blue-500 bg-blue-500/10" },
  { name: "Coding", icon: Code, accent: "text-violet-500 bg-violet-500/10" },
  { name: "Marketing", icon: Megaphone, accent: "text-indigo-500 bg-indigo-500/10" },
  { name: "Design", icon: Palette, accent: "text-pink-500 bg-pink-500/10" },
  { name: "Business", icon: Briefcase, accent: "text-orange-500 bg-orange-500/10" },
  { name: "SEO", icon: Globe, accent: "text-emerald-500 bg-emerald-500/10" },
  { name: "Social Media", icon: Hash, accent: "text-rose-500 bg-rose-500/10" },
  { name: "Productivity", icon: Zap, accent: "text-amber-500 bg-amber-500/10" },
];

const COLLECTIONS = [
  { title: "Content Creation", category: "Writing", description: "Blog posts, explainers, and reusable content templates.", icon: PenTool, accent: "text-info bg-info/10" },
  { title: "Developer Toolkit", category: "Coding", description: "Code reviews, debugging, and documentation prompts.", icon: Code, accent: "text-success bg-success/10" },
  { title: "Marketing Playbook", category: "Marketing", description: "Campaign, copywriting, and product launch prompts.", icon: Megaphone, accent: "text-warning bg-warning/10" },
];

const MODELS = ["GPT-5", "Claude 3.5", "Gemini", "Llama 3"];
const FORM_CATEGORIES = CATEGORY_META.map((c) => c.name);
const FILTER_CHIPS = ["All", "Recent", "Favorites", "Personal", "Team"];

const MODEL_STYLES = {
  "GPT-5": "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  "Claude 3.5": "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  Claude: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  Gemini: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
  "Llama 3": "text-sky-600 dark:text-sky-400 bg-sky-500/10",
};
const modelStyle = (m) => MODEL_STYLES[m] || "text-sky-600 dark:text-sky-400 bg-sky-500/10";
const catIcon = (name) => (CATEGORY_META.find((c) => c.name === name) || {}).icon || Tag;
const catAccent = (name) => (CATEGORY_META.find((c) => c.name === name) || {}).accent || "text-slate-500 bg-slate-500/10";

// Prompt-writing helper building blocks
const BUILDING_BLOCKS = [
  { label: "Role", snippet: "You are a [ROLE] with deep expertise in [DOMAIN]." },
  { label: "Context", snippet: "Context: [BACKGROUND_INFORMATION]." },
  { label: "Task", snippet: "Your task: [WHAT_YOU_WANT_DONE]." },
  { label: "Steps", snippet: "Steps:\n1. [STEP_ONE]\n2. [STEP_TWO]\n3. [STEP_THREE]" },
  { label: "Output format", snippet: "Output format: [e.g. clean Markdown with headers / JSON / bullet list]." },
  { label: "Constraints", snippet: "Constraints: [tone, length, what to avoid]." },
];

const runChecks = (text) => {
  const t = (text || "").toLowerCase();
  return [
    { label: "Assigns a role", ok: /you are|act as|adopt the|as an? expert/.test(t) },
    { label: "Provides context", ok: /context|background|given that/.test(t) },
    { label: "States the task clearly", ok: /task|generate|write|create|analyze|refactor|explain|summarize|design/.test(t) },
    { label: "Uses a [VARIABLE]", ok: /\[[A-Z0-9_ ]+\]/.test(text || "") },
    { label: "Defines an output format", ok: /format|markdown|json|bullet|table|list|headers?/.test(t) },
  ];
};

/* ---------------------------------------------------------------------------
   Component
--------------------------------------------------------------------------- */

export default function MainComponent() {
  const [prompts, setPrompts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterChip, setFilterChip] = useState("All");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);

  const [isNewSheetOpen, setIsNewSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [aiImprovingId, setAiImprovingId] = useState(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("Writing");
  const [formModel, setFormModel] = useState("GPT-5");
  const [formTags, setFormTags] = useState("");
  const [formType, setFormType] = useState("Personal");

  const [assistantMessages, setAssistantMessages] = useState([
    {
      sender: "assistant",
      text: "Hi! I'm your AI Prompt Tuner. I can optimize your prompts, draft new instructions, or add dynamic variables. What are you building today?",
      timestamp: "9:41 AM",
    },
  ]);
  const [assistantInput, setAssistantInput] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const chatBottomRef = useRef(null);

  /* ---- persistence ---- */
  useEffect(() => {
    const stored = localStorage.getItem("premium_prompts_replica_v2");
    if (stored) {
      try {
        setPrompts(JSON.parse(stored));
      } catch (e) {
        setPrompts(INITIAL_PROMPTS);
      }
    } else {
      setPrompts(INITIAL_PROMPTS);
      localStorage.setItem("premium_prompts_replica_v2", JSON.stringify(INITIAL_PROMPTS));
    }
  }, []);

  const syncDB = (updatedList) => {
    setPrompts(updatedList);
    localStorage.setItem("premium_prompts_replica_v2", JSON.stringify(updatedList));
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (chatBottomRef.current) chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [assistantMessages, isAssistantTyping]);

  useEffect(() => {
    if (!menuOpenId) return;
    const close = () => setMenuOpenId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpenId]);

  /* ---- prompt actions ---- */
  const handleCopy = (item) => {
    navigator.clipboard?.writeText(item.content);
    setCopiedId(item.id);
    showToast("Prompt copied to clipboard!");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleToggleFavorite = (id, e) => {
    e?.stopPropagation();
    syncDB(prompts.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)));
  };

  const handleDuplicate = (item, e) => {
    e?.stopPropagation();
    setMenuOpenId(null);
    const dup = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      title: `${item.title} (Copy)`,
      lastEdited: "Edited just now",
      usageCount: "0",
    };
    syncDB([dup, ...prompts]);
    showToast("Prompt duplicated successfully!");
  };

  const handleShare = (item, e) => {
    e?.stopPropagation();
    setMenuOpenId(null);
    setSelectedPrompt(item);
    setIsShareSheetOpen(true);
  };

  const handleEmailShare = (item) => {
    const subject = encodeURIComponent(`AltFTool prompt: ${item.title}`);
    const body = encodeURIComponent(`${item.title}\n\n${item.content}\n\nShared from AltFTool`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsShareSheetOpen(false);
  };

  const handleSocialShare = (item) => {
    const text = encodeURIComponent(`Useful AI prompt: ${item.title}`);
    const url = encodeURIComponent(window.location.href);
    const popup = window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
    if (popup) popup.opener = null;
    setIsShareSheetOpen(false);
  };

  const handleOpenEdit = (item, e) => {
    e?.stopPropagation();
    setMenuOpenId(null);
    setSelectedPrompt(item);
    setFormTitle(item.title);
    setFormDescription(item.description || "");
    setFormContent(item.content);
    setFormCategory(item.category);
    setFormModel(item.model);
    setFormTags(item.tags.join(", "));
    setFormType(item.type || "Personal");
    setIsEditSheetOpen(true);
  };

  const handleDelete = (id, e) => {
    e?.stopPropagation();
    syncDB(prompts.filter((p) => p.id !== id));
    showToast("Prompt removed from vault");
    setIsEditSheetOpen(false);
    setMenuOpenId(null);
  };

  const handleAIImprove = (item, e) => {
    e?.stopPropagation();
    if (aiImprovingId) return;
    setMenuOpenId(null);
    setAiImprovingId(item.id);
    showToast("AI is optimizing your prompt structure...");
    setTimeout(() => {
      const improvedText = `You are an expert prompt engineer. Follow this systematic workflow:\n\n[CONTEXT]\n${
        item.description || item.title
      }\n\n[ROLE]\nAdopt the identity of a senior consultant with deep expertise in this domain.\n\n[INSTRUCTIONS]\n1. Refine formatting to utilize clean Markdown with bold parameters.\n2. Ensure instructions are step-by-step and isolate dynamic inputs like [INPUT_VARIABLE].\n3. ${
        item.content
      }\n\n[FORMAT]\nReturn output with descriptive H2 headers.`;
      syncDB(
        prompts.map((p) =>
          p.id === item.id
            ? {
                ...p,
                content: improvedText,
                title: p.title.includes("✨") ? p.title : `${p.title} ✨`,
                model: "GPT-5",
                lastEdited: "AI Optimized just now",
                tags: [...new Set([...p.tags, "AI Optimized"])],
              }
            : p,
        ),
      );
      setAiImprovingId(null);
      showToast("Prompt enhanced with professional constraints!");
    }, 1800);
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormContent("");
    setFormTags("");
    setFormCategory("Writing");
    setFormModel("GPT-5");
    setFormType("Personal");
  };

  const handleCreatePrompt = (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast("Please fill out title and content.");
      return;
    }
    const tagsArray = formTags.split(",").map((t) => t.trim()).filter(Boolean);
    const newPrompt = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      title: formTitle,
      category: formCategory,
      description: formDescription || "No description provided.",
      tags: tagsArray.length ? tagsArray : [formCategory],
      content: formContent,
      model: formModel,
      lastEdited: "Edited just now",
      usageCount: "0",
      isFavorite: false,
      author: "You",
      type: formType,
    };
    syncDB([newPrompt, ...prompts]);
    showToast("Saved into your prompt vault!");
    resetForm();
    setIsNewSheetOpen(false);
  };

  const handleUpdatePrompt = (e) => {
    e.preventDefault();
    if (!selectedPrompt) return;
    const tagsArray = formTags.split(",").map((t) => t.trim()).filter(Boolean);
    syncDB(
      prompts.map((p) =>
        p.id === selectedPrompt.id
          ? {
              ...p,
              title: formTitle,
              description: formDescription,
              content: formContent,
              category: formCategory,
              model: formModel,
              tags: tagsArray.length ? tagsArray : [formCategory],
              type: formType,
              lastEdited: "Edited just now",
            }
          : p,
      ),
    );
    showToast("Changes saved successfully!");
    setIsEditSheetOpen(false);
  };

  const handleReset = () => {
    syncDB(INITIAL_PROMPTS);
    setSelectedCategory(null);
    setFilterChip("All");
    setSearchQuery("");
    showToast("Prompt vault reset to default templates");
  };

  const handleSendAssistantMessage = () => {
    if (!assistantInput.trim()) return;
    const userMsg = {
      sender: "user",
      text: assistantInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setAssistantMessages((prev) => [...prev, userMsg]);
    const promptText = assistantInput;
    setAssistantInput("");
    setIsAssistantTyping(true);
    setTimeout(() => {
      let botResponse;
      if (promptText.toLowerCase().includes("seo")) {
        botResponse =
          "I've generated a high-fidelity SEO outline strategy prompt:\n\n'Adopt the persona of an SEO Auditor. Audit the page structure of [URL], comparing keyword maps against competitive rankings. Suggest title updates and schema tags.'";
      } else if (promptText.toLowerCase().includes("code") || promptText.toLowerCase().includes("react")) {
        botResponse =
          "Use this structured optimization instruction:\n\n'Refactor the following React module to decouple business logic from UI rendering. Map data flows clearly and use TypeScript generics where appropriate.'";
      } else {
        botResponse =
          "Here is a versatile AI prompt optimized for clarity:\n\n'Given the parameters [PARAMS], synthesize a structured breakdown of key takeaways. Output format: Clean Markdown tables.'";
      }
      setAssistantMessages((prev) => [
        ...prev,
        { sender: "assistant", text: botResponse, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
      setIsAssistantTyping(false);
    }, 1400);
  };

  /* ---- prompt helper (in form) ---- */
  const appendBlock = (snippet) =>
    setFormContent((c) => (c && c.trim() ? `${c.trimEnd()}\n\n${snippet}` : snippet));

  const improveDraft = () => {
    if (!formContent.trim()) {
      showToast("Write a rough draft first, then improve it.");
      return;
    }
    setFormContent(
      `You are an expert [ROLE] with deep experience in ${formCategory}.\n\n[CONTEXT]\n${
        formDescription || formTitle || "Describe the situation and goal."
      }\n\n[INSTRUCTIONS]\n${formContent}\n\n[OUTPUT FORMAT]\nRespond in clean Markdown with clear H2 headers and bullet points.`,
    );
    showToast("Draft restructured — fill in the [placeholders].");
  };

  /* ---- export / download ---- */
  const downloadBlob = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const slugify = (s) =>
    (s || "prompt").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "prompt";

  const promptToMarkdown = (p) =>
    `# ${p.title}\n\n> ${p.description || ""}\n\n- **Category:** ${p.category}\n- **Model:** ${p.model}\n- **Visibility:** ${p.type}\n- **Tags:** ${p.tags.join(", ")}\n\n## Prompt\n\n\`\`\`\n${p.content}\n\`\`\`\n`;

  const exportMarkdown = (list, single) => {
    const md = single
      ? promptToMarkdown(single)
      : `# AI Prompt Vault\n\n_${list.length} prompt(s) exported from AltFTool._\n\n${list.map(promptToMarkdown).join("\n---\n\n")}`;
    downloadBlob(md, single ? `${slugify(single.title)}.md` : "ai-prompts.md", "text/markdown;charset=utf-8");
    showToast("Markdown (.md) downloaded");
    setExportOpen(false);
  };

  const exportCSV = (list) => {
    const esc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const header = ["Title", "Description", "Category", "Model", "Visibility", "Tags", "Content", "Uses"];
    const rows = list.map((p) =>
      [p.title, p.description, p.category, p.model, p.type, p.tags.join("; "), p.content, p.usageCount].map(esc).join(","),
    );
    downloadBlob([header.map(esc).join(","), ...rows].join("\r\n"), "ai-prompts.csv", "text/csv;charset=utf-8");
    showToast("Spreadsheet (.csv) downloaded");
    setExportOpen(false);
  };

  const exportJSON = (list) => {
    downloadBlob(JSON.stringify(list, null, 2), "ai-prompts.json", "application/json");
    showToast("JSON backup downloaded");
    setExportOpen(false);
  };

  const exportPDF = (list) => {
    setExportOpen(false);
    const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const w = window.open("", "_blank");
    if (!w) {
      showToast("Allow pop-ups to export as PDF");
      return;
    }
    const body = list
      .map(
        (p) => `<section>
          <h2>${esc(p.title)}</h2>
          <p class="desc">${esc(p.description || "")}</p>
          <p class="meta">${esc(p.category)} &middot; ${esc(p.model)} &middot; ${esc(p.type)} &middot; ${esc(p.tags.join(", "))}</p>
          <pre>${esc(p.content)}</pre>
        </section>`,
      )
      .join("");
    w.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>AI Prompt Vault</title><style>
        *{box-sizing:border-box} body{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;max-width:760px;margin:40px auto;padding:0 28px;color:#0f172a;line-height:1.55}
        h1{font-size:24px;margin:0 0 4px} .sub{color:#64748b;margin:0 0 28px;font-size:13px}
        h2{font-size:16px;margin:26px 0 4px} .desc{color:#475569;margin:0 0 4px;font-size:13px}
        .meta{color:#94a3b8;font-size:11px;margin:0 0 8px}
        pre{white-space:pre-wrap;word-break:break-word;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;font-size:12px;font-family:ui-monospace,monospace}
        section{page-break-inside:avoid;border-bottom:1px solid #e2e8f0;padding-bottom:14px}
      </style></head><body>
      <h1>AI Prompt Vault</h1><p class="sub">${list.length} prompt(s) &middot; AltFTool</p>${body}
      <scr` + `ipt>window.onload=function(){setTimeout(function(){window.print()},250)}</scr` + `ipt>
      </body></html>`,
    );
    w.document.close();
    showToast("Opening print dialog — choose “Save as PDF”");
  };

  /* ---- derived ---- */
  const filteredPrompts = useMemo(
    () =>
      prompts.filter((p) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = !selectedCategory || p.category.toLowerCase() === selectedCategory.toLowerCase();
        let matchesChip = true;
        if (filterChip === "Favorites") matchesChip = p.isFavorite;
        else if (filterChip === "Team") matchesChip = p.type === "Team";
        else if (filterChip === "Personal") matchesChip = p.type === "Personal";
        else if (filterChip === "Recent") matchesChip = /h ago|now|1d/.test(p.lastEdited);
        return matchesSearch && matchesCategory && matchesChip;
      }),
    [prompts, searchQuery, selectedCategory, filterChip],
  );

  const favoritePromptsList = filteredPrompts.filter((p) => p.isFavorite);
  const libraryPromptsList = filteredPrompts.filter((p) => !p.isFavorite);

  const stats = useMemo(
    () => ({
      total: prompts.length,
      favorites: prompts.filter((p) => p.isFavorite).length,
      team: prompts.filter((p) => p.type === "Team").length,
      categories: new Set(prompts.map((p) => p.category)).size,
    }),
    [prompts],
  );

  const categoryCounts = useMemo(() => {
    const map = {};
    prompts.forEach((p) => (map[p.category] = (map[p.category] || 0) + 1));
    return map;
  }, [prompts]);

  const handleCollectionSelect = (collection) => {
    setSelectedCategory(collection.category);
    setFilterChip("All");
    setSearchQuery("");
    showToast(`Showing ${categoryCounts[collection.category] || 0} ${collection.category} prompts`);
    window.requestAnimationFrame(() => {
      document.getElementById("prompt-library")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  const assistantSuggestions = ["Improve my SEO prompt", "Refactor a React hook", "Add dynamic variables"];
  const inputCls =
    "w-full rounded-xl border border-(--border) bg-(--background) px-3.5 py-2.5 text-[14px] text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/30 transition";

  /* ---- render helpers (called as functions → no remount, focus stays) ---- */
  const typeBadge = (type) => (
    <span className="inline-flex items-center gap-1 rounded-md border border-(--border) bg-(--muted)/60 px-1.5 py-0.5 text-[11px] font-medium text-(--muted-foreground)">
      {type === "Team" ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
      {type}
    </span>
  );

  const promptCard = (item) => {
    const CatIcon = catIcon(item.category);
    const improving = aiImprovingId === item.id;
    return (
      <div
        key={item.id}
        className="group relative flex flex-col rounded-2xl border border-(--border) bg-(--card) p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 hover:border-(--primary)/40"
      >
        {improving && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-(--card)/80 backdrop-blur-sm">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-(--primary)">
              <Wand2 className="w-4 h-4 animate-pulse" /> Optimizing…
            </span>
          </div>
        )}

        <div className="flex items-start gap-3">
          <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${catAccent(item.category)}`}>
            <CatIcon className="w-4 h-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold text-(--foreground)">{item.title}</h3>
            <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-(--muted-foreground)">{item.description}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => handleToggleFavorite(item.id, e)}
              aria-label="Toggle favorite"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                item.isFavorite ? "text-amber-500" : "text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)/60"
              }`}
            >
              <Star className={`w-4 h-4 ${item.isFavorite ? "fill-current" : ""}`} />
            </button>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === item.id ? null : item.id);
                }}
                aria-label="More actions"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)/60 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {menuOpenId === item.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-(--border) bg-(--card) py-1 shadow-xl shadow-black/10"
                >
                  {[
                    { label: "Edit", icon: Pencil, fn: (e) => handleOpenEdit(item, e) },
                    { label: "Duplicate", icon: CopyPlus, fn: (e) => handleDuplicate(item, e) },
                    { label: "Download .md", icon: FileDown, fn: () => { exportMarkdown(null, item); setMenuOpenId(null); } },
                    { label: "Share", icon: Share2, fn: (e) => handleShare(item, e) },
                  ].map(({ label, icon: I, fn }) => (
                    <button key={label} onClick={fn} className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-(--foreground) hover:bg-(--muted)/60">
                      <I className="w-3.5 h-3.5 text-(--muted-foreground)" /> {label}
                    </button>
                  ))}
                  <button onClick={(e) => handleDelete(item.id, e)} className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-(--border) bg-(--muted)/40 p-3">
          <pre className="line-clamp-3 whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-(--muted-foreground)">{item.content}</pre>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {item.tags.slice(0, 3).map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-md bg-(--muted)/60 px-2 py-0.5 text-[11px] font-medium text-(--muted-foreground)">
              <Hash className="w-2.5 h-2.5" />
              {t}
            </span>
          ))}
          {item.tags.length > 3 && <span className="text-[11px] font-medium text-(--muted-foreground)">+{item.tags.length - 3}</span>}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-(--border) pt-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${modelStyle(item.model)}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {item.model}
            </span>
            {typeBadge(item.type)}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-(--muted-foreground)">
            <Eye className="w-3 h-3" /> {item.usageCount}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => handleCopy(item)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-(--border) px-3 py-2 text-[13px] font-medium text-(--foreground) hover:bg-(--muted)/60 transition-colors">
            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedId === item.id ? "Copied" : "Copy"}
          </button>
          <button onClick={(e) => handleAIImprove(item, e)} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-(--primary)/10 px-3 py-2 text-[13px] font-medium text-(--primary) hover:bg-(--primary)/15 transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> AI Improve
          </button>
        </div>
      </div>
    );
  };

  const renderSection = (Icon, title, count, cards) => (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-(--muted-foreground)" />
        <h2 className="text-sm font-semibold tracking-tight text-(--foreground)">{title}</h2>
        <span className="rounded-full bg-(--muted)/60 px-2 py-0.5 text-[11px] font-medium text-(--muted-foreground)">{count}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards}</div>
    </section>
  );

  const fieldLabel = (text) => <span className="mb-1.5 block text-[13px] font-medium text-(--foreground)">{text}</span>;

  const renderPromptForm = (onSubmit, submitLabel) => {
    const checks = runChecks(formContent);
    const score = checks.filter((c) => c.ok).length;
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          {fieldLabel("Title")}
          <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Write a Product Launch Email" className={inputCls} />
        </label>
        <label className="block">
          {fieldLabel("Description")}
          <input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="One-line summary of what this prompt does" className={inputCls} />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            {fieldLabel("Category")}
            <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className={inputCls}>
              {FORM_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            {fieldLabel("Model")}
            <select value={formModel} onChange={(e) => setFormModel(e.target.value)} className={inputCls}>
              {MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            {fieldLabel("Prompt content")}
            <button type="button" onClick={improveDraft} className="mb-1.5 inline-flex items-center gap-1 rounded-lg bg-(--primary)/10 px-2.5 py-1 text-[12px] font-medium text-(--primary) hover:bg-(--primary)/15 transition-colors">
              <Wand2 className="w-3 h-3" /> Improve draft
            </button>
          </div>
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            rows={5}
            placeholder="Write your prompt. Use [VARIABLES] for dynamic inputs."
            className={`${inputCls} resize-y font-mono text-[13px] leading-relaxed`}
          />

          {/* Prompt helper */}
          <div className="mt-2.5 rounded-xl border border-(--border) bg-(--muted)/40 p-3">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-(--foreground)">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Prompt helper
              <span className="ml-auto text-[11px] font-medium text-(--muted-foreground)">Quality {score}/5</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {BUILDING_BLOCKS.map((b) => (
                <button key={b.label} type="button" onClick={() => appendBlock(b.snippet)} className="inline-flex items-center gap-1 rounded-lg border border-(--border) bg-(--card) px-2.5 py-1 text-[12px] font-medium text-(--muted-foreground) hover:text-(--foreground) transition-colors">
                  <Plus className="w-3 h-3" /> {b.label}
                </button>
              ))}
            </div>
            <div className="mt-2.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {checks.map((c) => (
                <div key={c.label} className={`flex items-center gap-1.5 text-[12px] ${c.ok ? "text-(--foreground)" : "text-(--muted-foreground)"}`}>
                  <span className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full ${c.ok ? "bg-emerald-500 text-white" : "border border-(--border)"}`}>
                    {c.ok && <Check className="w-2.5 h-2.5" />}
                  </span>
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <label className="block">
          {fieldLabel("Tags")}
          <input value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="Comma separated, e.g. Email, Launch, Sales" className={inputCls} />
        </label>

        <div>
          {fieldLabel("Visibility")}
          <div className="inline-flex rounded-xl border border-(--border) bg-(--muted)/40 p-1">
            {["Personal", "Team"].map((t) => (
              <button key={t} type="button" onClick={() => setFormType(t)} className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[13px] font-medium transition-colors ${formType === t ? "bg-(--card) text-(--foreground) shadow-sm" : "text-(--muted-foreground)"}`}>
                {t === "Team" ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={() => { setIsNewSheetOpen(false); setIsEditSheetOpen(false); }} className="rounded-xl border border-(--border) px-4 py-2.5 text-[14px] font-medium text-(--foreground) hover:bg-(--muted)/60 transition-colors">
            Cancel
          </button>
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-xl bg-(--primary) px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-(--primary)/90 transition-colors">
            <Check className="w-4 h-4" /> {submitLabel}
          </button>
        </div>
      </form>
    );
  };

  const renderModal = (title, subtitle, onClose, children, wide) => (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[apoFade_.2s_ease-out]" onClick={onClose} />
      <div className={`relative z-10 w-full ${wide ? "sm:max-w-lg" : "sm:max-w-md"} max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-(--border) bg-(--card) p-6 shadow-2xl animate-[apoUp_.25s_cubic-bezier(0.16,1,0.3,1)]`}>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-(--foreground)">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-[13px] text-(--muted-foreground)">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--muted-foreground) hover:bg-(--muted)/60 hover:text-(--foreground)">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) antialiased">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes apoUp { from { transform: translateY(24px); opacity:.6 } to { transform: translateY(0); opacity:1 } }
        @keyframes apoFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes apoDrawer { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .apo-scroll::-webkit-scrollbar { height: 6px; width: 6px }
        .apo-scroll::-webkit-scrollbar-thumb { background: color-mix(in oklab, currentColor 18%, transparent); border-radius: 9999px }
      `,
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">AI Prompt Organizer</h1>
              <p className="text-[13px] text-(--muted-foreground)">Save, tag, and search your AI prompts — stored locally, always private.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Export */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setExportOpen((v) => !v); }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-3.5 py-2 text-[13px] font-medium text-(--foreground) hover:bg-(--muted)/60 transition-colors"
              >
                <Download className="w-4 h-4" /> Export
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exportOpen ? "rotate-180" : ""}`} />
              </button>
              {exportOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
                  <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-xl border border-(--border) bg-(--card) py-1 shadow-xl shadow-black/10">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-(--muted-foreground)">Export {filteredPrompts.length} prompt(s)</p>
                    {[
                      { label: "Markdown (.md)", icon: FileText, fn: () => exportMarkdown(filteredPrompts) },
                      { label: "Spreadsheet (.csv)", icon: Table, fn: () => exportCSV(filteredPrompts) },
                      { label: "PDF document", icon: FileDown, fn: () => exportPDF(filteredPrompts) },
                      { label: "JSON backup", icon: Download, fn: () => exportJSON(filteredPrompts) },
                    ].map(({ label, icon: I, fn }) => (
                      <button key={label} onClick={fn} className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-(--foreground) hover:bg-(--muted)/60">
                        <I className="w-3.5 h-3.5 text-(--muted-foreground)" /> {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button onClick={handleReset} className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-3.5 py-2 text-[13px] font-medium text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)/60 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={() => setIsAssistantOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-3.5 py-2 text-[13px] font-medium text-(--foreground) hover:bg-(--muted)/60 transition-colors">
              <Bot className="w-4 h-4" /> AI Assistant
            </button>
            <button onClick={() => { resetForm(); setIsNewSheetOpen(true); }} className="inline-flex items-center gap-1.5 rounded-xl bg-(--primary) px-4 py-2 text-[13px] font-semibold text-white hover:bg-(--primary)/90 transition-colors">
              <Plus className="w-4 h-4" /> New Prompt
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Prompts", value: stats.total, icon: LibraryBig, accent: "text-blue-500 bg-blue-500/10" },
            { label: "Favorites", value: stats.favorites, icon: Star, accent: "text-amber-500 bg-amber-500/10" },
            { label: "Team Shared", value: stats.team, icon: Users, accent: "text-violet-500 bg-violet-500/10" },
            { label: "Categories", value: stats.categories, icon: FolderOpen, accent: "text-emerald-500 bg-emerald-500/10" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--card) p-4">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.accent}`}>
                <s.icon className="w-5 h-5" />
              </span>
              <div>
                <p className="text-xl font-bold leading-none text-(--foreground)">{s.value}</p>
                <p className="mt-1 text-[12px] text-(--muted-foreground)">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-(--muted-foreground)" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts, tags, content…"
              className="w-full rounded-xl border border-(--border) bg-(--card) py-2.5 pl-10 pr-16 text-[14px] text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/30 transition"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-(--border) bg-(--muted)/50 px-1.5 py-0.5 text-[10px] font-medium text-(--muted-foreground) sm:inline-flex">
              <Command className="w-2.5 h-2.5" />K
            </span>
          </div>
          <div className="apo-scroll flex items-center gap-1.5 overflow-x-auto pb-1 lg:flex-wrap lg:justify-end lg:overflow-x-visible lg:pb-0">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => setFilterChip(chip)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  filterChip === chip ? "bg-(--primary) text-white" : "border border-(--border) bg-(--card) text-(--muted-foreground) hover:text-(--foreground)"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="apo-scroll mt-4 flex items-center gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-x-visible lg:pb-0">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 rounded-xl border px-3.5 py-2 text-[13px] font-medium transition-colors ${
              !selectedCategory ? "border-(--primary) bg-(--primary)/10 text-(--primary)" : "border-(--border) bg-(--card) text-(--muted-foreground) hover:text-(--foreground)"
            }`}
          >
            All Categories
          </button>
          {CATEGORY_META.map((c) => {
            const active = selectedCategory === c.name;
            return (
              <button
                key={c.name}
                onClick={() => setSelectedCategory(active ? null : c.name)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  active ? "border-(--primary) bg-(--primary)/10 text-(--primary)" : "border-(--border) bg-(--card) text-(--muted-foreground) hover:text-(--foreground)"
                }`}
              >
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md ${c.accent}`}>
                  <c.icon className="w-3 h-3" />
                </span>
                {c.name}
                <span className="text-(--muted-foreground)">{categoryCounts[c.name] || 0}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div id="prompt-library" className="mt-8 scroll-mt-24 space-y-10">
          {filteredPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-(--border) bg-(--card) py-20 text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-(--muted)/60 text-(--muted-foreground)">
                <Search className="w-6 h-6" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-(--foreground)">No prompts found</h3>
              <p className="mt-1 max-w-sm text-[13px] text-(--muted-foreground)">Try a different search or filter, or create a new prompt to get started.</p>
              <button onClick={() => { resetForm(); setIsNewSheetOpen(true); }} className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-(--primary) px-4 py-2 text-[13px] font-semibold text-white hover:bg-(--primary)/90">
                <Plus className="w-4 h-4" /> New Prompt
              </button>
            </div>
          ) : (
            <>
              {favoritePromptsList.length > 0 && renderSection(Star, "Favorites", favoritePromptsList.length, favoritePromptsList.map(promptCard))}
              {libraryPromptsList.length > 0 && renderSection(LibraryBig, "All Prompts", libraryPromptsList.length, libraryPromptsList.map(promptCard))}
            </>
          )}

          {/* Collections */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-(--muted-foreground)" />
              <h2 className="text-sm font-semibold tracking-tight text-(--foreground)">Collections</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {COLLECTIONS.map((col) => (
                <button
                  key={col.title}
                  type="button"
                  onClick={() => handleCollectionSelect(col)}
                  className="group flex flex-col rounded-2xl border border-(--border) bg-(--card) p-5 text-left transition-all hover:-translate-y-0.5 hover:border-(--primary)/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/40 motion-reduce:hover:translate-y-0"
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${col.accent}`}>
                      <col.icon className="w-5 h-5" />
                    </span>
                    <ChevronRight className="w-4 h-4 text-(--muted-foreground) transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-(--foreground)">{col.title}</h3>
                  <p className="mt-1 text-[13px] text-(--muted-foreground)">{col.description}</p>
                  <span className="mt-3 text-[12px] font-medium text-(--muted-foreground)">{categoryCounts[col.category] || 0} prompts</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Modals */}
      {isNewSheetOpen &&
        renderModal("New Prompt", "Add a reusable prompt to your vault", () => setIsNewSheetOpen(false), renderPromptForm(handleCreatePrompt, "Save Prompt"), true)}

      {isEditSheetOpen &&
        selectedPrompt &&
        renderModal(
          "Edit Prompt",
          selectedPrompt.title,
          () => setIsEditSheetOpen(false),
          <>
            {renderPromptForm(handleUpdatePrompt, "Save Changes")}
            <button onClick={(e) => handleDelete(selectedPrompt.id, e)} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-500/30 px-4 py-2.5 text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete prompt
            </button>
          </>,
          true,
        )}

      {isShareSheetOpen &&
        selectedPrompt &&
        renderModal(
          "Share Prompt",
          selectedPrompt.title,
          () => setIsShareSheetOpen(false),
          <div className="space-y-2">
            {[
              { label: "Copy prompt content", icon: Copy, fn: () => { handleCopy(selectedPrompt); setIsShareSheetOpen(false); } },
              { label: "Download as .md", icon: FileDown, fn: () => { exportMarkdown(null, selectedPrompt); setIsShareSheetOpen(false); } },
              { label: "Copy shareable link", icon: Link2, fn: () => { navigator.clipboard?.writeText(`${typeof window !== "undefined" ? window.location.href : ""}`); showToast("Link copied"); setIsShareSheetOpen(false); } },
              { label: "Share via email", icon: Mail, fn: () => handleEmailShare(selectedPrompt) },
              { label: "Share to X / Twitter", icon: Twitter, fn: () => handleSocialShare(selectedPrompt) },
            ].map(({ label, icon: I, fn }) => (
              <button key={label} onClick={fn} className="flex w-full items-center gap-3 rounded-xl border border-(--border) px-4 py-3 text-[14px] font-medium text-(--foreground) hover:bg-(--muted)/60 transition-colors">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--muted)/60 text-(--muted-foreground)">
                  <I className="w-4 h-4" />
                </span>
                {label}
              </button>
            ))}
          </div>,
        )}

      {/* AI Assistant drawer */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[apoFade_.2s_ease-out]" onClick={() => setIsAssistantOpen(false)} />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-(--border) bg-(--card) shadow-2xl animate-[apoDrawer_.28s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex items-center justify-between border-b border-(--border) px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white">
                  <Bot className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-(--foreground)">AI Prompt Tuner</p>
                  <p className="text-[12px] text-(--muted-foreground)">Optimize & draft prompts</p>
                </div>
              </div>
              <button onClick={() => setIsAssistantOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--muted-foreground) hover:bg-(--muted)/60 hover:text-(--foreground)">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {assistantMessages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${m.sender === "user" ? "bg-(--primary) text-white rounded-br-md" : "border border-(--border) bg-(--muted)/40 text-(--foreground) rounded-bl-md"}`}>
                    {m.text}
                    <div className={`mt-1 text-[10px] ${m.sender === "user" ? "text-white/70" : "text-(--muted-foreground)"}`}>{m.timestamp}</div>
                  </div>
                </div>
              ))}
              {isAssistantTyping && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md border border-(--border) bg-(--muted)/40 px-4 py-3">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-(--muted-foreground)" style={{ animationDelay: `${d * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <div className="border-t border-(--border) px-5 py-4">
              <div className="mb-3 flex flex-wrap gap-1.5">
                {assistantSuggestions.map((s) => (
                  <button key={s} onClick={() => setAssistantInput(s)} className="rounded-full border border-(--border) bg-(--muted)/40 px-3 py-1 text-[12px] text-(--muted-foreground) hover:text-(--foreground) transition-colors">
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendAssistantMessage()}
                  placeholder="Ask the AI to tune a prompt…"
                  className="flex-1 rounded-xl border border-(--border) bg-(--background) px-3.5 py-2.5 text-[14px] text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/30"
                />
                <button onClick={handleSendAssistantMessage} aria-label="Send" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary) text-white hover:bg-(--primary)/90 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-[apoUp_.25s_ease-out]">
          <div className="flex items-center gap-2 rounded-full border border-(--border) bg-(--card) px-4 py-2.5 text-[13px] font-medium text-(--foreground) shadow-xl shadow-black/10">
            <Check className="w-4 h-4 text-emerald-500" />
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
