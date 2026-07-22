"use client";

import { History } from "lucide-react";
import { jumpToSetting } from "./jumpToSetting";

/**
 * Shows the settings this visitor actually opened recently (real
 * localStorage-backed history from useRecentlyUsed — nothing fabricated).
 * Empty until they've clicked at least one setting's action button.
 */
const RecentlyUsed = ({ settings }) => {
  if (!settings.length) return null;

  return (
    <section className="support-pinned-row" aria-label="Recently used settings">
      <h2 className="support-pinned-row-title">
        <History className="h-4 w-4" />
        Recently Used
      </h2>
      <div className="support-pinned-chips">
        {settings.map((setting) => {
          const Icon = setting.icon;
          return (
            <button
              key={setting.id}
              type="button"
              className="support-pinned-chip support-pinned-chip-muted"
              onClick={() => jumpToSetting(setting.id)}
            >
              <Icon className="h-4 w-4" />
              {setting.title}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default RecentlyUsed;
