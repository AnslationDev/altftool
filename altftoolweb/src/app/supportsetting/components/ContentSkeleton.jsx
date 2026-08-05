"use client";

import { Skeleton, SkeletonText } from "@altftool/ui";

/**
 * Brief content-pane placeholder shown for a few hundred ms whenever
 * `activeId` changes — the same premium "content is being intelligently
 * loaded" feel of Notion/Linear/Vercel, applied to every navigation
 * (setting, category, device, or OS), not just the very first page load.
 *
 * Reuses the exact same `Skeleton`/`SkeletonText` primitives and
 * `.support-skeleton-*` classes SupportClient.jsx already uses for its
 * one-time "platform detection still loading" gate — so this looks like
 * a natural extension of an existing pattern, not a new one, and needs
 * zero new skeleton CSS. See SettingsContent.jsx for where this mounts.
 */
const ContentSkeleton = () => (
  <div className="support-page-content-skeleton" aria-hidden="true">
    <div className="support-page-progressbar">
      <div className="support-page-progressbar-fill" />
    </div>
    <Skeleton className="support-skeleton-hero" />
    <SkeletonText lines={2} className="support-skeleton-text-block" />
    <div className="support-skeleton-grid">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="support-skeleton-card" />
      ))}
    </div>
  </div>
);

export default ContentSkeleton;
