"use client";

import TroubleshootingSection from "./TroubleshootingSection";
import FaqShortcuts from "./FaqShortcuts";
import HelpDocumentationCards from "./HelpDocumentationCards";
import DeviceInfoPanel from "./DeviceInfoPanel";
import DiagnosticsPanel from "./DiagnosticsPanel";
import SystemStatusPanel from "./SystemStatusPanel";
import ContactSupportCard from "./ContactSupportCard";
import FeedbackCard from "./FeedbackCard";
import KeyboardShortcutsCard from "./KeyboardShortcutsCard";

const PLATFORM_LABEL = {
  windows: "Windows",
  macos: "macOS",
  android: "Android",
  ios: "iOS",
};

export const UTILITY_TITLES = {
  "util-troubleshooting": "Troubleshooting",
  "util-faq": "FAQ & Help",
  "util-device": "Device Info & Diagnostics",
  "util-contact": "Contact & Feedback",
};

/**
 * Full-page destination for each "Help & Tools" sidebar item — under the
 * flat, one-page-at-a-time nav model these are no longer anchor-scrolled
 * sections stacked on the same page, they're their own single screen, same
 * as any real setting's detail page.
 */
const UtilityPage = ({ id, platform, detectedPlatform }) => {
  const title = UTILITY_TITLES[id] || "Help & Tools";

  return (
    <div className="support-utility-page" aria-label={title}>
      <header className="support-utility-page-hero">
        <p className="support-hero-eyebrow">Help &amp; Tools</p>
        <h2 className="support-hero-title">{title}</h2>
      </header>

      {id === "util-troubleshooting" && <TroubleshootingSection platform={platform} />}

      {id === "util-faq" && (
        <>
          <FaqShortcuts />
          <HelpDocumentationCards />
        </>
      )}

      {id === "util-device" && (
        <>
          <DeviceInfoPanel platformLabel={PLATFORM_LABEL[detectedPlatform]} />
          <SystemStatusPanel />
          <DiagnosticsPanel />
        </>
      )}

      {id === "util-contact" && (
        <>
          <div className="support-contact-feedback-row">
            <ContactSupportCard />
            <FeedbackCard />
          </div>
          <KeyboardShortcutsCard />
        </>
      )}
    </div>
  );
};

export default UtilityPage;
