"use client";

import { Zap } from "lucide-react";
import { jumpToSetting } from "./jumpToSetting";

/**
 * Pinned row of the current platform's most-frequently-used settings
 * (setting.frequentlyUsed === true). Clicking a chip scrolls to and
 * highlights the real card further down — it doesn't duplicate the action
 * button, it just gets you there faster.
 */
const QuickActions = ({ settings }) => {
  if (!settings.length) return null;

  return (
    <section className="support-pinned-row" aria-label="Quick actions">
      <h2 className="support-pinned-row-title">
        <Zap className="h-4 w-4" />
        Quick Actions
      </h2>
      <div className="support-pinned-chips">
        {settings.map((setting) => {
          const Icon = setting.icon;
          return (
            <button
              key={setting.id}
              type="button"
              className="support-pinned-chip"
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

export default QuickActions;
