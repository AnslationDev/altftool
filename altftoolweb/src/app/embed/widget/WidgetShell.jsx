import "server-only";

import { getEmbedAttributionUrl, getEmbedToolName } from "../embedRegistry";
import EmbedErrorBoundary from "./EmbedErrorBoundary";

/**
 * The iframe document every widget family shares: full-height token-themed
 * page, the widget itself, and the credit footer.
 *
 * Server component — it takes the already-rendered widget as `children`, so
 * each route decides how to mount its own tool (a lazy client loader for the
 * /tools family, a direct client component for /transform and /exam-photo)
 * without any of them re-implementing the chrome or the attribution link.
 *
 * @param {{ id: string, theme?: string, children: React.ReactNode }} props
 *   `id` is a widget id (see embedSnippet.js), `theme` the raw ?theme value.
 */
export default function WidgetShell({ id, theme, children }) {
  const attributionUrl = getEmbedAttributionUrl(id);
  const name = getEmbedToolName(id);
  const forcedTheme = theme === "dark" || theme === "light" ? theme : null;

  return (
    <div className="flex min-h-screen flex-col bg-(--page) text-(--foreground)">
      {forcedTheme ? (
        // Embedders pin the widget theme via ?theme=dark|light; the token
        // system switches on html[data-theme], so set it before paint and
        // pin the mode so the site-level theme script leaves it alone.
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute("data-theme","${forcedTheme}");document.documentElement.setAttribute("data-theme-mode","${forcedTheme}");document.documentElement.style.colorScheme="${forcedTheme}";`,
          }}
        />
      ) : null}
      <main className="flex-1 p-3 sm:p-4">
        <EmbedErrorBoundary fallbackHref={attributionUrl}>{children}</EmbedErrorBoundary>
      </main>
      <footer className="border-t border-(--border) bg-(--surface) px-4 py-2.5">
        <p className="text-xs text-(--muted-foreground)">
          {name} widget by{" "}
          {/*
            This link lives on an AltFTool iframe document and points to the
            widget's own AltFTool page, so it is an internal product link. The
            separate credit line injected into a publisher's page is qualified
            with nofollow in embedSnippet.js.
          */}
          <a
            href={attributionUrl}
            target="_top"
            rel="noopener"
            className="font-semibold text-(--primary-text) underline underline-offset-2 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35"
          >
            AltFTool — free online tools
          </a>
        </p>
      </footer>
    </div>
  );
}
