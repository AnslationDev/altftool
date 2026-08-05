import {
  createBreadcrumbJsonLd,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import { findPrank } from "./data/pranxData";

const prankSeo = {
  hacker: {
    title: "Hacker Typer — Fake Hacking Screen",
    description:
      "Mash any keys to spill dramatic fake terminal code, access logs, and breach warnings, with a full-screen look that runs entirely in your browser.",
    keywords: [
      "hacker typer",
      "fake hacking screen",
      "fake code typer",
      "hacking simulator online",
      "geek typer prank",
      "fake terminal generator",
    ],
  },
  "matrix-code-rain": {
    title: "Matrix Code Rain Screensaver",
    description:
      "Green digital rain falling down your screen, with sliders for speed, density, and glow plus a fullscreen mode for parties, streams, or desk pranks.",
    keywords: [
      "matrix code rain",
      "matrix screensaver online",
      "digital rain effect",
      "green code falling animation",
      "matrix rain fullscreen",
      "matrix terminal effect",
    ],
  },
  bsod: {
    title: "Blue Screen of Death Simulator",
    description:
      "A safe, harmless copy of the Windows crash screen with a fake stop code, moving progress counter, restart controls, and one-click fullscreen.",
    keywords: [
      "blue screen of death simulator",
      "fake bsod",
      "windows crash screen prank",
      "bsod generator",
      "fake error screen",
      "computer crash prank",
    ],
  },
  pipes: {
    title: "3D Pipes Screensaver — Retro Classic",
    description:
      "The classic pipe screensaver rebuilt on canvas, with colour controls and endless plumbing that snakes across your monitor while you step away.",
    keywords: [
      "3d pipes screensaver",
      "windows pipes screensaver online",
      "retro screensaver browser",
      "pipes animation",
      "classic screensaver simulator",
    ],
  },
  "dvd-bounce": {
    title: "Bouncing DVD Logo Screensaver",
    description:
      "Watch the logo drift and change colour on every wall hit, with trail mode, speed control, and fullscreen so everyone can wait for the corner.",
    keywords: [
      "bouncing dvd logo",
      "dvd screensaver online",
      "dvd logo corner hit",
      "dvd bounce simulator",
      "retro dvd screen animation",
    ],
  },
  "fake-virus": {
    title: "Fake Virus Scanner Prank",
    description:
      "A harmless scan that invents infected files, quarantine alerts, and panic messages. Nothing is downloaded, changed, or removed on the real machine.",
    keywords: [
      "fake virus scanner",
      "virus prank website",
      "fake malware alert",
      "hacked screen prank",
      "fake antivirus scan",
      "harmless computer prank",
    ],
  },
  "fbi-warning": {
    title: "FBI Warning Screen — Fullscreen Prank",
    description:
      "A cinematic seizure notice with pulsing seal, scan lines, and fullscreen launch, ready to freeze a friend's laptop for a few seconds of panic.",
    keywords: [
      "fbi warning screen",
      "fbi lock screen prank",
      "fake fbi seizure notice",
      "police warning screen generator",
      "scary screen prank",
    ],
  },
  "google-terminal": {
    title: "Google Terminal — Retro DOS Screen",
    description:
      "A retro DOS-styled take on the search page, with a boot sequence, blinking query prompt, text ad panel, and keyboard-style footer shortcuts.",
    keywords: [
      "google terminal",
      "google in 1998 dos",
      "retro search engine screen",
      "text mode google simulator",
      "dos style search prompt",
    ],
  },
  "fake-dos": {
    title: "Fake DOS Terminal — Command Prompt",
    description:
      "Type into a working DOS-style prompt and watch joke output, directory listings, and fake system messages scroll by in green text on black.",
    keywords: [
      "fake dos terminal",
      "ms dos simulator online",
      "fake command prompt",
      "cmd prank generator",
      "retro terminal emulator browser",
    ],
  },
  bios: {
    title: "BIOS Simulator — Fake Setup Screen",
    description:
      "Move through boot order, system time, and hardware panels with the keyboard in a faithful setup screen that never touches your real firmware.",
    keywords: [
      "bios simulator",
      "fake bios screen",
      "cmos setup simulator",
      "bios setup utility online",
      "retro pc boot screen",
    ],
  },
  "norton-commander": {
    title: "Norton Commander — Retro File Manager",
    description:
      "The dual-pane DOS-era file manager with keyboard navigation, side-by-side panels, and a command line, rebuilt to run inside a browser tab.",
    keywords: [
      "norton commander online",
      "dos file manager simulator",
      "retro dual pane file manager",
      "norton commander emulator",
      "blue dos interface",
    ],
  },
  winxp: {
    title: "Windows XP Simulator — Retro Desktop",
    description:
      "A tiny nostalgic desktop playground with a start menu, draggable windows, and period-correct chrome, running in the browser with nothing to install.",
    keywords: [
      "windows xp simulator",
      "xp desktop online",
      "retro windows emulator browser",
      "old windows desktop simulator",
      "nostalgic pc interface",
    ],
  },
  "jurassic-park": {
    title: "Jurassic Park Control Room Screen",
    description:
      "A movie-style park security board with fence alerts, vehicle tracking, console links, and dramatic sound cues straight from the control room.",
    keywords: [
      "jurassic park control room",
      "jurassic park security system",
      "park fence status screen",
      "movie computer simulator",
      "jurassic park interface",
    ],
  },
  "jurassic-park/console": {
    title: "Jurassic Park Console — Retro Terminal",
    description:
      "A noisy retro control console with cluttered desktop, command prompt, access logs, and fullscreen mode for the full nineties computer-room look.",
    keywords: [
      "jurassic park console",
      "jurassic park terminal",
      "unix system this is simulator",
      "retro movie console screen",
      "90s computer terminal prank",
    ],
  },
  "fake-update": {
    title: "Fake Update Screens — Win, Mac, Android",
    description:
      "Windows, macOS, Android, and generic install screens in one place, each with adjustable progress so the update never quite reaches the finish.",
    keywords: [
      "fake update screen",
      "fake system update prank",
      "android update prank",
      "fake installing updates",
      "update screen generator",
    ],
  },
  "windows-update": {
    title: "Fake Windows Update Screen",
    description:
      "Configuring updates at 12 percent, then 13, then never. Set your own progress, go fullscreen, and let someone wait patiently for a reboot.",
    keywords: [
      "fake windows update",
      "windows update prank screen",
      "configuring updates prank",
      "fake windows 10 update",
      "pc update prank",
    ],
  },
  "mac-update": {
    title: "Fake macOS Update Screen",
    description:
      "A clean Apple-style installer with a smooth progress bar and fullscreen mode, ideal for borrowing a colleague's laptop for a minute or two.",
    keywords: [
      "fake macos update",
      "mac update prank screen",
      "apple installer prank",
      "macbook update screen fake",
      "mac software update simulator",
    ],
  },
  minesweeper: {
    title: "Minesweeper — Play Free Online",
    description:
      "Flag the mines, clear the safe squares, and race the timer in a complete browser version with a reset button and proper win or loss states.",
    keywords: [
      "minesweeper online",
      "play minesweeper free",
      "classic minesweeper browser game",
      "minesweeper no download",
      "windows minesweeper clone",
    ],
  },
  tetris: {
    title: "Tetris Blocks — Free Browser Game",
    description:
      "Rotate and drop falling blocks with the keyboard, clear lines for points, climb through levels, and pause whenever you like. No download needed.",
    keywords: [
      "tetris online free",
      "falling blocks game browser",
      "play tetris no download",
      "keyboard block puzzle game",
      "classic tetris clone",
    ],
  },
  maze: {
    title: "Maze Runner — Free Maze Game",
    description:
      "Generate a fresh layout and steer to the exit with arrow keys or on-screen buttons. Every run is different, and it plays fine on a phone.",
    keywords: [
      "maze game online",
      "random maze generator game",
      "play maze free browser",
      "arrow key maze puzzle",
      "mobile maze game",
    ],
  },
  soundboard: {
    title: "Prank Soundboard — Funny Sound Buttons",
    description:
      "Alarms, beeps, sweeps, and glitch noises built with Web Audio, so every button fires instantly with no files to download and no clips to load.",
    keywords: [
      "prank soundboard",
      "funny sound buttons online",
      "annoying sounds board",
      "alarm sound prank",
      "browser soundboard free",
    ],
  },
  "chat-screenshot-generator": {
    title: "Chat Screenshot Generator — Fake Chats",
    description:
      "Build clearly fictional message threads and export them as a PNG. Everything renders locally in the browser, with no uploads and no external assets.",
    keywords: [
      "chat screenshot generator",
      "fake chat maker",
      "fake text message generator",
      "chat mockup creator",
      "fake conversation screenshot",
    ],
  },
  "static-tv": {
    title: "Static TV Noise — Dead Channel Screen",
    description:
      "Analogue snow rendered live on canvas, with noise intensity, scan lines, and colour bars for a lost-signal look on any monitor or projector.",
    keywords: [
      "tv static noise screen",
      "white noise screen online",
      "dead channel effect",
      "analog tv static generator",
      "scan line screen effect",
    ],
  },
  trollface: {
    title: "TrollFace Eyes — Cursor Follow Prank",
    description:
      "The meme face stares out of the screen and its eyes track your cursor wherever it moves. Point it at someone and wait for them to notice.",
    keywords: [
      "trollface prank",
      "eyes follow cursor",
      "meme face website",
      "cursor tracking prank page",
      "funny face screen prank",
    ],
  },
};

/**
 * Page-level entity for one Pranx experience.
 *
 * These pages shipped only the root layout's Organization and WebSite nodes, so
 * nothing in the markup described the thing the page actually is. Every field
 * below is read from pranxData — `name`, `description` and `category` are the
 * prank's own values, and those descriptions already say "fake", "safe" and
 * "simulator", so the entity repeats the page's own framing instead of dressing
 * a prank screen up as something real.
 *
 * createToolJsonLd resolves the type from that same category: the three entries
 * filed under "Game" (minesweeper, tetris, maze) are genuinely playable browser
 * games and become VideoGame/WebApplication — matching /altfgame — while the
 * simulators, screensavers and screenshot makers stay SoftwareApplication/
 * WebApplication, the entity the rest of this codebase already uses for its
 * browser-run tools. No rating, review, play count or publication date is
 * emitted, because no such data exists for these pages.
 */
export function getPrankJsonLd(slug) {
  const prank = findPrank(slug);
  if (!prank) return null;

  // Alias slugs (/pranx/hacker-typer) resolve to the canonical prank and
  // getPrankMetadataArgs canonicalises the URL, so the entity @id and the
  // breadcrumb point at the canonical path too.
  const path = `/pranx/${prank.slug}`;
  const parentSlug = prank.slug.includes("/") ? prank.slug.split("/")[0] : "";
  const parent = parentSlug ? findPrank(parentSlug) : null;

  return [
    createToolJsonLd({
      slug: prank.slug,
      path,
      tool: {
        name: prank.title,
        description: prank.description,
        category: prank.category,
      },
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Pranx Studio", path: "/pranx" },
      ...(parent ? [{ name: parent.title, path: `/pranx/${parent.slug}` }] : []),
      { name: prank.title, path },
    ]),
  ];
}

export function getPrankMetadataArgs(slug, path) {
  const prank = findPrank(slug);

  if (!prank) {
    // Callers pass these arguments through createPageMetadata(). Returning
    // resolved metadata here would wrap the result a second time and lose the
    // path/noindex inputs that the generator expects.
    return {
      title: "Prank Not Found",
      description:
        "This Pranx page is not available. Browse the full library of browser prank simulators, screensavers, fake terminals, and mini games instead.",
      path,
      noindex: true,
    };
  }

  const seo = prankSeo[prank.slug];

  return {
    title: seo?.title || `${prank.title} — Pranx Studio`,
    description: seo?.description || prank.description,
    keywords: seo?.keywords || [
      prank.title.toLowerCase(),
      `${prank.title.toLowerCase()} online`,
      `${prank.category.toLowerCase()} prank`,
      "browser prank",
    ],
    path: `/pranx/${prank.slug}`,
  };
}
