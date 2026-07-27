"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCachedFirebaseRead } from "@/lib/firebaseCache";
import { normalizeExtension } from "@altftool/core/firebaseContent";
import { ALTFT_EXTENSIONS_COLLECTION_PATH } from "@altftool/core/firebasePaths";
import DataStateNotice from "@/components/ui/DataStateNotice";
import { ExtensionDetailSkeleton } from "@/components/ui/route-loading";
import { ArrowLeft } from "lucide-react";

import ExtensionHero from "./components/ExtensionHero";
import ExtensionSidebar from "./components/ExtensionSidebar";
import ExtensionFeatures from "./components/ExtensionFeatures";
import HowItWorksSection from "./components/HowItWorksSection";
import WhyChooseSection from "./components/WhyChooseSection";
import PrivacySecuritySection from "./components/PrivacySecuritySection";
import FinalCTASection from "./components/FinalCTASection";
import { extensionGallery } from "./extensionGallery";
import ExtensionGallery from "./components/ExtensionGallery";

export default function ExtensionDetailsPage({ params }) {
  const { slug } = use(params);

  const [extension, setExtension] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [error, setError] = useState(null);

  const fetchExtension = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFoundState(false);

    try {
      const snap = await getCachedFirebaseRead(`extension:${slug}`, async () => {
        const ref = doc(db, ...ALTFT_EXTENSIONS_COLLECTION_PATH, slug);
        return getDoc(ref);
      }, 120000);

      if (!snap.exists()) {
        setNotFoundState(true);
        setExtension(null);
        return;
      }

      setExtension(normalizeExtension(snap.data(), slug));
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchExtension();
  }, [fetchExtension]);

  if (loading) return <ExtensionDetailSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 max-w-6xl items-center px-4">
            <Link
              href="/extensions"
              className="group inline-flex min-h-11 items-center rounded-md text-sm font-medium text-[var(--muted-foreground)] transition-colors duration-150 hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transition-none"
            >
              <div className="mr-2 rounded-full p-1.5 transition-colors duration-150 group-hover:bg-[var(--muted)] motion-reduce:transition-none">
                <ArrowLeft className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
              </div>
              Back to Extensions
            </Link>
          </div>
        </div>
        <main className="container mx-auto max-w-6xl px-4 py-10">
          <DataStateNotice
            tone="danger"
            title="Extension details could not load"
            message="The live extension data request failed. Retry once the connection is stable."
            actionLabel="Retry"
            onAction={() => fetchExtension()}
          />
        </main>
      </div>
    );
  }

  if (notFoundState) {
    notFound();
  }

  if (!extension) return <ExtensionDetailSkeleton />;

  const screenshots = extension.screenshots?.length
    ? extension.screenshots
    : extensionGallery[extension.slug] || [];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-white">
      {/* Dynamic Header / Back Navigation */}
      <div className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-6xl items-center px-4">
          <Link
            href="/extensions"
            className="group inline-flex min-h-11 items-center rounded-md text-sm font-medium text-[var(--muted-foreground)] transition-colors duration-150 hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            <div className="mr-2 rounded-full p-1.5 transition-colors duration-150 group-hover:bg-[var(--muted)]">
              <ArrowLeft className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
            </div>
            Back to Extensions
          </Link>
        </div>
      </div>

      {/* Main SaaS Layout Container */}
      <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-16 md:space-y-20">
        {/* 1. SaaS Hero */}
        <ExtensionHero extension={extension} />

        {/* 2. Main 12-Column Grid (Content + Sticky Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Main Left Content Column */}
          <div className="lg:col-span-8 space-y-16 md:space-y-20">
            {/* Gallery Section */}
            <ExtensionGallery screenshots={screenshots} />

            {/* 3. Features Section */}
            <ExtensionFeatures features={extension.features} extensionName={extension.name} />

            {/* 4. How It Works Timeline */}
            <HowItWorksSection howItWorksData={extension.howItWorks} />

            {/* 5. Why Choose Section */}
            <WhyChooseSection benefitsData={extension.benefits || extension.whyChoose} />

            {/* 6. Privacy & Security Section */}
            <PrivacySecuritySection />
          </div>

          {/* Right Information Sidebar Column */}
          <div className="lg:col-span-4">
            <ExtensionSidebar extension={extension} />
          </div>
        </div>

        {/* 9. Final Bottom CTA Section */}
        <FinalCTASection extension={extension} />
      </main>
    </div>
  );
}
