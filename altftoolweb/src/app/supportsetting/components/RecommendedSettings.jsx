"use client";

import { Sparkles } from "lucide-react";
import { jumpToSetting } from "./jumpToSetting";

/**
 * A curated set of settings worth checking proactively (setting.recommended
 * === true) — distinct from Quick Actions, which is about what's used most
 * often. E.g. security/backup basics that are easy to overlook.
 */
const RecommendedSettings = ({ settings }) => {
  if (!settings.length) return null;

  return (
    <section className="support-pinned-row" aria-label="Recommended settings">
      <h2 className="support-pinned-row-title">
        <Sparkles className="h-4 w-4" />
        Recommended for You
      </h2>
      <div className="support-recommended-grid">
        {settings.map((setting) => {
          const Icon = setting.icon;
          return (
            <button
              key={setting.id}
              type="button"
              className="support-recommended-card"
              onClick={() => jumpToSetting(setting.id)}
            >
              <span className="support-recommended-icon" aria-hidden="true">
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="support-recommended-title">{setting.title}</span>
                <span className="support-recommended-desc">{setting.heading}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default RecommendedSettings;
