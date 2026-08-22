// Server-only article rendering for the Support Settings catch-all route.
//
// SupportClient is a client app that shows a skeleton until platform
// detection and persisted preferences settle — which means a crawler with
// JavaScript off used to get no article content at all for any of the ~850
// deep links. This module resolves the one record a slug points at and
// renders its authored content (title, description, why-it-matters, steps,
// best practices, common issues, FAQs) as plain semantic HTML on the server.
// The page passes that block into SupportClient, which shows it in place of
// the pre-ready skeleton and replaces it with the interactive app once
// hydrated — so the substance is in the HTML without ever appearing twice.
//
// Bundle discipline (see ../data/routeShape.js for the history): the four OS
// catalogues (~2 MB of source) must never be statically imported here — that
// once made this route's server bundle the largest in the app. Each platform
// is loaded through its own explicit dynamic import so webpack emits one
// separate server chunk per platform and a request only ever loads the one
// it needs. Nothing in this file is imported from any client component, so
// none of this weight reaches a client bundle.

import { getDeviceById } from "../data/deviceTaxonomy";
import { getCategoryById } from "../data/categories";

const PLATFORM_LOADERS = {
  windows: () => import("../data/platforms/windows").then((m) => m.windowsSettings),
  macos: () => import("../data/platforms/macos").then((m) => m.macosSettings),
  android: () => import("../data/platforms/android").then((m) => m.androidSettings),
  ios: () => import("../data/platforms/ios").then((m) => m.iosSettings),
};

async function loadPlatformSettings(platform) {
  const loader = PLATFORM_LOADERS[platform];
  if (!loader) return null;
  try {
    return await loader();
  } catch {
    return null;
  }
}

/**
 * Resolve the record a pre-validated slug points at, loading only the data
 * that slug actually needs. Returns null for the shapes with no authored
 * article (home, bare help topics) and on any load failure — the caller then
 * simply renders no server article, which is exactly the pre-change state.
 *
 * Result kinds: "os-setting" | "device-setting" | "device-landing" |
 * "category" | "ai-tool".
 */
export async function resolveSupportRecord(slug) {
  const parts = Array.isArray(slug) ? slug.filter(Boolean) : [];
  if (parts.length === 0) return null;
  const [first, second, third] = parts;

  if (first === "help") return null;

  if (first === "ai-tools") {
    if (!second) return null;
    try {
      const { getAiToolById } = await import("../data/aiTools");
      const tool = getAiToolById(`ai-${second}`);
      return tool ? { kind: "ai-tool", tool } : null;
    } catch {
      return null;
    }
  }

  if (PLATFORM_LOADERS[first]) {
    const settings = await loadPlatformSettings(first);
    if (!settings) return null;
    if (!second) return null; // platform preview of the home page — no single article
    if (second === "category") {
      const category = third ? getCategoryById(third) : null;
      if (!category) return null;
      const members = settings.filter((setting) => setting.category === category.id);
      return members.length
        ? { kind: "category", platform: first, category, settings: members }
        : null;
    }
    const setting = settings.find((item) => item.id === second) || null;
    return setting ? { kind: "os-setting", platform: first, setting, settings } : null;
  }

  const device = getDeviceById(first);
  if (!device) return null;
  try {
    const { getSettingsForDevice } = await import("../data/devices");
    const deviceSettings = getSettingsForDevice(first) || [];
    if (!second) {
      return deviceSettings.length
        ? { kind: "device-landing", device, settings: deviceSettings }
        : null;
    }
    const setting = deviceSettings.find((item) => item.id === second) || null;
    return setting
      ? { kind: "device-setting", device, setting, settings: deviceSettings }
      : null;
  } catch {
    return null;
  }
}

/** Metadata title/description derived from a resolved record, or null. */
export function describeSupportRecord(record) {
  if (!record) return null;
  const base = "Support Settings";
  switch (record.kind) {
    case "os-setting":
      return {
        title: `${record.setting.title} — ${base} | AltFTool`,
        description: record.setting.description || undefined,
      };
    case "device-setting":
      return {
        title: `${record.setting.title} — ${record.device.name} ${base} | AltFTool`,
        description: record.setting.description || undefined,
      };
    case "device-landing":
      return {
        title: `${record.device.name} Support — ${base} | AltFTool`,
        description: `Browse support settings and guides for ${record.device.name}.`,
      };
    case "category":
      return {
        title: `${record.category.label} — ${base} | AltFTool`,
        description: record.category.description || undefined,
      };
    case "ai-tool":
      return {
        title: `${record.tool.name} — ${base} | AltFTool`,
        description: record.tool.tagline || undefined,
      };
    default:
      return null;
  }
}

/** FAQ list ({q, a}) actually present in the server-rendered article. */
export function recordFaqs(record) {
  if (!record) return [];
  if (record.kind === "os-setting" || record.kind === "device-setting") {
    return record.setting.faqs || [];
  }
  if (record.kind === "ai-tool") return record.tool.faqs || [];
  return [];
}

/** Step strings actually present in the server-rendered article. */
export function recordSteps(record) {
  if (!record) return [];
  if (record.kind === "os-setting" || record.kind === "device-setting") {
    return record.setting.afterImageContent?.steps || [];
  }
  return [];
}

function settingHref(setting) {
  return `/supportsetting/${setting.platform}/${setting.id}`;
}

function ListSection({ title, items }) {
  if (!items?.length) return null;
  return (
    <section className="support-detail-section">
      <h2 className="support-detail-section-title">{title}</h2>
      <ul className="support-detail-native-list list-none pl-0 m-0">
        {items.map((item, index) => (
          <li key={index} className="support-detail-native-row">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function IssueSection({ title, issues }) {
  if (!issues?.length) return null;
  return (
    <section className="support-detail-section">
      <h2 className="support-detail-section-title">{title}</h2>
      <div className="support-detail-issues">
        {issues.map((entry, index) => (
          <div key={index} className="support-detail-issue-card">
            <h3 className="support-detail-issue-title">{entry.issue}</h3>
            <p className="support-detail-issue-fix">{entry.fix}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqSection({ faqs }) {
  if (!faqs?.length) return null;
  return (
    <section className="support-detail-section">
      <h2 className="support-detail-section-title">Frequently Asked Questions</h2>
      <div className="support-accordion">
        {faqs.map((faq, index) => (
          <div key={index} className="support-accordion-item">
            <h3 className="support-accordion-trigger-left px-4 pt-3 m-0">{faq.q}</h3>
            <div className="support-accordion-panel">{faq.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GuideLinkList({ settings, hrefFor }) {
  return (
    <nav className="support-category-hub-list" aria-label="Guides">
      {settings.map((setting) => (
        <a key={setting.id} className="support-category-hub-row" href={hrefFor(setting)}>
          <span className="support-category-hub-row-text">
            <span className="support-category-hub-row-title">{setting.title}</span>
            {setting.heading && (
              <span className="support-category-hub-row-desc">{setting.heading}</span>
            )}
          </span>
        </a>
      ))}
    </nav>
  );
}

function SettingArticle({ setting, settings, deviceName }) {
  const related = (setting.relatedSettingIds || [])
    .map((id) => (settings || []).find((item) => item.id === id))
    .filter(Boolean);
  const after = setting.afterImageContent;

  return (
    <article className="support-detail-page" aria-label={setting.title}>
      <header className="support-detail-hero">
        <h1 className="support-detail-title">{setting.title}</h1>
        {setting.heading && <p className="support-detail-heading">{setting.heading}</p>}
        {deviceName && <p className="support-detail-heading">{deviceName} guide</p>}
        {setting.description && (
          <p className="support-detail-description">{setting.description}</p>
        )}
      </header>

      <ListSection title="Quick Facts" items={setting.details} />

      {setting.important && (
        <section className="support-detail-section" role="note">
          <h2 className="support-detail-section-title">Important</h2>
          <p className="support-detail-prose">{setting.important}</p>
        </section>
      )}

      {setting.whyItMatters && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">Why It Matters</h2>
          <p className="support-detail-prose">{setting.whyItMatters}</p>
        </section>
      )}

      {(after?.heading || after?.paragraphs?.length > 0) && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">{after.heading || "How It Works"}</h2>
          {after.paragraphs?.map((paragraph, index) => (
            <p key={index} className="support-detail-prose">
              {paragraph}
            </p>
          ))}
        </section>
      )}

      {after?.steps?.length > 0 && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">Step-by-Step</h2>
          <ol className="support-detail-prose list-decimal pl-6 space-y-1">
            {after.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      <ListSection title="Best Practices" items={setting.bestPractices} />
      <IssueSection title="Common Issues & Troubleshooting" issues={setting.commonIssues} />
      <ListSection title="Tips & Tricks" items={setting.tipsAndTricks} />
      <FaqSection faqs={setting.faqs} />

      {related.length > 0 && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">Related Settings</h2>
          <GuideLinkList settings={related} hrefFor={settingHref} />
        </section>
      )}
    </article>
  );
}

function DeviceLandingArticle({ device, settings }) {
  return (
    <article className="support-detail-page" aria-label={`${device.name} support`}>
      <header className="support-detail-hero">
        <h1 className="support-detail-title">{device.name} Support</h1>
        <p className="support-detail-description">
          Browse support settings and step-by-step guides for {device.name}.
        </p>
      </header>
      <section className="support-detail-section">
        <h2 className="support-detail-section-title">Guides</h2>
        <GuideLinkList
          settings={settings}
          hrefFor={(setting) => `/supportsetting/${device.id}/${setting.id}`}
        />
      </section>
    </article>
  );
}

function CategoryArticle({ platform, category, settings }) {
  return (
    <article className="support-detail-page" aria-label={category.label}>
      <header className="support-detail-hero">
        <h1 className="support-detail-title">{category.label}</h1>
        {category.description && (
          <p className="support-detail-description">{category.description}</p>
        )}
      </header>
      <section className="support-detail-section">
        <h2 className="support-detail-section-title">Settings in this category</h2>
        <GuideLinkList
          settings={settings}
          hrefFor={(setting) => `/supportsetting/${platform}/${setting.id}`}
        />
      </section>
    </article>
  );
}

function AiToolArticle({ tool }) {
  return (
    <article className="support-detail-page" aria-label={tool.name}>
      <header className="support-detail-hero">
        <h1 className="support-detail-title">{tool.name}</h1>
        {tool.categoryLabel && <p className="support-detail-heading">{tool.categoryLabel}</p>}
        {tool.tagline && <p className="support-detail-description">{tool.tagline}</p>}
      </header>

      {tool.overview?.whatIsIt && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">What is {tool.name}?</h2>
          <p className="support-detail-prose">{tool.overview.whatIsIt}</p>
        </section>
      )}

      <ListSection title="Main Features" items={tool.overview?.mainFeatures} />

      {tool.pricing?.summary && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">Pricing</h2>
          <p className="support-detail-prose">{tool.pricing.summary}</p>
        </section>
      )}

      <ListSection title="Tips" items={tool.usage?.tips} />
      <IssueSection title="Troubleshooting" issues={tool.troubleshooting} />
      <FaqSection faqs={tool.faqs} />
    </article>
  );
}

/**
 * The server-rendered article for a resolved record. Rendered by the
 * [...slug] server page and handed to SupportClient, which displays it until
 * the interactive app is ready and then swaps it out.
 */
export function SupportSettingArticle({ record }) {
  if (!record) return null;
  switch (record.kind) {
    case "os-setting":
      return <SettingArticle setting={record.setting} settings={record.settings} />;
    case "device-setting":
      return (
        <SettingArticle
          setting={record.setting}
          settings={record.settings}
          deviceName={record.device.name}
        />
      );
    case "device-landing":
      return <DeviceLandingArticle device={record.device} settings={record.settings} />;
    case "category":
      return (
        <CategoryArticle
          platform={record.platform}
          category={record.category}
          settings={record.settings}
        />
      );
    case "ai-tool":
      return <AiToolArticle tool={record.tool} />;
    default:
      return null;
  }
}
