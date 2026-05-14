"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCachedFirebaseRead } from "@/lib/firebaseCache";
import { normalizeExtension } from "@altftool/core/firebaseContent";
import { ALTFT_EXTENSIONS_COLLECTION_PATH } from "@altftool/core/firebasePaths";

import {
  ArrowLeft, Check, Camera, FileJson, Chrome, Star, Shield, Zap,
  Download, Globe, BookOpen, Calculator, Calendar, Thermometer,
  TrendingUp, DollarSign, Fuel, ArrowRightLeft, Droplets, PieChart,
  FileUp, RefreshCcw, FileSpreadsheet, FileImage, Eye, FileText, Code,
  Palette, Pipette, Hash, Layers, Type, Timer, Maximize, CheckSquare,
  Clock, Search, SpellCheck, Mic, Sparkles, Bookmark, FileCode,
  Briefcase, Smile, Key, Mail, ShieldCheck, Cpu, Accessibility,
  Minimize, Crop, Move, Video, PenTool, FastForward, UserPlus,
  MessageCircle, CreditCard, Box, MousePointer, Circle, Highlighter,
  CalendarDays, Code2, BarChart, ListChecks, HelpCircle, Recycle,
  History, Car, Volume2, Book, Lock, AtSign, FileSearch, Pen, Tag,
  Plane, Server, Link as LinkIcon, Link2, StickyNote, EyeOff,
  CalendarClock, Image, Cookie, ShoppingCart, Layout, Save, Puzzle,
  Gamepad2, QrCode, Keyboard, MessageSquare, ClipboardList, FileX,
  Settings2, KeyRound, ListTodo, Headphones, Library
} from "lucide-react";

/* ---------------- ICON MAP ---------------- */
const getIcon = (iconName) => {
  const icons = {
    Camera, FileJson, Calculator, Calendar, Thermometer, TrendingUp,
    DollarSign, Fuel, ArrowRightLeft, Droplets, PieChart, FileUp,
    RefreshCcw, FileSpreadsheet, BookOpen, FileImage, Eye, FileText,
    Code, Palette, Pipette, Hash, Layers, Type, Timer, Maximize,
    CheckSquare, Clock, Search, SpellCheck, Mic, Sparkles, Bookmark,
    FileCode, Briefcase, Smile, Key, Mail, Zap, ShieldCheck, Cpu,
    Accessibility, Minimize, Crop, Move, Video, PenTool, FastForward,
    UserPlus, MessageCircle, CreditCard, Box, MousePointer, Circle,
    Highlighter, CalendarDays, Code2, BarChart, ListChecks, HelpCircle,
    Shield, Recycle, History, Car, Volume2, Globe, Book, Lock, AtSign,
    FileSearch, Pen, Tag, Plane, Server, Link: LinkIcon, Link2,
    StickyNote, EyeOff, CalendarClock, Image, Cookie, ShoppingCart,
    Layout, Save, Puzzle, Gamepad2, QrCode, Keyboard, MessageSquare,
    ClipboardList, FileX, Settings2, KeyRound, ListTodo, Headphones,
    Library
  };
  return icons[iconName] || Camera;
};

export default function ExtensionDetailsPage({ params }) {
  const { slug } = use(params);

  const [extension, setExtension] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    async function fetchExtension() {
      try {
        const snap = await getCachedFirebaseRead(`extension:${slug}`, async () => {
          const ref = doc(db, ...ALTFT_EXTENSIONS_COLLECTION_PATH, slug);
          return getDoc(ref);
        }, 120000);

        if (!snap.exists()) {
          setNotFoundState(true);
          return;
        }

        setExtension(normalizeExtension(snap.data(), slug));
      } catch (err) {
        console.error(err);
        setNotFoundState(true);
      } finally {
        setLoading(false);
      }
    }

    fetchExtension();
  }, [slug]);

  /* ✅ handle states properly */
  if (loading) return null;

  if (notFoundState) {
    notFound();
  }

  if (!extension) return null;

  const Icon = getIcon(extension.icon);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-white">

      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[var(--primary)] opacity-[0.03] blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[var(--primary)] opacity-[0.03] blur-[120px]" />
      </div>

      {/* Navbar / Back Link */}
      <div className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center">
          <Link
            href="/extensions"
            className="group inline-flex items-center text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <div className="p-1.5 rounded-full group-hover:bg-[var(--muted)] transition-colors mr-2">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </div>
            Back to Extensions
          </Link>
        </div>
      </div>

      {/* ✅ rest of your UI EXACT SAME */}
      <main className="container mx-auto max-w-6xl px-4 py-12">

        <div className="flex flex-col lg:flex-row gap-12 items-center mb-20">

          <div className="relative group shrink-0">
            <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center rounded-[2rem] bg-gradient-to-br from-[var(--card)] to-[var(--muted)] border border-[var(--border)] shadow-2xl">
              <Icon strokeWidth={1.5} className="w-16 h-16 md:w-20 md:h-20 text-[var(--foreground)]" />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 text-xs font-bold tracking-wide uppercase rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                  {extension.category}
                </span>
                <div className="flex items-center gap-1 bg-[var(--muted)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    {extension.rating ?? "5.0"}
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[var(--foreground)] mb-6">
                {extension.name}
              </h1>

              <p className="text-xl md:text-2xl text-[var(--muted-foreground)] leading-relaxed max-w-3xl font-light">
                {extension.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {extension.chromeUrl && (
                <a
                  href={extension.chromeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-[var(--primary-foreground)] transition-all duration-300 bg-[var(--primary)] rounded-2xl hover:brightness-110 shadow-lg shadow-[var(--primary)]/20 hover:shadow-[var(--primary)]/40 hover:-translate-y-1"
                >
                  <Chrome className="w-5 h-5 mr-2.5" />
                  Add to Chrome
                </a>
              )}

              <button className="inline-flex items-center justify-center px-6 py-4 text-base font-semibold text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] rounded-2xl hover:bg-[var(--muted)]">
                <BookOpen className="w-5 h-5 mr-2.5 text-[var(--muted-foreground)]" />
                Documentation
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

                    {/* Left Column: Features */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Features Block */}
                        <section>
                            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                                    <Zap className="w-5 h-5 text-[var(--primary)]" />
                                </div>
                                What&apos;s Inside
                            </h2>

                            <div className="grid sm:grid-cols-2 gap-4">
                                {extension.features?.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="group flex flex-col p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]/30 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all duration-300"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] mb-3 group-hover:scale-110 transition-transform">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <span className="text-[var(--foreground)] font-medium leading-snug">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Description / Extra Content Placeholder */}
                        <section className="prose dark:prose-invert max-w-none">
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Why use {extension.name}?</h3>
                            <p className="text-[var(--muted-foreground)] leading-relaxed">
                                Experience a new level of productivity with {extension.name}. Designed with simplicity and power in mind, it seamlessly integrates into your workflow. Whether you are a developer, designer, or power user, this tool gives you the edge you need without the bloat.
                            </p>
                        </section>

                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Meta Card */}
                        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm sticky top-24">
                            <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-6">
                                Extension Information
                            </h3>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between py-2 border-b border-[var(--border)] border-dashed last:border-0 last:pb-0">
                                    <div className="flex items-center text-[var(--muted-foreground)]">
                                        <Globe className="w-4 h-4 mr-2" />
                                        <span>Version</span>
                                    </div>
                                    <span className="font-mono font-medium text-[var(--foreground)]">v1.2.0</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-[var(--border)] border-dashed last:border-0 last:pb-0">
                                    <div className="flex items-center text-[var(--muted-foreground)]">
                                        <Download className="w-4 h-4 mr-2" />
                                        <span>Downloads</span>
                                    </div>
                                    <span className="font-mono font-medium text-[var(--foreground)]">10k+</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-[var(--border)] border-dashed last:border-0 last:pb-0">
                                    <div className="flex items-center text-[var(--muted-foreground)]">
                                        <Shield className="w-4 h-4 mr-2" />
                                        <span>License</span>
                                    </div>
                                    <span className="font-medium text-[var(--foreground)]">MIT</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-[var(--border)]">
                                <div className="p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--foreground)]">Privacy First</p>
                                            <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                                No tracking, no ads. Your data stays on your device.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

      </main>
    </div>
  );
}
