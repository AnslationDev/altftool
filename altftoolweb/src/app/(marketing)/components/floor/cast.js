/*
 * AltF Floor — who is on the floor and what they are doing.
 *
 * Kept as data rather than markup so the scene is one small render loop instead
 * of two hundred hand-placed divs, and so the cast can later be driven by a real
 * feed without touching a single element.
 *
 * PLAN SPACE
 * Coordinates are percentages in the room's own 0-100 space, read as a floor
 * plan: x runs left to right, y runs back (the wall, y=0) to front (the
 * conveyor, y=100). A node's coordinate is where its feet are, so a figure at
 * y=50 stands exactly on the halfway line.
 *
 * The room is WIDE AND SHALLOW on purpose. The stage is 16/9, so its depth axis
 * is short: four rows front-to-back foreshorten into a pile, and the front row
 * falls off the bottom edge. Laying the teams out left-to-right across the width
 * is what a widescreen frame is actually good at.
 *
 * This only works because the room is kept near front-on. At a 45-degree
 * isometric turn these numbers would land diagonally and none of the layout
 * below would mean what it says.
 */

/* Skin and hair tones vary across the cast on purpose. A floor where everyone is
   the same colour looks like a template; these are drawn from a small spread so
   the room looks like a room. */
const SKIN = Array.from(
  { length: 6 },
  (_, index) => `var(--fl-skin-${index + 1})`,
);
const HAIR = Array.from(
  { length: 5 },
  (_, index) => `var(--fl-hair-${index + 1})`,
);

const skin = (i) => SKIN[i % SKIN.length];
const hair = (i) => HAIR[i % HAIR.length];

/**
 * The cast.
 *
 * `long` selects the long-hair silhouette. The brief specified the makeup of
 * each team — founder male, one manager of each, HR women, graphics women, the
 * engineering and release pods mixed — so that is encoded here rather than
 * randomised, because it was an explicit request rather than a detail.
 *
 * `seated` gives the person a desk directly in front of them. HR is the only one
 * without: she walks.
 */
export const PEOPLE = [
  // ---- back of the room: the meeting room and the founder's cabin ----
  { id: "meet-1", role: "hr", x: 8, y: 20, long: false, delay: 1.9 },
  { id: "meet-2", role: "exec", x: 17, y: 20, long: true, delay: 0.3 },
  { id: "boss", role: "exec", x: 34, y: 18, long: false, label: "Founder", delay: 0, seated: true },

  // ---- managers: one man, one woman, between the founder and the floor ----
  { id: "mgr-eng", role: "dev", x: 34, y: 48, long: false, label: "Eng manager", delay: 0.4, seated: true },
  { id: "mgr-design", role: "design", x: 66, y: 48, long: true, label: "Design manager", delay: 0.8, seated: true },

  // ---- engineering pod: mixed, front left ----
  { id: "dev-1", role: "dev", x: 9, y: 60, long: false, delay: 0.2, seated: true },
  { id: "dev-2", role: "dev", x: 21, y: 60, long: true, delay: 1.1, seated: true },
  { id: "dev-3", role: "dev", x: 14, y: 71, long: true, delay: 0.7, seated: true },
  { id: "dev-4", role: "dev", x: 27, y: 71, long: false, delay: 1.5, seated: true },

  // ---- graphics pod: women, per the brief. Front right ----
  { id: "gfx-1", role: "design", x: 79, y: 60, long: true, delay: 0.5, seated: true },
  { id: "gfx-2", role: "design", x: 91, y: 60, long: true, delay: 1.3, seated: true },
  { id: "gfx-3", role: "design", x: 85, y: 71, long: true, delay: 0.9, seated: true },

  // ---- release / QA: mixed, front centre, nearest the conveyor ----
  { id: "qa-1", role: "qa", x: 46, y: 62, long: false, delay: 0.6, seated: true },
  { id: "qa-2", role: "qa", x: 57, y: 71, long: true, delay: 1.7, seated: true },

  // ---- HR: walks the floor rather than sitting at it ----
  { id: "hr-1", role: "hr", x: 48, y: 54, long: true, label: "HR", walker: true, delay: 0 },
].map((p, i) => ({ ...p, skin: skin(i), hair: hair(i) }));

/**
 * Desks are derived, not hand-placed.
 *
 * Listing them separately meant a desk could drift away from the person meant to
 * be sitting at it, or outlive them. Deriving guarantees one desk per seated
 * figure, always seven units in front — which is exactly where a desk is.
 */
export const DESKS = PEOPLE.filter((p) => p.seated).map((p) => ({
  id: `desk-${p.id}`,
  x: p.x,
  y: p.y + 7,
  role: p.role,
  delay: Number(((p.delay * 1.7) % 3.2).toFixed(2)),
}));

/**
 * Chairs are derived like desks: one behind every seated figure.
 *
 * Three units back rather than seven forward, so the person sits between the
 * chair and their desk — which is the arrangement that reads as "sitting" from
 * this camera.
 */
export const CHAIRS = PEOPLE.filter((p) => p.seated).map((p) => ({
  id: `chair-${p.id}`,
  x: p.x,
  y: p.y - 3,
  role: p.role,
}));

/**
 * Props: the things that make a floor a workplace rather than a diagram.
 *
 * Placed in the gaps between pods — the walkways and corners that were reading
 * as empty grid. Deliberately sparse: past a certain density this stops being
 * atmosphere and starts being clutter the eye has to work through.
 */
export const PROPS = [
  { id: "p-plant-1", kind: "plant", x: 8, y: 38, delay: 0 },
  { id: "p-plant-2", kind: "plant", x: 92, y: 38, delay: 2.1 },
  { id: "p-plant-3", kind: "plant", x: 62, y: 24, delay: 4.2 },
  { id: "p-plant-4", kind: "plant", x: 38, y: 80, delay: 1.3 },
  { id: "p-cooler", kind: "cooler", x: 8, y: 82, delay: 0 },
];

/**
 * Everything that casts a shadow on the floor, and how big that shadow is.
 *
 * Derived rather than authored so a shadow cannot outlive or drift from the
 * thing casting it — the same reason desks and chairs are derived.
 */
export const CASTS = [
  ...PEOPLE.map((p) => ({ id: `sh-${p.id}`, x: p.x, y: p.y, w: 3.6, h: 2 })),
  ...DESKS.map((d) => ({ id: `sh-${d.id}`, x: d.x, y: d.y, w: 8.5, h: 5 })),
];

/**
 * Cabins — a room per team, plus a meeting room.
 *
 * `walls` says which edges get a partition. Only the edges that read as a corner
 * from this camera are given one: a wall on the front edge would stand between
 * the viewer and the people inside it, which is exactly what you do not want in
 * a scene whose whole job is showing the people working.
 */
export const ZONES = [
  {
    id: "z-meet", x: 12, y: 22, w: 20, h: 22, role: "hr", label: "Meeting",
    dur: 13, delay: 3.1, tagX: 13, tagY: 36, walls: ["back", "right"], table: true,
  },
  {
    id: "z-exec", x: 34, y: 20, w: 18, h: 18, role: "exec", label: "Exec",
    dur: 11, delay: 0, tagX: 36, tagY: 34, walls: ["back", "left", "right"],
  },
  {
    id: "z-dev", x: 18, y: 64, w: 30, h: 24, role: "dev", label: "Engineering",
    dur: 8, delay: 1.4, tagX: 12, tagY: 60, walls: ["left"],
  },
  {
    id: "z-qa", x: 51, y: 64, w: 22, h: 22, role: "qa", label: "Release",
    dur: 6.5, delay: 2.2, tagX: 51, tagY: 56, walls: [],
  },
  {
    id: "z-design", x: 85, y: 64, w: 28, h: 24, role: "design", label: "Design",
    dur: 9.5, delay: 0.6, tagX: 90, tagY: 60, walls: ["right"],
  },
];

/**
 * Work handed down the floor: founder to managers, managers to their teams,
 * teams to release. This is the part of the scene that carries the brief's
 * actual story rather than its atmosphere.
 *
 * dx/dy are in `cqw` — hundredths of the stage's width — not plan percentages.
 * A token animates in the counter-rotated upright space, where a percentage
 * would refer to the token's own tiny box; and they cannot be fixed pixels
 * either, because the room scales with its container while pixels do not. At
 * hero size a pixel path looked right and in the expanded view the same token
 * stopped a third of the way to its manager.
 */
export const TOKENS = [
  // founder -> engineering manager
  { id: "t1", from: { x: 34, y: 18 }, dx: -7, dy: 6, role: "exec", dur: 5.5, delay: 0 },
  // founder -> design manager
  { id: "t2", from: { x: 34, y: 18 }, dx: 21, dy: 6, role: "exec", dur: 5.5, delay: 2.6 },
  // engineering manager -> the pod
  { id: "t3", from: { x: 34, y: 48 }, dx: -6, dy: 6.5, role: "dev", dur: 4.8, delay: 1.4 },
  { id: "t4", from: { x: 34, y: 48 }, dx: 1, dy: 9, role: "dev", dur: 4.8, delay: 4.1 },
  // design manager -> the pod
  { id: "t5", from: { x: 66, y: 48 }, dx: 6, dy: 6.5, role: "design", dur: 5.1, delay: 2.2 },
  { id: "t6", from: { x: 66, y: 48 }, dx: 1, dy: 9, role: "design", dur: 5.1, delay: 5.0 },
  // both teams -> release
  { id: "t7", from: { x: 18, y: 70 }, dx: 12, dy: 1.5, role: "dev", dur: 4.4, delay: 3.2 },
  { id: "t8", from: { x: 85, y: 70 }, dx: -12, dy: 1.5, role: "design", dur: 4.4, delay: 6.0 },
];

/**
 * Rows on the wall's planning board. Different fills and offsets so it reads as
 * a board mid-sprint rather than a chart.
 */
export const BOARD = [
  { id: "b1", role: "exec", fill: 0.92, delay: 0 },
  { id: "b2", role: "dev", fill: 0.68, delay: 1.1 },
  { id: "b3", role: "design", fill: 0.45, delay: 2.3 },
  { id: "b4", role: "qa", fill: 0.78, delay: 3.4 },
];

/** Windows on the back wall, with staggered light drift. */
export const WINDOWS = [
  { id: "w1", left: 47, width: 9, delay: 0 },
  { id: "w2", left: 58, width: 9, delay: 1.5 },
  { id: "w3", left: 69, width: 9, delay: 3.0 },
  { id: "w4", left: 80, width: 9, delay: 4.5 },
];

const CRATE_CYCLE = 13;
const CRATE_COUNT = 7;

/**
 * Crates on the output conveyor.
 *
 * They carry no text on purpose. Labelled pills overlap at any spacing that
 * keeps the belt looking busy, and a label sliding past at speed is not
 * something anyone reads. The words live in ACTIVITY below, where they hold
 * still. The belt's job here is purely the feeling of continuous output.
 */
export const PRODUCTS = Array.from({ length: CRATE_COUNT }, (_, i) => ({
  id: `crate-${i}`,
  role: ["dev", "design", "qa", "exec", "design", "dev", "qa"][i],
  dur: CRATE_CYCLE,
  delay: Number(((i * CRATE_CYCLE) / CRATE_COUNT).toFixed(2)),
}));

/** How long one full pass of the activity feed takes. */
export const ACTIVITY_CYCLE = 18;

/**
 * Roles map onto the stylesheet's five accent slots rather than onto colours.
 *
 * A scene supplies the colours for those slots, so the same room, the same cast
 * and the same conveyor render in AltF Ideas' palette or Detour's without a
 * second copy of any of it. Which is also the honest story: it is one team
 * building all of these.
 */
export const ROLE_VAR = {
  exec: "--fl-a1",
  dev: "--fl-a2",
  design: "--fl-a3",
  hr: "--fl-a4",
  qa: "--fl-a5",
};

/**
 * Everything that stands on the floor, sorted back to front.
 *
 * Inside a preserve-3d parent the counter-rotated nodes are coplanar, so the
 * browser paints them in DOM order rather than by depth. Sorting here is what
 * stops a figure at the back of the room being drawn over a desk at the front.
 */
export const SCENE = [
  ...CHAIRS.map((c) => ({ kind: "chair", y: c.y, item: c })),
  ...PROPS.map((p) => ({ kind: p.kind, y: p.y, item: p })),
  ...DESKS.map((d) => ({ kind: "desk", y: d.y, item: d })),
  ...PEOPLE.map((p) => ({ kind: "person", y: p.y, item: p })),
  ...TOKENS.map((t) => ({ kind: "token", y: t.from.y + 0.5, item: t })),
].sort((a, b) => a.y - b.y);
