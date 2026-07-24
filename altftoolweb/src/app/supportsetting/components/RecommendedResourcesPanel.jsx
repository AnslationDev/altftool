"use client";

import { ChevronLeft, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import { Skeleton } from "@altftool/ui";

/**
 * Replaces the old "Sponsored" ad rail. Small, sticky, collapsible from a
 * control on the panel itself (not buried in Customize This Page), and
 * shows at most 3 items — every one of them contextually relevant to
 * whatever page is currently open (see data/recommendedResources.js),
 * never a generic or paid placement.
 */
const RecommendedResourcesPanel = ({ resources, collapsed, onToggleCollapse, loading, onSelectInternal }) => {
  const hasResources = resources && resources.length > 0;
  if (!hasResources && !loading) return null;

  return (
    <div className="support-resources-panel">
      <div className="support-resources-panel-header">
        {!collapsed && (
          <span className="support-resources-panel-label">
            <Sparkles className="h-3.5 w-3.5" />
            Recommended Resources
          </span>
        )}
        <button
          type="button"
          className="support-resources-collapse-toggle"
          onClick={onToggleCollapse}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand recommended resources" : "Collapse recommended resources"}
        >
          {collapsed ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="support-resources-list">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="support-resource-card support-resource-card-skeleton" aria-hidden="true">
                  <Skeleton className="support-resource-skeleton-line" />
                  <Skeleton className="support-resource-skeleton-line support-resource-skeleton-line-sm" />
                </div>
              ))
            : resources.map((resource, i) => {
                const Icon = resource.icon || Sparkles;
                const content = (
                  <>
                    <span className="support-resource-icon" aria-hidden="true">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="support-resource-copy">
                      <span className="support-resource-title">{resource.title}</span>
                      {resource.description && <span className="support-resource-desc">{resource.description}</span>}
                    </span>
                    {resource.external && <ExternalLink className="h-3.5 w-3.5 support-resource-arrow" />}
                  </>
                );

                return resource.internalId ? (
                  <button
                    key={resource.internalId || i}
                    type="button"
                    className="support-resource-card"
                    onClick={() => onSelectInternal(resource.internalId)}
                  >
                    {content}
                  </button>
                ) : (
                  <a
                    key={resource.href || i}
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-resource-card"
                  >
                    {content}
                  </a>
                );
              })}
        </div>
      )}
    </div>
  );
};

export default RecommendedResourcesPanel;
