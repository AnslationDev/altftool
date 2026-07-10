"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Pencil, ChevronDown, ChevronRight, Eye } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import EditAboutModal from "./components/EditAboutModal";
import ResetButton from "../../components/ResetButton";

const COLLECTION = "projects/marketys/about";
const DOC_ID = "config";

export default function MarketysAbout() {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const loadData = async () => {
    try {
      const snap = await getDoc(doc(db, COLLECTION, DOC_ID));
      if (snap.exists()) {
        const remote = snap.data();
        setData(deepMerge(INITIAL_DATA(), remote));
      } else {
        setData(INITIAL_DATA());
      }
    } catch {
      setData(INITIAL_DATA());
    }
    setLoaded(true);
  };

  if (!loaded) loadData();

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">About Page</h1>
            <p className="text-sm text-gray-500 mt-1">Manage hero, core values, and FAQs</p>
          </div>
          <button onClick={() => setEditing(false)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            Back to Preview
          </button>
        </div>
        <EditAboutModal existingData={data} onClose={() => setEditing(false)} onSaved={() => { loadData(); setEditing(false); }} inline />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">About Page</h1>
          <p className="text-sm text-gray-500 mt-1">Manage hero, core values, and FAQs</p>
        </div>
        <div className="flex items-center gap-2">
          <ResetButton onReset={async () => {
            try {
              await setDoc(doc(db, COLLECTION, DOC_ID), INITIAL_DATA());
              emitAlert({ type: "success", message: "About page reset to defaults" });
              loadData();
            } catch {
              emitAlert({ type: "error", message: "Reset failed" });
            }
          }} />
          <button onClick={() => loadData()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
            <Pencil className="h-4 w-4" /> Edit About Page
          </button>
        </div>
      </div>

      {!loaded ? (
        <div className="text-center py-12 text-sm text-gray-400">Loading...</div>
      ) : data ? (
        <div className="grid gap-6">

          {/* ── Hero Section Preview ── */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="relative h-48 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
              {data.hero.bgImage && (
                <img src={data.hero.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              )}
              <div className="relative z-10 text-center px-6">
                <h3 className="text-white font-bold text-lg mb-1">{data.hero.title}</h3>
                <p className="text-slate-300 text-xs max-w-xl mx-auto line-clamp-2">{data.hero.subtitle}</p>
              </div>
            </div>
            <div className="p-4 flex items-center gap-3 border-t border-gray-100">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-gray-500 font-medium">Hero Section — background image, title, subtitle</span>
            </div>
          </div>

          {/* ── Core Values Grid ── */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              Core Values
              <span className="text-xs font-normal text-gray-400">({data.values.length})</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.values.map((v, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex">
                  <div className="w-24 h-24 shrink-0 bg-gray-100">
                    {v.image ? (
                      <img src={v.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl font-bold">#{i + 1}</div>
                    )}
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{v.icon}</span>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${v.color ? v.color.split(" ")[0].replace("bg-", "bg-") : "bg-gray-300"}`} />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{v.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQs ── */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              FAQs
              <span className="text-xs font-normal text-gray-400">({data.faqs.length})</span>
            </h3>
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
              {data.faqs.map((faq, i) => (
                <div key={i}>
                  <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="flex w-full items-center justify-between p-4 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                    <span className="line-clamp-1">{faq.question}</span>
                    {expandedFaq === i ? <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />}
                  </button>
                  {expandedFaq === i && (
                    <div className="px-4 pb-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}

function INITIAL_DATA() {
  return JSON.parse(JSON.stringify(INITIAL_DATA_STATIC));
}

const INITIAL_DATA_STATIC = {
  hero: { bgImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80", title: "We Build The Engine For Your Scale", subtitle: "markety is a premium performance marketing agency." },
  values: [
    { icon: "Target", title: "Data-First Decisions", desc: "Every campaign, creative, and landing page is validated through data. No gut feelings, no guesses—only measurable outcomes.", color: "bg-blue-50 text-blue-600 border-blue-100", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80" },
    { icon: "Zap", title: "Speed of Execution", desc: "We launch campaigns within 48 hours. Our agile sprint model means your growth never waits for approvals or bureaucracy.", color: "bg-amber-50 text-amber-600 border-amber-100", image: "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=600&q=80" },
    { icon: "Shield", title: "Margin Protection", desc: "Profit comes first. We structure every campaign and partnership to protect your blended margins while scaling acquisition.", color: "bg-emerald-50 text-emerald-600 border-emerald-100", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80" },
    { icon: "Globe", title: "Global Scale Infrastructure", desc: "Our technology stack supports multi-currency, multi-language, and multi-region campaigns from a single unified dashboard.", color: "bg-indigo-50 text-indigo-600 border-indigo-100", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80" },
  ],
  faqs: [
    { question: "What makes markety different from traditional agencies?", answer: "Unlike traditional agencies that focus on vanity metrics like impressions or clicks, markety is entirely performance-driven." },
    { question: "How does the 48-hour campaign launch work?", answer: "Our agile sprint model is built for speed. Once onboarded, our team executes simultaneously." },
    { question: "What is your server-side tracking infrastructure?", answer: "We deploy custom GTM server-side containers and Conversions API integrations." },
    { question: "Do you require long-term contracts?", answer: "No, we roll rolling monthly partnerships." },
    { question: "How do we communicate with our dedicated team?", answer: "Every client gets a dedicated Slack channel and a weekly strategy review call." },
  ],
};

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}