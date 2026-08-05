"use client";

import { Languages } from "lucide-react";

import { LOCALES, useLocale } from "../i18n/useLocale";
import { LOCALE_LABELS } from "../i18n/strings";

/**
 * EN / हिन्दी switch for the Bazaar interface, plus the honest scope note.
 *
 * PLACEMENT — a strip of its own, not a control in the sticky row.
 * At 360px the sticky bar already carries the search field, the city picker and
 * the Sell button, and the search field is the one control that must not shrink
 * further. This sits directly beneath it inside `.bzr-shell`, which keeps it in
 * the sub-header where a language switch is expected while leaving room for the
 * one thing a translated interface owes its reader: a line saying what is NOT
 * translated. Ad titles and descriptions are written by sellers; a Hindi shell
 * around English ad copy is honest, silently pretending the page is Hindi is
 * not. The note is shown only in Hindi, because in English there is no gap
 * between the interface and the ads to explain.
 *
 * ACCESSIBILITY
 * - Two real toggle buttons in a labelled group, each with `aria-pressed`, so a
 *   screen reader announces which language is active rather than just reading
 *   two words.
 * - `lang="hi"` on every Devanagari string. "हिन्दी" carries it even in English
 *   mode (it is Devanagari either way), and the whole group carries it in Hindi
 *   mode because its accessible names are then Hindi too. Without this a screen
 *   reader applies English phonology to Devanagari and the result is unusable.
 * - `aria-describedby` ties the group to the scope note, so the caveat is part
 *   of the control's description instead of a paragraph a screen-reader user
 *   only meets if they happen to keep reading.
 *
 * DEVANAGARI METRICS — and why the typography sits on the inner <span>
 * Devanagari sets taller than Latin at the same font-size (matras ride above the
 * shirorekha and below the baseline) and reads optically smaller, so the Hindi
 * label is a shade larger than "EN". Left to itself that makes the two chips
 * different heights, so both labels also carry an ABSOLUTE line-height
 * (`leading-5` = 20px, not a multiplier) which fixes the box height whatever
 * font-size is inside.
 *
 * Those utilities are on the <span>, not on the <button>, and they have to be:
 * `globals.css` carries an **unlayered** `button, input, textarea, select {
 * font: inherit }`. Unlayered rules beat every layered rule, so on a <button>
 * that one declaration silently defeats `.bzr-chip`'s own `font-size`/
 * `font-weight` (in `@layer components`) AND any Tailwind `text-*` / `leading-*`
 * utility (in `@layer utilities`). Measured: `<button class="bzr-chip">`
 * computes to 16px/400 while `<a class="bzr-chip">` computes to 12.48px/600.
 * It is the same shape as the display-property trap the blueprint documents,
 * and the same workaround — move the property to an element that is not a
 * <button>. Non-typographic utilities (`py-1.5`) are unaffected and stay put.
 */

const NOTE_ID = "bzr-locale-scope-note";

/** The EN / हिन्दी pill pair — shared by both placements below. */
function LocalePills({ compact = false }) {
  const { locale, setLocale, isHindi, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t("locale.group")}
      aria-describedby={isHindi ? NOTE_ID : undefined}
      lang={isHindi ? "hi" : undefined}
      className="flex shrink-0 items-center gap-1"
    >
      <Languages
        className="me-0.5 h-3.5 w-3.5 shrink-0 text-(--muted-foreground)"
        aria-hidden="true"
      />

      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            className={`bzr-chip ${compact ? "py-1" : "py-1.5"}${active ? " is-active" : ""}`}
            aria-pressed={active}
            aria-label={t(`locale.switchTo.${code}`)}
            onClick={() => setLocale(code)}
          >
            <span
              lang={code === "hi" ? "hi" : undefined}
              className={`font-semibold leading-5 ${
                code === "hi" ? "text-[0.82rem]" : "text-[0.78rem]"
              }`}
            >
              {LOCALE_LABELS[code]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Desktop placement: inside the sticky search row, where a language switch
 * costs no vertical space. Hidden below `sm`, where that row is already full.
 */
export function LocaleToggleInline() {
  return (
    <div className="hidden sm:block">
      <LocalePills compact />
    </div>
  );
}

/**
 * The band. On phones it carries the pills (the sticky row has no room); at
 * `sm+` the pills live in the sticky row, so the band's only remaining job is
 * the Hindi scope note — in English at `sm+` it renders nothing at all,
 * which removes a near-empty gray strip that used to sit between the sticky
 * bar and the breadcrumbs on every desktop page.
 *
 * Visibility is pure CSS (`sm:hidden` on the pills wrapper), so the server
 * markup is identical for both locales pre-hydration.
 */
export default function LocaleToggle() {
  const { isHindi, t } = useLocale();

  return (
    <div
      className={`border-b border-(--border) bg-(--bzr-shell) ${
        isHindi ? "" : "sm:hidden"
      }`}
    >
      <div className="section-container flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5">
        {/* Order flips at `sm`: on a narrow phone the switch keeps the first
            row and the note wraps under it, rather than squeezing both. */}
        {isHindi ? (
          <p
            id={NOTE_ID}
            lang="hi"
            className="order-2 w-full min-w-0 text-[0.7rem] leading-[1.55] text-(--muted-foreground) sm:order-1 sm:w-auto sm:flex-1"
          >
            {t("locale.ugcNote")}
          </p>
        ) : null}

        <div className="order-1 ms-auto sm:hidden">
          <LocalePills />
        </div>
      </div>
    </div>
  );
}
