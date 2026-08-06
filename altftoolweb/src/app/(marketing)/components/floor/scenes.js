/*
 * Scenes — what the floor is building right now.
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
 * `accent` is the five slots the stylesheet reads (--fl-a1..--fl-a5), in the
 * order exec, engineering, design, HR, release. Pick colours that survive both
 * themes: these render on a near-black floor in dark mode and a near-white one
 * in light, so mid-tone hues work and pastels disappear.
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
  accent: ["#f59e0b", "#38bdf8", "#e879f9", "#34d399", "#a78bfa"],
  zones: { hr: "Meeting", exec: "Exec", dev: "Engineering", design: "Design", qa: "Release" },
  alt: "the AltFTool team at work: a founder handing tasks to an engineering manager and a design manager, engineering, design and release pods building tools at their desks, an HR lead moving between them, and finished tools travelling out along a line",
  activity: [
    { label: "Regex Tester — shipped to /tools", role: "dev", meta: "build" },
    { label: "Palette generator — new UI approved", role: "design", meta: "design" },
    { label: "Backlinks — 661 sites indexed", role: "qa", meta: "+12" },
    { label: "AltF Ideas — 117,406 ideas scored", role: "exec", meta: "corpus" },
    { label: "Detour — 1,314 links verified", role: "qa", meta: "crawl" },
    { label: "PDF Merge — landing page built", role: "design", meta: "live" },
  ],
};

/** AltF Ideas: the corpus floor. */
export const IDEAS_SCENE = {
  id: "ideas",
  signage: "IDEAS",
  accent: ["#f97316", "#22d3ee", "#c084fc", "#4ade80", "#facc15"],
  zones: { hr: "Review", exec: "Sourcing", dev: "Scoring", design: "Dossiers", qa: "Ranking" },
  alt: "the AltF Ideas floor: ideas sourced at the back, scored across six signals by the engineering pod, written up as dossiers by the design pod, then ranked and published along a line",
  activity: [
    { label: "Six signals scored — demand to open field", role: "dev", meta: "engine" },
    { label: "Dossier written — first move on Monday", role: "design", meta: "brief" },
    { label: "Percentile curves recalibrated", role: "exec", meta: "tiers" },
    { label: "S-tier promoted to the front page", role: "qa", meta: "rank" },
    { label: "61 verticals refreshed with market size", role: "exec", meta: "market" },
    { label: "New wedge added to the generator", role: "dev", meta: "corpus" },
  ],
};

/** AltF Detour: the useless-web floor. */
export const DETOUR_SCENE = {
  id: "detour",
  signage: "DETOUR",
  accent: ["#fb7185", "#38bdf8", "#f472b6", "#4ade80", "#fbbf24"],
  zones: { hr: "Standup", exec: "Scouting", dev: "Crawling", design: "Curation", qa: "Playtest" },
  alt: "the AltF Detour floor: sites scouted at the back, crawled and checked by the engineering pod, sorted into categories by the design pod, then playtested and released along a line",
  activity: [
    { label: "1,314 links checked — all still live", role: "dev", meta: "crawl" },
    { label: "91 categories re-sorted", role: "design", meta: "taxonomy" },
    { label: "8 toys built in-house", role: "qa", meta: "labs" },
    { label: "Dead link pulled from Weird Web", role: "dev", meta: "-1" },
    { label: "New rabbit hole scouted", role: "exec", meta: "queue" },
    { label: "Time-to-joy re-measured", role: "qa", meta: "ranking" },
  ],
};

/** AltF Backlinks: the outreach floor. */
export const BACKLINKS_SCENE = {
  id: "backlinks",
  signage: "LINKS",
  accent: ["#f59e0b", "#60a5fa", "#a78bfa", "#34d399", "#f472b6"],
  zones: { hr: "Review", exec: "Sourcing", dev: "Vetting", design: "Outreach", qa: "Tracking" },
  alt: "the AltF Backlinks floor: opportunities sourced at the back, vetted for cost and effort by the engineering pod, written up for outreach by the design pod, then tracked to placement along a line",
  activity: [
    { label: "661 opportunities imported from the sheet", role: "exec", meta: "sheet" },
    { label: "14 groups normalised — 1.2% unsorted", role: "dev", meta: "clean" },
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
