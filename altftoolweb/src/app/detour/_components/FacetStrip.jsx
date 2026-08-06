import { Clock, Eye, EyeOff, Volume2, VolumeX, Smartphone } from "lucide-react";

/*
 * The signature device of AltF Detour.
 *
 * Four glyphs answering the questions a link directory usually leaves you to
 * find out by clicking: how long will this take, can my colleague see it, will
 * it make noise, does it work on my phone.
 *
 * bored.com has no equivalent, and those four facts are most of why someone
 * picks one link over another when they are bored at a desk.
 *
 * Colour is never the only carrier — every glyph has a text label or an
 * accessible name, and the "off" states use a distinct icon rather than just
 * a dimmed one.
 */

const MINUTE_LABEL = {
  1: "<1 min",
  5: "5 min",
  15: "15 min",
  60: "1 hr+",
};

export default function FacetStrip({ minutes, sfw, needsSound, mobileOk, className = "" }) {
  return (
    <ul className={`dtr-facets text-muted-foreground ${className}`} aria-label="At a glance">
      <li className="dtr-facet" style={{ color: "var(--dtr-time)" }}>
        <Clock aria-hidden="true" />
        <span>{MINUTE_LABEL[minutes] ?? `${minutes} min`}</span>
      </li>

      <li
        className={`dtr-facet ${sfw ? "" : "dtr-facet--off"}`}
        style={sfw ? { color: "var(--dtr-work)" } : undefined}
      >
        {sfw ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
        <span>{sfw ? "Work safe" : "Not at work"}</span>
      </li>

      <li
        className={`dtr-facet ${needsSound ? "" : "dtr-facet--off"}`}
        style={needsSound ? { color: "var(--dtr-sound)" } : undefined}
      >
        {needsSound ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        <span>{needsSound ? "Sound on" : "Silent"}</span>
      </li>

      <li
        className={`dtr-facet ${mobileOk ? "" : "dtr-facet--off"}`}
        style={mobileOk ? { color: "var(--dtr-mobile)" } : undefined}
      >
        <Smartphone aria-hidden="true" />
        <span>{mobileOk ? "Phone OK" : "Desktop"}</span>
      </li>
    </ul>
  );
}

export { MINUTE_LABEL };
