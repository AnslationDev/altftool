/**
 * Splits a headline so its trailing phrase renders in the vertical's accent
 * colour with a hand-drawn underline beneath it.
 *
 * `accent` must be a literal substring of `text` (enforced by the data files).
 * If it is missing or does not match, the headline renders plain rather than
 * throwing — a copy edit should never be able to break a page.
 */
export default function HnHeadline({ text, accent }) {
  if (!accent || !text?.includes(accent)) return text;

  const index = text.indexOf(accent);
  const before = text.slice(0, index);
  const after = text.slice(index + accent.length);

  return (
    <>
      {before}
      <span className="hn-hero-accent">
        {accent}
        <svg
          className="hn-hero-underline"
          viewBox="0 0 400 20"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {/* Slight asymmetry in the control points keeps it feeling drawn
              rather than geometric. */}
          <path d="M4 13 C 90 4, 200 3, 396 9" />
        </svg>
      </span>
      {after}
    </>
  );
}
