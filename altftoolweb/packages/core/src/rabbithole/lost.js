/**
 * AltF Rabbithole — sites we lost.
 *
 * Entries that were considered for the directory and rejected because they no
 * longer work, plus anything that has fallen out of the catalog since.
 *
 * This is a published page, so every claim here has to be verified rather than
 * assumed. A site that merely refuses a command-line client is NOT dead —
 * Cloudflare and friends return 403 to a lot of perfectly healthy sites — so an
 * entry only lands here on unambiguous evidence:
 *
 *   dead    — DNS does not resolve at all
 *   parked  — resolves, but redirects to an unrelated domain
 *   moved   — the thing itself relocated; `successor` says where
 *   broken  — loads, but the part that made it worth visiting does not
 *
 * Deliberately NOT listed: candidates that only failed with a TLS error, a
 * connection timeout or a 403. Those all reproduce against sites that are
 * demonstrably alive in a browser, so they are evidence about the network
 * rather than about the site. Four sites an earlier sweep reported as dead —
 * Solar System Scope, Musicmap, Poorly Drawn Lines and Regex Crossword — turned
 * out to be fine on re-check, which is exactly why that bar exists.
 */

export const LOST_STATUSES = Object.freeze([
  {
    id: "dead",
    label: "Gone",
    note: "The domain no longer resolves. Nothing is left to visit.",
  },
  {
    id: "parked",
    label: "Taken over",
    note: "Still online, but somebody else owns it now and it is not what it was.",
  },
  {
    id: "moved",
    label: "Retired",
    note: "Shut down deliberately by the people who made it.",
  },
  {
    id: "broken",
    label: "Broken",
    note: "The page still loads, but the part that made it worth visiting does not.",
  },
]);

export const LOST_STATUS_IDS = Object.freeze(
  LOST_STATUSES.map((status) => status.id),
);

/**
 * `successor.url` may be an internal path (a live entry in our own catalog) or
 * an external URL. The page renders the two differently.
 */
const lost = [
  {
    name: "The NOOOO! Button",
    domain: "nooooooooooooooo.com",
    status: "dead",
    note: "One button, one Darth Vader scream, one domain with a comical number of Os in it. It was the canonical example of a website that does exactly one thing, and it was on every list of pointless sites for the better part of a decade.",
    successor: null,
    archive: "https://web.archive.org/web/2019/http://nooooooooooooooo.com/",
    diedAround: null,
  },
  {
    name: "Error Message Generator",
    domain: "atom.smasher.org",
    status: "dead",
    note: "Let you build a convincing fake Windows dialog box, complete with the right icon and button set, then save it as an image. A staple of office pranks and of anyone who needed a screenshot of an error that did not exist.",
    successor: { name: "Maker Studio", url: "/fodey-new" },
    archive: "https://web.archive.org/web/2020/https://atom.smasher.org/error/",
    diedAround: null,
  },
  {
    name: "Museum of Endangered Sounds",
    domain: "museumofendangeredsounds.com",
    status: "dead",
    note: "A room of clickable objects that played sounds technology has since retired: dial-up handshake, Nokia ringtone, the whirr of a floppy drive, a Tamagotchi. Brendan Chilcutt built it in 2012 as an argument that sound design deserves preservation too.",
    successor: {
      name: "Save the Sounds",
      url: "https://www.savethesounds.info/",
    },
    archive:
      "https://web.archive.org/web/2020/http://savethesounds.info/",
    diedAround: null,
  },
  {
    name: "Angelfire",
    domain: "angelfire.lycos.com",
    status: "dead",
    note: "One of the two great free-hosting services of the personal-homepage era, alongside GeoCities. Millions of hand-written pages with tiled backgrounds and under-construction GIFs lived here, and the whole estate is now only reachable through archives.",
    successor: { name: "Neocities", url: "https://neocities.org/" },
    archive: "https://web.archive.org/web/2015/http://www.angelfire.lycos.com/",
    diedAround: null,
  },
  {
    name: "Raining.fm",
    domain: "raining.fm",
    status: "dead",
    note: "Rain, thunder and a fireplace on independent sliders, years before that became a genre of app. It was the reference point most later ambient mixers were measured against.",
    successor: { name: "A Soft Murmur", url: "/rabbithole/site/a-soft-murmur" },
    archive: "https://web.archive.org/web/2021/https://raining.fm/",
    diedAround: null,
  },
  {
    name: "Segment Anything demo",
    domain: "segment-anything.com",
    status: "dead",
    note: "Meta's browser demo for its image-segmentation model. You uploaded a photo, clicked any object, and it cut that object out cleanly — one of the clearest hands-on explanations of what a vision model actually does.",
    successor: null,
    archive: "https://web.archive.org/web/2024/https://segment-anything.com/",
    diedAround: null,
  },
  {
    name: "Scribble Diffusion",
    domain: "scribblediffusion.com",
    status: "parked",
    note: "Turned a rough mouse sketch into a finished image while you watched, and was the easiest way to show somebody what image models did without an account or a prompt-writing lesson. The domain now redirects to an unrelated site that has nothing to do with it.",
    successor: null,
    archive: "https://web.archive.org/web/2023/https://scribblediffusion.com/",
    diedAround: null,
  },
  {
    name: "OMG Space",
    domain: "omgspc.com",
    status: "parked",
    note: "A to-scale scroll through the solar system that put the real distances in, so most of the page was deliberately empty. The domain now belongs to a printing company.",
    successor: {
      name: "If the Moon Were Only 1 Pixel",
      url: "/rabbithole/site/if-the-moon-were-only-one-pixel",
    },
    archive: "https://web.archive.org/web/2019/http://www.omgspc.com/",
    diedAround: null,
  },
  {
    name: "Google Music Timeline",
    // Path-qualified on purpose: research.google.com is still very much alive
    // and Semantris is listed from it. Only this sub-path died.
    domain: "research.google.com/bigpicture/music",
    status: "moved",
    note: "A stacked area chart of what the world listened to from 1950 onwards, built from Google Play Music libraries, where you could click into any genre and watch it swell and collapse. Google retired the visualisation along with the service it was built on.",
    successor: {
      name: "Every Noise at Once",
      url: "/rabbithole/site/every-noise-at-once",
    },
    archive:
      "https://web.archive.org/web/2019/https://research.google.com/bigpicture/music/",
    diedAround: null,
  },
  {
    name: "Forgotify",
    domain: "forgotify.com",
    status: "broken",
    note: "Served a track at random from the millions on Spotify with a play count of exactly zero, giving a recording its first ever listen. The page still loads, but its Spotify credentials are no longer configured, so the player returns a setup error instead of music.",
    successor: {
      name: "Every Noise at Once",
      url: "/rabbithole/site/every-noise-at-once",
    },
    archive: "https://web.archive.org/web/2020/http://forgotify.com/",
    diedAround: null,
  },
];

export default lost;

export function getLostByStatus(statusId) {
  return lost.filter((entry) => entry.status === statusId);
}

export function countLostByStatus() {
  const counts = Object.fromEntries(LOST_STATUS_IDS.map((id) => [id, 0]));
  for (const entry of lost) counts[entry.status] += 1;
  return counts;
}
