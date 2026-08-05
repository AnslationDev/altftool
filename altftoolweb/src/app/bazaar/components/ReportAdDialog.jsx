"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Flag, Info, X } from "lucide-react";

import { useLocale } from "../i18n/useLocale";

/**
 * "Report this ad" — a modal reason picker.
 *
 * The reason vocabulary is OLX India's own (`badContent`, `fraud`,
 * `duplicated`, `sold`, `other`), because a reporting flow is only useful if
 * the categories match the ones a reporter already has in their head. The
 * values are kept as the machine keys a real endpoint would take, so wiring
 * this to a backend later is a fetch call and nothing else.
 *
 * Nothing is submitted anywhere. The dialog says so before you pick a reason
 * and again after you "submit", because a fake report that silently goes
 * nowhere is worse than no report button at all — it makes a user believe a
 * scam ad has been flagged when it has not.
 *
 * Portalled to <body> under a `.bazaar-page` root: `position: fixed` is only
 * reliable outside any transformed ancestor, and every `--bzr-*` token is
 * declared on that class.
 */

const REASONS = [
  {
    value: "badContent",
    label: "Inappropriate or offensive",
    hint: "Adult, violent, hateful or otherwise unacceptable content.",
  },
  {
    value: "fraud",
    label: "Fraud or scam",
    hint: "Asks for money up front, refuses to meet, or pushes you onto another app.",
  },
  {
    value: "duplicated",
    label: "Duplicate ad",
    hint: "The same item is posted more than once.",
  },
  {
    value: "sold",
    label: "Already sold",
    hint: "The item is gone but the ad is still up.",
  },
  {
    value: "other",
    label: "Something else",
    hint: "Tell us what is wrong with this ad.",
  },
];

const DETAILS_MAX = 500;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ReportAdDialog({ title = "this ad" }) {
  // The reason VALUES stay OLX's machine keys; only labels and hints resolve
  // through the catalogue (`report.reason.<value>` / `report.hint.<value>`).
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [nudge, setNudge] = useState(false);

  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const firstRadioRef = useRef(null);
  const headingId = useId();
  const descriptionId = useId();
  const legendId = useId();
  const hintId = useId();
  const counterId = useId();

  const selected = REASONS.find((item) => item.value === reason) || null;

  function openDialog() {
    // A second visit should start clean, not on the previous acknowledgement.
    setReason("");
    setDetails("");
    setSubmitted(false);
    setNudge(false);
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  /* Body scroll lock, released on unmount so every close path — button,
     backdrop, Escape — restores the page exactly once. The gutter pad goes on
     the side the scrollbar actually occupies: right in LTR, left in RTL
     documents (Chrome/Firefox move the classic scrollbar under dir="rtl"), so
     the compensation is physical on purpose but picks its side per direction. */
  useEffect(() => {
    if (!open) return undefined;

    const { body } = document;
    const side =
      getComputedStyle(document.documentElement).direction === "rtl"
        ? "paddingLeft"
        : "paddingRight";
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style[side];
    const gutter = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gutter > 0) body.style[side] = `${gutter}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style[side] = previousPadding;
    };
  }, [open]);

  /* Focus the first reason on open — the decision the dialog exists to take. */
  useEffect(() => {
    if (open) firstRadioRef.current?.focus();
  }, [open]);

  /* Escape + focus trap. */
  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }
      if (event.key !== "Tab") return;

      const root = panelRef.current;
      if (!root) return;

      // tabIndex >= 0 keeps anything the browser skips out of the trap's
      // boundary calculation — otherwise "last" can be a stop Tab never
      // reaches and focus escapes the dialog.
      const nodes = Array.from(root.querySelectorAll(FOCUSABLE)).filter(
        (node) =>
          node.tabIndex >= 0 &&
          (node.offsetParent !== null || node === document.activeElement),
      );
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (!root.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!reason) {
      // The button stays reachable (aria-disabled, not disabled) precisely so
      // this path exists: pressing it explains itself instead of doing nothing.
      setNudge(true);
      firstRadioRef.current?.focus();
      return;
    }
    setSubmitted(true);
  }

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      className="bzr-btn bzr-btn-secondary"
      aria-haspopup="dialog"
      onClick={openDialog}
    >
      <Flag className="h-4 w-4" aria-hidden="true" />
      {t("report.heading")}
    </button>
  );

  if (!open || typeof document === "undefined") return trigger;

  return (
    <>
      {trigger}
      {createPortal(
        <div
          className="bazaar-page fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            aria-describedby={descriptionId}
            className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--background) shadow-xl sm:rounded-[var(--anslation-ds-radius-lg,0.75rem)]"
          >
            {/* ---------------- Header ---------------- */}
            <div className="flex shrink-0 items-start gap-3 border-b border-(--border) px-4 py-3">
              <div className="min-w-0 flex-1">
                <h2 id={headingId} className="text-base font-semibold text-(--foreground)">
                  {t("report.heading")}
                </h2>
                <p className="mt-0.5 truncate text-xs text-(--muted-foreground)">{title}</p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                aria-label={t("report.close")}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-(--border) text-(--foreground) motion-safe:transition hover:bg-(--muted)/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {submitted ? (
              /* ---------------- Success ---------------- */
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <div
                  role="status"
                  className="flex items-start gap-2.5 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--muted)/40 px-3 py-3"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-(--primary)" aria-hidden="true" />
                  <div className="min-w-0 text-sm text-(--foreground)">
                    <p className="font-semibold">
                      {t("report.reasonRecorded", {
                        label: selected
                          ? t(`report.reason.${selected.value}`, selected.label)
                          : "",
                      })}
                    </p>
                    {reason === "other" && details.trim() ? (
                      <p className="mt-1 break-words text-(--muted-foreground)">
                        “{details.trim()}”
                      </p>
                    ) : null}
                    <p className="mt-2 text-(--muted-foreground)">
                      <strong className="font-semibold text-(--foreground)">
                        Nothing was sent.
                      </strong>{" "}
                      AltF Bazaar is a prototype with no backend, so this report exists only in
                      this browser tab and disappears when you close it. On the live product it
                      would reach a moderator, and repeat reports against one seller would
                      suspend the account pending review.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button type="button" className="bzr-btn" onClick={closeDialog}>
                    {t("common.done")}
                  </button>
                </div>
              </div>
            ) : (
              /* ---------------- Form ---------------- */
              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                  <p
                    id={descriptionId}
                    className="mb-3 flex items-start gap-2 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--muted)/40 px-3 py-2.5 text-xs text-(--muted-foreground)"
                  >
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {/* Three catalogue parts so the bold phrase lands where each
                        language's word order puts it. */}
                    <span>
                      {t("report.demo.pre")}
                      <strong className="font-semibold">{t("report.demo.strong")}</strong>
                      {t("report.demo.post")}
                    </span>
                  </p>

                  <fieldset className="border-0 p-0">
                    <legend id={legendId} className="mb-2 text-sm font-semibold text-(--foreground)">
                      {t("report.whyHeading")}
                    </legend>

                    <div className="flex flex-col gap-1.5">
                      {REASONS.map((item, index) => {
                        const checked = reason === item.value;
                        return (
                          <label
                            key={item.value}
                            className={`flex cursor-pointer items-start gap-2.5 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border px-3 py-2.5 motion-safe:transition ${
                              checked
                                ? "border-(--primary) bg-(--primary)/8"
                                : "border-(--border) hover:bg-(--muted)/40"
                            }`}
                          >
                            <input
                              ref={index === 0 ? firstRadioRef : undefined}
                              type="radio"
                              name="report-reason"
                              value={item.value}
                              checked={checked}
                              onChange={() => {
                                setReason(item.value);
                                setNudge(false);
                              }}
                              className="mt-0.5 h-4 w-4 shrink-0 accent-(--primary)"
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-(--foreground)">
                                {t(`report.reason.${item.value}`, item.label)}
                              </span>
                              <span className="block text-xs text-(--muted-foreground)">
                                {t(`report.hint.${item.value}`, item.hint)}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  {reason === "other" ? (
                    <div className="mt-3">
                      <label
                        htmlFor="report-details"
                        className="mb-1 block text-sm font-semibold text-(--foreground)"
                      >
                        {t("report.whatWrong")}
                      </label>
                      <textarea
                        id="report-details"
                        rows={4}
                        value={details}
                        maxLength={DETAILS_MAX}
                        onChange={(event) => setDetails(event.target.value.slice(0, DETAILS_MAX))}
                        aria-describedby={counterId}
                        placeholder={t("report.detailsPlaceholder")}
                        className="w-full resize-y rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-3 py-2 text-sm text-(--foreground) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-(--primary)"
                      />
                      <p
                        id={counterId}
                        className={`mt-1 text-end text-xs tabular-nums ${
                          details.length >= DETAILS_MAX
                            ? "font-semibold text-(--foreground)"
                            : "text-(--muted-foreground)"
                        }`}
                      >
                        {t("common.charCounter", { count: details.length, max: DETAILS_MAX })}
                        {details.length >= DETAILS_MAX ? t("common.limitReached") : ""}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* ---------------- Footer ---------------- */}
                <div className="shrink-0 border-t border-(--border) px-4 py-3">
                  {/* The submit is aria-disabled rather than `disabled`: a
                      `disabled` button drops out of the tab order, so its
                      explanation is never announced and the control reads as
                      simply broken. This one stays reachable and says why. */}
                  <p id={hintId} className="mb-2 text-xs text-(--muted-foreground)">
                    {reason
                      ? t("report.reportingAs", {
                          label: selected
                            ? t(`report.reason.${selected.value}`, selected.label)
                            : "",
                        })
                      : t("report.pickReason")}
                  </p>

                  {/* Rendered only on a blocked submit. A role="alert" node
                      that appears is announced; one that is always present
                      and merely changes text often is not. */}
                  {nudge && !reason ? (
                    <p
                      role="alert"
                      className="mb-2 text-xs font-semibold text-(--bzr-urgent)"
                    >
                      {t("report.chooseFirst")}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      className="bzr-btn bzr-btn-secondary"
                      onClick={closeDialog}
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      className={`bzr-btn ${reason ? "" : "cursor-not-allowed opacity-55"}`}
                      aria-disabled={reason ? undefined : "true"}
                      aria-describedby={hintId}
                    >
                      {t("report.submit")}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
