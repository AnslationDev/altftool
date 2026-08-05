"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Facebook,
  Link2,
  Mail,
  MessageCircle,
  Send,
  Share2,
  Twitter,
  X,
} from "lucide-react";

import { absoluteUrl } from "@/platform/seo/generateMetadata";

import { useLocale } from "../i18n/useLocale";

/**
 * The share sheet — the single most important secondary action on an ad.
 *
 * In Indian classifieds a listing travels by forward, not by link: it is
 * pasted into a family group, a society group, a colleague's DM. So WhatsApp
 * is not one option among seven here, it is *the* action — full width, brand
 * green, top of the list — and everything else is a smaller row below it.
 *
 * Initial focus goes to the close button rather than WhatsApp: a keyboard user
 * who opens the sheet and hits Enter out of habit should not be thrown into a
 * third-party app.
 *
 * The shared URL is always the canonical one built with `absoluteUrl()`, never
 * `window.location.href`. Reading the address bar would forward whatever the
 * visitor happened to have there — a UTM tag, a filter query, a preview
 * hostname — and every one of those splits the link equity of an ad that is
 * about to be seen by fifty people.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Feature-detect the Web Share API without breaking hydration.
 *
 * `navigator.share` does not exist on the server and is missing on most
 * desktop browsers, so reading it during render would make the first client
 * render disagree with the prerendered HTML. useSyncExternalStore is the
 * sanctioned way to say "server says false, client says whatever is true" —
 * it costs no effect, no extra render pass, and no set-state-in-effect.
 */
const NO_SUBSCRIBE = () => () => {};
const readNativeShare = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";
const serverNativeShare = () => false;

/** One row in the secondary network grid. */
function NetworkLink({ href, icon: Icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-11 items-center gap-2.5 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-3 py-2.5 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--muted)/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) motion-reduce:transition-none"
    >
      <Icon className="h-4 w-4 shrink-0 text-(--muted-foreground)" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </a>
  );
}

export default function ShareSheet({ path, title, subtitle = "", className = "" }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const canNativeShare = useSyncExternalStore(
    NO_SUBSCRIBE,
    readNativeShare,
    serverNativeShare,
  );

  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const copyTimer = useRef(null);
  const headingId = useId();

  const url = absoluteUrl(path);
  const shareText = `${title}${subtitle ? ` — ${subtitle}` : ""}`;
  const message = `${shareText}\n${url}`;

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const close = useCallback(() => {
    setOpen(false);
    setEntered(false);
    // A stale "clipboard blocked" warning must not greet the next open.
    setCopyFailed(false);
    // Focus has to come back to where it left from, or a keyboard user is
    // dumped at the top of the document.
    triggerRef.current?.focus();
  }, []);

  // Open behaviour: lock the background, move focus in, trap Tab, close on Escape.
  useEffect(() => {
    if (!open) return undefined;

    const node = dialogRef.current;

    // Flip to the "entered" state one frame after mount so the opacity /
    // translate transition has a starting point to run from.
    //
    // The setTimeout is not belt-and-braces, it is the actual safety net:
    // requestAnimationFrame does NOT fire while the document is hidden
    // (background tab, backgrounded PWA, headless check). Without it the sheet
    // stays at opacity 0 while still holding the focus trap and the scroll
    // lock — an invisible modal the visitor cannot see or escape from. Worst
    // case the timeout wins and the sheet appears without the slide, which is
    // exactly what a prefers-reduced-motion visitor gets anyway.
    const frame = requestAnimationFrame(() => setEntered(true));
    const timer = setTimeout(() => setEntered(true), 60);

    const first = node?.querySelector(FOCUSABLE);
    first?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== "Tab" || !node) return;

      const items = [...node.querySelectorAll(FOCUSABLE)].filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      );
      if (items.length === 0) return;

      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  async function handleCopy() {
    setCopyFailed(false);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 3000);
    } catch {
      // Clipboard access is denied over plain HTTP and in some in-app
      // browsers. Fall back to showing the address so it can be selected.
      setCopyFailed(true);
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, text: shareText, url });
      close();
    } catch {
      // The visitor dismissed the OS sheet — that is not an error, and the
      // sheet stays open so they can pick another target.
    }
  }

  const sheet = (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      {/* Scrim. A real <button> so click-to-dismiss is a proper control, but
          tabIndex -1 keeps it out of the trap: the X button and Escape are the
          keyboard routes out, and a second "Close" stop would just be noise. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={close}
        className={`absolute inset-0 h-full w-full cursor-default bg-black/50 transition-opacity duration-200 motion-reduce:transition-none ${
          entered ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={`relative flex w-full max-w-md flex-col rounded-t-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--background) p-4 shadow-lg transition duration-200 sm:rounded-[var(--anslation-ds-radius-lg,0.75rem)] motion-reduce:transition-none ${
          entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={headingId} className="text-base font-semibold text-(--foreground)">
              {t("item.shareHeading")}
            </h2>
            <p className="mt-0.5 truncate text-xs text-(--muted-foreground)">{title}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={t("item.shareClose")}
            className="-me-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-[var(--anslation-ds-radius-sm,0.5rem)] text-(--muted-foreground) transition-colors hover:bg-(--muted)/60 hover:text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) motion-reduce:transition-none"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Primary: WhatsApp. Deliberately the loudest thing in the sheet.
            #25d366 is WhatsApp's own brand green — a third-party mark, not a
            theme colour, so it is hard-coded on purpose and must NOT swap with
            `data-theme`. Black on it measures ~10:1, well past AA. */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex min-h-12 items-center justify-center gap-2.5 rounded-[var(--anslation-ds-radius-sm,0.5rem)] bg-[#25d366] px-4 py-3 text-base font-semibold text-black transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) motion-reduce:transition-none"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          {t("item.shareWhatsapp")}
        </a>

        {/* Copy link, with the confirmation living in the button itself. */}
        <button
          type="button"
          onClick={handleCopy}
          className="mt-2 flex min-h-11 items-center justify-center gap-2.5 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-4 py-2.5 text-sm font-semibold text-(--foreground) transition-colors hover:bg-(--muted)/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) motion-reduce:transition-none"
        >
          {copied ? (
            <Check className="h-4 w-4 text-(--primary)" aria-hidden="true" />
          ) : (
            <Link2 className="h-4 w-4 text-(--muted-foreground)" aria-hidden="true" />
          )}
          {copied ? t("item.copied") : t("item.copyLink")}
        </button>

        {canNativeShare ? (
          <button
            type="button"
            onClick={handleNativeShare}
            className="mt-2 flex min-h-11 items-center justify-center gap-2.5 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-4 py-2.5 text-sm font-semibold text-(--foreground) transition-colors hover:bg-(--muted)/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) motion-reduce:transition-none"
          >
            <Share2 className="h-4 w-4 text-(--muted-foreground)" aria-hidden="true" />
            {t("item.shareMore")}
          </button>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <NetworkLink
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            icon={Facebook}
            label="Facebook"
          />
          <NetworkLink
            href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`}
            icon={Twitter}
            label="X"
          />
          <NetworkLink
            href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`}
            icon={Send}
            label="Telegram"
          />
          <NetworkLink
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`}
            icon={Mail}
            label="Email"
          />
        </div>

        {/* Always visible: it doubles as the manual fallback when the
            clipboard API is blocked, which it is in several in-app browsers. */}
        <p className="mt-4 break-all rounded-[var(--anslation-ds-radius-xs,0.375rem)] border border-(--border) bg-(--muted)/40 px-2.5 py-2 text-[11px] leading-relaxed text-(--muted-foreground)">
          {url}
        </p>

        <p role="status" aria-live="polite" className="sr-only">
          {copied ? t("item.copiedStatus") : ""}
          {copyFailed ? t("item.copyFailed") : ""}
        </p>

        {copyFailed ? (
          <p className="mt-2 text-xs text-(--muted-foreground)">{t("item.copyBlocked")}</p>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className || "bzr-btn bzr-btn-secondary"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        {t("item.share")}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(sheet, document.body)
        : null}
    </>
  );
}
