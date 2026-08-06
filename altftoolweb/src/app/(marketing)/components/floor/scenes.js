/*
 * Scenes — representative workflows for each AltF product.
 *
 * The room, the cast, the desks and the conveyor never change: it is one team,
 * and they build every AltFTool product. What changes per page is the palette,
 * the signage, what the four pods are called, and what comes off the line.
 *
 * That is the whole point of splitting this file out. A second product does not
 * need a second scene engine, a second stylesheet or a second set of coordinates
 * — it needs six colours and six sentences.
 *
 * ACCENTS
 * `accent` is the five semantic colour slots the stylesheet reads
 * (--fl-a1..--fl-a5), in the order exec, engineering, design, HR, release.
 * Reusing shared theme tokens keeps every scene legible in light and dark mode.
 *
 * ACTIVITY
 * Every line describes work the product actually does. When this is wired to the
 * real build log the shape does not change — label, role, meta — so nothing here
 * or in the component has to move.
 */

/** The default: AltFTool itself. */
export const OFFICE_SCENE = {
  id: "office",
  signage: "ALTF",
  accent: [
    "var(--fl-scene-warning)",
    "var(--fl-scene-info)",
    "var(--fl-scene-accent)",
    "var(--fl-scene-success)",
    "var(--fl-scene-primary)",
  ],
  zones: { hr: "Meeting", exec: "Exec", dev: "Engineering", design: "Design", qa: "Release" },
  alt: "the AltFTool team at work: a founder handing tasks to an engineering manager and a design manager, engineering, design and release pods building tools at their desks, an HR lead moving between them, and finished tools travelling out along a line",
  activity: [
    { label: "Regex Tester — shipped to /tools", role: "dev", meta: "build" },
    { label: "Palette generator — new UI approved", role: "design", meta: "design" },
    { label: "Backlinks — opportunities indexed", role: "qa", meta: "review" },
    { label: "AltF Ideas — candidates scored", role: "exec", meta: "corpus" },
    { label: "Detour — links verified", role: "qa", meta: "crawl" },
    { label: "PDF Merge — landing page built", role: "design", meta: "live" },
  ],
};

/** AltF Ideas: the corpus floor. */
export const IDEAS_SCENE = {
  id: "ideas",
  signage: "IDEAS",
  accent: [
    "var(--fl-scene-warning)",
    "var(--fl-scene-secondary)",
    "var(--fl-scene-accent)",
    "var(--fl-scene-success)",
    "var(--fl-scene-primary)",
  ],
  zones: { hr: "Review", exec: "Sourcing", dev: "Scoring", design: "Dossiers", qa: "Ranking" },
  alt: "the AltF Ideas floor: ideas sourced at the back, scored across six signals by the engineering pod, written up as dossiers by the design pod, then ranked and published along a line",
  activity: [
    { label: "Six signals scored — demand to open field", role: "dev", meta: "engine" },
    { label: "Dossier written — first move on Monday", role: "design", meta: "brief" },
    { label: "Percentile curves recalibrated", role: "exec", meta: "tiers" },
    { label: "S-tier promoted to the front page", role: "qa", meta: "rank" },
    { label: "Verticals refreshed with market context", role: "exec", meta: "market" },
    { label: "New wedge added to the generator", role: "dev", meta: "corpus" },
  ],
};

/** AltF Detour: the useless-web floor. */
export const DETOUR_SCENE = {
  id: "detour",
  signage: "DETOUR",
  accent: [
    "var(--fl-scene-danger)",
    "var(--fl-scene-info)",
    "var(--fl-scene-accent)",
    "var(--fl-scene-success)",
    "var(--fl-scene-warning)",
  ],
  zones: { hr: "Standup", exec: "Scouting", dev: "Crawling", design: "Curation", qa: "Playtest" },
  alt: "the AltF Detour floor: sites scouted at the back, crawled and checked by the engineering pod, sorted into categories by the design pod, then playtested and released along a line",
  activity: [
    { label: "Links checked for availability", role: "dev", meta: "crawl" },
    { label: "Categories re-sorted", role: "design", meta: "taxonomy" },
    { label: "Interactive toys tested", role: "qa", meta: "labs" },
    { label: "Dead link pulled from Weird Web", role: "dev", meta: "-1" },
    { label: "New rabbit hole scouted", role: "exec", meta: "queue" },
    { label: "Time-to-joy re-measured", role: "qa", meta: "ranking" },
  ],
};

/** AltF Backlinks: the outreach floor. */
export const BACKLINKS_SCENE = {
  id: "backlinks",
  signage: "LINKS",
  accent: [
    "var(--fl-scene-warning)",
    "var(--fl-scene-info)",
    "var(--fl-scene-accent)",
    "var(--fl-scene-success)",
    "var(--fl-scene-primary)",
  ],
  zones: { hr: "Review", exec: "Sourcing", dev: "Vetting", design: "Outreach", qa: "Tracking" },
  alt: "the AltF Backlinks floor: opportunities sourced at the back, vetted for cost and effort by the engineering pod, written up for outreach by the design pod, then tracked to placement along a line",
  activity: [
    { label: "Opportunities imported from the sheet", role: "exec", meta: "sheet" },
    { label: "Groups normalised and reviewed", role: "dev", meta: "clean" },
    { label: "Free-with-profile tier re-scored", role: "qa", meta: "cost" },
    { label: "Submission guide written", role: "design", meta: "howto" },
    { label: "Placement confirmed — do-follow", role: "qa", meta: "live" },
    { label: "New directory added to the queue", role: "exec", meta: "+1" },
  ],
};

export const SCENES = {
  office: OFFICE_SCENE,
  ideas: IDEAS_SCENE,
  detour: DETOUR_SCENE,
  backlinks: BACKLINKS_SCENE,
};
