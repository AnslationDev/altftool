/**
 * AltF Detour — taxonomy.
 *
 * Detour is a directory of the internet worth taking a wrong turn for, plus a
 * button that picks one at random. Everything a page can filter, sort or group
 * by is declared here so the data files stay dumb arrays and the validator has
 * a single source of truth to check against.
 *
 * Shape of the system:
 *   FAMILY    8 super-groups, used for navigation and the browse rail.
 *   CATEGORY  86 topic pages. The primary SEO surface — one landing page each.
 *   VIBE      cross-cutting mood tags. A site carries up to three.
 *   TIME_BAND how long before it pays off. The primary sort on browse.
 *   COLLECTION editorial cross-sections, computed from a rule at build time.
 *
 * Category count is deliberate: the reference directories in this space top out
 * around 68 topics, and topic pages are how a directory earns long-tail search.
 * Splitting "brain games" into word games, trivia and logic puzzles is both
 * better for a visitor who knows what they want and three pages instead of one.
 */

export const BRAND = Object.freeze({
  name: "AltF Detour",
  shortName: "Detour",
  href: "/detour",
  tagline: "The internet's scenic route.",
  promise:
    "A hand-sorted directory of websites worth taking a wrong turn for — strange, beautiful, useful or quietly brilliant — plus a button that picks one for you.",
  // Used in JSON-LD and the about page. Kept here so copy never drifts.
  elevator:
    "AltF Detour catalogues the parts of the web that are still made by people rather than by engagement targets, and sorts them so you can find the right one in under a minute.",
});

/**
 * Families group categories for navigation. `tone` drives the accent used on
 * that family's cards and its category pages, so the browse page reads as eight
 * colour zones rather than one undifferentiated wall.
 */
export const FAMILIES = Object.freeze([
  {
    id: "play",
    name: "Play",
    icon: "Gamepad2",
    tone: "violet",
    blurb: "Games that load instantly and want nothing from you.",
  },
  {
    id: "make",
    name: "Make",
    icon: "Palette",
    tone: "fuchsia",
    blurb: "Drag, type or click and something appears.",
  },
  {
    id: "learn",
    name: "Learn",
    icon: "Lightbulb",
    tone: "sky",
    blurb: "Hard things, made suddenly obvious.",
  },
  {
    id: "wander",
    name: "Wander",
    icon: "Globe2",
    tone: "emerald",
    blurb: "The planet, live, from a chair.",
  },
  {
    id: "unwind",
    name: "Unwind",
    icon: "Waves",
    tone: "teal",
    blurb: "Somewhere to put your shoulders down.",
  },
  {
    id: "laugh",
    name: "Laugh",
    icon: "Laugh",
    tone: "orange",
    blurb: "Reliable laughs, low commitment.",
  },
  {
    id: "weird",
    name: "Weird",
    icon: "Ghost",
    tone: "indigo",
    blurb: "The internet at its least explicable.",
  },
  {
    id: "retro",
    name: "Retro",
    icon: "Joystick",
    tone: "amber",
    blurb: "Old software, running again, in a tab.",
  },
]);

export const FAMILY_IDS = Object.freeze(FAMILIES.map((f) => f.id));

/**
 * Categories double as landing pages, so each carries its own copy: `blurb` is
 * the card line, `intro` opens the category page, and `metaDescription` is the
 * search snippet. Writing the three together keeps them from drifting apart.
 */
export const CATEGORIES = Object.freeze([
  // ---------------------------------------------------------------- play ---
  {
    id: "quick-games",
    name: "Five-Minute Games",
    family: "play",
    icon: "Timer",
    blurb: "One round, then back to work. Allegedly.",
    intro:
      "Games that start the moment the page loads and end before your coffee goes cold. No tutorial, no account, no save file to feel guilty about abandoning.",
    metaDescription:
      "Free browser games you can finish in five minutes — quick, no-download games that load instantly and need no sign-up.",
  },
  {
    id: "brain-training",
    name: "Brain Trainers",
    family: "play",
    icon: "Brain",
    blurb: "Cognitive exercise disguised as a game.",
    intro:
      "Memory, reaction, attention and pattern-matching drills that happen to be fun. Short sessions, visible progress, and a score you will want to beat.",
    metaDescription:
      "Free brain training games online — memory, reaction time and logic exercises you can play in a browser with no download.",
  },
  {
    id: "word-games",
    name: "Word Games",
    family: "play",
    icon: "Type",
    blurb: "Letters, arranged under pressure.",
    intro:
      "Daily word puzzles, anagram hunts, crosswords and the whole family of games that grew out of one green-and-yellow grid. Most reset at midnight.",
    metaDescription:
      "Free online word games and daily word puzzles — crosswords, anagrams, Wordle-likes and letter games playable in your browser.",
  },
  {
    id: "trivia",
    name: "Trivia & Quizzes",
    family: "play",
    icon: "CircleHelp",
    blurb: "Find out what you actually know.",
    intro:
      "General knowledge, guess-the-thing, higher-or-lower and the specific joy of getting an obscure question right. Good alone, better with someone watching.",
    metaDescription:
      "Free online trivia games and quizzes — general knowledge, guessing games and daily quiz challenges with no sign-up.",
  },
  {
    id: "personality-tests",
    name: "Personality Tests",
    family: "play",
    icon: "ScanFace",
    blurb: "Barely science. Extremely readable.",
    intro:
      "Typologies, moral dilemmas, purity scores and which-character quizzes. Somewhere between genuine psychometrics and a magazine back page, and both ends are entertaining.",
    metaDescription:
      "Free personality tests and psychology quizzes online — typology tests, moral dilemma games and self-assessment quizzes.",
  },
  {
    id: "io-arenas",
    name: ".io Arenas",
    family: "play",
    icon: "Swords",
    blurb: "Massive, multiplayer, immediate.",
    intro:
      "Open a tab, get dropped into a live match with strangers, die embarrassingly fast, immediately respawn. The purest loop the browser ever produced.",
    metaDescription:
      "Free .io games — massive multiplayer browser games you can join instantly with no download or account.",
  },
  {
    id: "party-games",
    name: "Party Games",
    family: "play",
    icon: "PartyPopper",
    blurb: "Send the room code, wait for chaos.",
    intro:
      "Drawing, guessing, lying and word association, played with a group over a link. The rare category that is better on a call than in person.",
    metaDescription:
      "Free online party games to play with friends — drawing, guessing and word games with a shareable room code, no app needed.",
  },
  {
    id: "strategy",
    name: "Strategy & Conquest",
    family: "play",
    icon: "Crown",
    blurb: "Plan, expand, lose to a teenager.",
    intro:
      "Territory control, base building and turn-based scheming. Slower than the arenas and considerably harder to walk away from.",
    metaDescription:
      "Free browser strategy games — territory control, base building and turn-based war games with no download.",
  },
  {
    id: "idle-clickers",
    name: "Idle Clickers",
    family: "play",
    icon: "Pointer",
    blurb: "Click button, number goes up, universe ends.",
    intro:
      "Incremental games that start with one button and end, several hours later, somewhere philosophically alarming. The genre is a genuine art form now.",
    metaDescription:
      "Free idle and incremental games online — clicker games that keep running in a background tab, playable free in a browser.",
  },
  {
    id: "text-adventures",
    name: "Text Adventures",
    family: "play",
    icon: "Scroll",
    blurb: "The graphics are in your head, and they're excellent.",
    intro:
      "Interactive fiction, MUDs and choose-your-path stories. Some are forty years old and still better written than most things released this year.",
    metaDescription:
      "Free text adventure games and interactive fiction online — classic IF, MUDs and choose-your-own-adventure stories in the browser.",
  },
  {
    id: "rpg-grinds",
    name: "RPG Grinds",
    family: "play",
    icon: "Shield",
    blurb: "Loot, levels, and a worrying amount of time.",
    intro:
      "Browser role-playing games with real progression systems. These are the ones that quietly become a hobby rather than a distraction.",
    metaDescription:
      "Free browser RPG games — loot grinding, character progression and idle role-playing games with no download.",
  },
  {
    id: "puzzle-grids",
    name: "Grid & Tile Puzzles",
    family: "play",
    icon: "Grid3x3",
    blurb: "Slide, match, snap, repeat.",
    intro:
      "Falling blocks, sliding tiles, merge mechanics and the whole lineage descending from a Soviet mainframe in 1984. Endlessly refined, never improved on.",
    metaDescription:
      "Free tile and grid puzzle games online — block puzzles, sliding tiles, match games and Tetris-likes playable in the browser.",
  },
  {
    id: "reflex-runners",
    name: "Reflex Runners",
    family: "play",
    icon: "Footprints",
    blurb: "Fast, unfair, one more go.",
    intro:
      "Endless runners, precision platformers and games built entirely around the half-second between seeing and reacting. Rage-adjacent by design.",
    metaDescription:
      "Free reflex and endless runner games online — fast-paced browser games testing reaction speed, no download required.",
  },
  {
    id: "racing",
    name: "Racing & Drifting",
    family: "play",
    icon: "Car",
    blurb: "Go fast, crash, no paperwork.",
    intro:
      "Driving games from arcade drifting to genuinely relaxing open-road cruising. The calm ones are a legitimate category of their own.",
    metaDescription:
      "Free online racing games — drifting, driving and car games playable in a browser with no download or sign-up.",
  },
  {
    id: "sports-sims",
    name: "Armchair Sports",
    family: "play",
    icon: "Trophy",
    blurb: "All the glory, none of the cardio.",
    intro:
      "Golf, pool, football and the specific genre of sports game that is really a physics joke wearing a jersey.",
    metaDescription:
      "Free online sports games — browser golf, pool, football and basketball games you can play instantly for free.",
  },
  {
    id: "shooters",
    name: "Browser Shooters",
    family: "play",
    icon: "Crosshair",
    blurb: "Point, click, delete pixels.",
    intro:
      "First and third-person shooters that run in a tab with no launcher and no install. Impressive that they work at all; more impressive that they are good.",
    metaDescription:
      "Free browser shooting games — FPS and multiplayer shooters that run in your browser with no download.",
  },
  {
    id: "tower-defense",
    name: "Tower Defence",
    family: "play",
    icon: "Castle",
    blurb: "Build the maze, watch it hold.",
    intro:
      "Place things, upgrade things, watch a wave break against them. The most satisfying genre for people who like being right in advance.",
    metaDescription:
      "Free tower defence games online — wave defence and base building strategy games playable free in the browser.",
  },
  {
    id: "card-games",
    name: "Card Games",
    family: "play",
    icon: "Spade",
    blurb: "Digital decks, zero shuffling.",
    intro:
      "Solitaire in its many disputed variants, plus card games you can play against strangers without owning a deck or explaining the rules.",
    metaDescription:
      "Free online card games — solitaire, poker and multiplayer card games playable in a browser with no download.",
  },
  {
    id: "board-games",
    name: "Board Games",
    family: "play",
    icon: "Dices",
    blurb: "Tabletop, no cleanup, no lost pieces.",
    intro:
      "Chess, draughts, connection games and modern board games ported honestly. Play a stranger or send a link to someone in another country.",
    metaDescription:
      "Free online board games — chess, checkers and multiplayer board games you can play with friends in a browser.",
  },
  {
    id: "escape-rooms",
    name: "Escape Rooms",
    family: "play",
    icon: "DoorOpen",
    blurb: "Locked in a tab, on purpose.",
    intro:
      "Point-and-click puzzle rooms and short adventure games where the entire mechanic is noticing something. Bring patience and a scratch pad.",
    metaDescription:
      "Free online escape room games — point-and-click puzzle rooms and browser adventure games with no download.",
  },
  {
    id: "arcade-hubs",
    name: "Arcade Hubs",
    family: "play",
    icon: "LayoutGrid",
    blurb: "Thousands of games behind one door.",
    intro:
      "The large portals. Less curated than everything else here, but when you want volume rather than a recommendation, this is where volume lives.",
    metaDescription:
      "Best free online game websites — huge browser game portals and arcade hubs with thousands of games, no download.",
  },
  {
    id: "geo-games",
    name: "Geography Games",
    family: "play",
    icon: "MapPin",
    blurb: "Guess where you are from a hedge.",
    intro:
      "Street-view guessing, flag identification, country outlines and the entire Wordle-for-maps genre. Educational as an accident of being fun.",
    metaDescription:
      "Free geography games online — country guessing games, street view challenges, flag quizzes and map games.",
  },
  {
    id: "typing-games",
    name: "Typing Tests",
    family: "play",
    icon: "Keyboard",
    blurb: "Find out how fast you actually are.",
    intro:
      "Typing tests that got beautiful somewhere around 2020. Genuinely the fastest way to improve a skill you use every day and have never practised.",
    metaDescription:
      "Free typing tests and typing games online — measure your words per minute and improve typing speed in the browser.",
  },
  {
    id: "tycoon-sims",
    name: "Tycoon Sims",
    family: "play",
    icon: "Banknote",
    blurb: "Build an empire, ruin an economy.",
    intro:
      "Management games about money — lemonade stands scaled up to the point of moral compromise. Every one of them is about the same lesson.",
    metaDescription:
      "Free tycoon and business simulation games online — management and idle empire games playable free in a browser.",
  },
  {
    id: "sandbox-sims",
    name: "Sandboxes & Simulators",
    family: "play",
    icon: "FlaskConical",
    blurb: "Small worlds that keep running without you.",
    intro:
      "Physics toys, ecosystems and falling-sand games with no win condition. Set the initial state, then find out what the rules do with it.",
    metaDescription:
      "Free browser sandbox games and simulators — physics toys, falling sand games and ecosystem sims with no goal.",
  },
  {
    id: "dress-up",
    name: "Dress-Up & Avatars",
    family: "play",
    icon: "Shirt",
    blurb: "Character creator, no game attached.",
    intro:
      "Avatar makers and dress-up games, which are really just character creators liberated from the games they were trapped in. A whole subculture.",
    metaDescription:
      "Free dress up games and avatar makers online — character creators and fashion games playable in a browser.",
  },

  // ---------------------------------------------------------------- make ---
  {
    id: "drawing-toys",
    name: "Drawing Toys",
    family: "make",
    icon: "Paintbrush",
    blurb: "Art you make by moving the mouse.",
    intro:
      "Generative brushes and cursor instruments. You are not drawing so much as steering something that is already drawing, which removes blank-canvas anxiety entirely.",
    metaDescription:
      "Free online drawing toys and generative art tools — creative browser toys that turn cursor movement into art, no sign-up.",
  },
  {
    id: "music-makers",
    name: "Music Makers",
    family: "make",
    icon: "Music",
    blurb: "Instruments that need no lessons.",
    intro:
      "Browser instruments, sequencers and sound toys designed so that anyone's first thirty seconds sound good. Headphones strongly recommended.",
    metaDescription:
      "Free online music making tools — browser instruments, beat makers and sound toys you can play with no download.",
  },
  {
    id: "pixel-art",
    name: "Pixel Art",
    family: "make",
    icon: "Grid2x2",
    blurb: "Constraints that make you better.",
    intro:
      "Sprite editors and pixel canvases. The limited grid does most of the design work for you, which is why beginners' output looks good immediately.",
    metaDescription:
      "Free pixel art makers online — browser sprite editors and pixel drawing tools for making 8-bit art with no download.",
  },
  {
    id: "generative-art",
    name: "Generative Art",
    family: "make",
    icon: "Spline",
    blurb: "Set the rules, let them run.",
    intro:
      "Algorithms as a medium: flow fields, particle systems, tilings and fractals you can steer. Output tends to be wallpaper-grade within a minute.",
    metaDescription:
      "Free generative art tools online — algorithmic art generators, fractal makers and creative coding toys in the browser.",
  },
  {
    id: "glitch-art",
    name: "Glitch Art",
    family: "make",
    icon: "Blend",
    blurb: "Break the file, keep the result.",
    intro:
      "Databending, corruption and deliberate compression damage. Upload something intact, receive something considerably more interesting.",
    metaDescription:
      "Free glitch art generators online — databending, image corruption and visual noise tools you can use in a browser.",
  },
  {
    id: "design-playgrounds",
    name: "Design Playgrounds",
    family: "make",
    icon: "Shapes",
    blurb: "Colours, type and shapes, no brief.",
    intro:
      "Palette builders, type playgrounds, background generators and gradient tools. Half of professional design is trying things quickly, and these are for trying things quickly.",
    metaDescription:
      "Free design tools online — colour palette generators, font playgrounds and background makers with no sign-up.",
  },
  {
    id: "design-challenges",
    name: "Design Challenges",
    family: "make",
    icon: "Target",
    blurb: "Test whether your eye is as good as you think.",
    intro:
      "Kerning trials, alignment tests, colour matching and spot-the-difference for interface designers. Humbling in a useful way.",
    metaDescription:
      "Free design games and challenges — kerning, colour matching and alignment tests for designers, playable online.",
  },
  {
    id: "ui-patterns",
    name: "UI & UX Libraries",
    family: "make",
    icon: "Component",
    blurb: "Reference shelves for interface work.",
    intro:
      "Pattern libraries, dark-pattern catalogues, component galleries and laws-of-UX summaries. The bookmarks that actually get reopened.",
    metaDescription:
      "Best UI and UX design resources — interface pattern libraries, component galleries and design inspiration sites.",
  },
  {
    id: "emoji-toys",
    name: "Emoji Toys",
    family: "make",
    icon: "Smile",
    blurb: "Mixers, faces and copy-paste ammunition.",
    intro:
      "Emoji combiners, kaomoji archives and text-face generators. Frivolous until the exact moment you need one, at which point essential.",
    metaDescription:
      "Free emoji tools online — emoji mixers, text face generators and kaomoji copy-paste collections.",
  },
  {
    id: "text-generators",
    name: "Text & Font Toys",
    family: "make",
    icon: "Braces",
    blurb: "Do unreasonable things to letters.",
    intro:
      "Fancy text converters, ASCII art makers, typography experiments and the specific pleasure of putting words through something that mangles them.",
    metaDescription:
      "Free text generators and font tools online — ASCII art makers, fancy text converters and typography toys.",
  },
  {
    id: "photo-toys",
    name: "Photo Toys",
    family: "make",
    icon: "Camera",
    blurb: "Upload an image, get something better.",
    intro:
      "Browser photo editors, background removers, filters and mosaic makers. Free tools that quietly replaced software people used to pay for.",
    metaDescription:
      "Free online photo editing tools — background removers, filters and image effect makers with no download or sign-up.",
  },

  // --------------------------------------------------------------- learn ---
  {
    id: "interactive-explainers",
    name: "Interactive Explainers",
    family: "learn",
    icon: "Lightbulb",
    blurb: "Hard things, made suddenly obvious.",
    intro:
      "Explainers that use motion, interaction and scrolling to teach what a paragraph never could. The clearest teaching on the internet lives here.",
    metaDescription:
      "Best interactive explainers and visual essays online — learn complex topics by playing with them, free and in the browser.",
  },
  {
    id: "curious-facts",
    name: "Curious Facts",
    family: "learn",
    icon: "Sparkles",
    blurb: "Things you will repeat at dinner.",
    intro:
      "Records, comparisons, scale demonstrations and weird knowledge. The category most likely to produce a sentence beginning \"did you know\".",
    metaDescription:
      "Websites full of interesting facts and weird knowledge — trivia, world records and surprising comparisons to explore free.",
  },
  {
    id: "data-viz",
    name: "Data Visualisation",
    family: "learn",
    icon: "ChartScatter",
    blurb: "Numbers that finally mean something.",
    intro:
      "Visual journalism and open data done properly — charts you can interrogate rather than just look at. The argument is in the interaction.",
    metaDescription:
      "Best data visualisation websites — interactive charts, visual journalism and open datasets that make statistics understandable.",
  },
  {
    id: "space",
    name: "Space & Scale",
    family: "learn",
    icon: "Orbit",
    blurb: "Zoom out until you feel small.",
    intro:
      "Space, deep time and the size of things. Every site here exists to give you the one thing a textbook diagram cannot: actual scale.",
    metaDescription:
      "Interactive space and scale websites — explore the universe, compare sizes from atoms to galaxies and travel through deep time.",
  },
  {
    id: "science-toys",
    name: "Science Toys",
    family: "learn",
    icon: "Atom",
    blurb: "Poke a law of physics and watch.",
    intro:
      "Simulations you can meddle with: orbits, evolution, chemistry, cellular automata. Understanding through interference rather than through reading.",
    metaDescription:
      "Free interactive science simulations online — physics, chemistry and biology toys you can experiment with in a browser.",
  },
  {
    id: "history-archives",
    name: "History & Time",
    family: "learn",
    icon: "Hourglass",
    blurb: "The past, browsable.",
    intro:
      "Historical maps, timelines, primary sources and the strange experience of seeing a moment in time laid out as an interface.",
    metaDescription:
      "Best history websites online — interactive historical maps, timelines and primary source archives you can browse free.",
  },
  {
    id: "language-learning",
    name: "Language & Words",
    family: "learn",
    icon: "Languages",
    blurb: "Where words came from, and how to get more.",
    intro:
      "Etymology, vocabulary drills, immersion tools and dictionaries with opinions. Useful whether you are learning a language or just fond of your own.",
    metaDescription:
      "Free language learning websites and word tools — etymology dictionaries, vocabulary builders and immersion resources.",
  },
  {
    id: "libraries",
    name: "Free Libraries",
    family: "learn",
    icon: "Library",
    blurb: "More reading than one life allows.",
    intro:
      "Public-domain books, scanned art, academic archives and collections built by people who cared far too much about one subject. Bring time.",
    metaDescription:
      "Free online libraries and archives — public domain books, digitised art collections and open academic resources.",
  },
  {
    id: "wiki-holes",
    name: "Wiki Rabbit Holes",
    family: "learn",
    icon: "Network",
    blurb: "Enter for one fact, leave two hours later.",
    intro:
      "Densely linked reference sites engineered — accidentally or otherwise — to make you click one more entry. The original rabbit holes.",
    metaDescription:
      "The internet's best rabbit hole websites — deeply linked wikis and reference sites where one click becomes two hours.",
  },
  {
    id: "mystery-puzzles",
    name: "Mysteries & Riddles",
    family: "learn",
    icon: "Search",
    blurb: "Something is wrong here. Find out what.",
    intro:
      "Logic mysteries, cipher tools, unsolved cases and ARG-shaped sites that never quite explain themselves. Deduction as entertainment.",
    metaDescription:
      "Free online mystery and riddle games — logic puzzles, detective games, ciphers and unsolved internet mysteries.",
  },
  {
    id: "ai-experiments",
    name: "AI Experiments",
    family: "learn",
    icon: "Bot",
    blurb: "Machine learning you can poke at.",
    intro:
      "Models you can play with directly in a tab — generators, guessers, classifiers and the occasional unsettling demo. Understanding by messing about.",
    metaDescription:
      "Free AI experiments you can try in the browser — image generators, drawing guessers and hands-on machine learning demos.",
  },
  {
    id: "privacy-tools",
    name: "Privacy & Security",
    family: "learn",
    icon: "Shield",
    blurb: "Find out what the internet knows about you.",
    intro:
      "Breach checkers, fingerprint tests, throwaway inboxes and plain-English readings of terms of service. Mildly alarming, entirely free.",
    metaDescription:
      "Free online privacy and security tools — data breach checkers, browser fingerprint tests and disposable email services.",
  },
  {
    id: "useful-tools",
    name: "Unreasonably Useful",
    family: "learn",
    icon: "Wrench",
    blurb: "Free tools that feel like cheating.",
    intro:
      "Sites that quietly do a job you would otherwise pay for or install software for. Included because being this good for free is genuinely strange.",
    metaDescription:
      "Genuinely useful free websites — converters, editors and browser tools that replace paid software with no sign-up.",
  },
  {
    id: "odd-search",
    name: "Odd Search Engines",
    family: "learn",
    icon: "Telescope",
    blurb: "Finding things the big index cannot.",
    intro:
      "Reverse image search, niche indexes, and search engines built on a premise other than popularity. What the web looks like when ranked differently.",
    metaDescription:
      "Unusual search engines online — reverse image search, niche indexes and alternative search tools beyond Google.",
  },

  // -------------------------------------------------------------- wander ---
  {
    id: "live-earth",
    name: "Live Earth Maps",
    family: "wander",
    icon: "Globe2",
    blurb: "What the planet is doing, right now.",
    intro:
      "Live data drawn on a map: storms, earthquakes, lightning, shipping, wildlife. Open one and the planet stops being an abstraction.",
    metaDescription:
      "Real-time maps of Earth — live weather, earthquakes, lightning strikes and global activity maps updated as it happens.",
  },
  {
    id: "street-view",
    name: "Armchair Travel",
    family: "wander",
    icon: "Navigation",
    blurb: "Somewhere else, without the airport.",
    intro:
      "Street-view wandering, city walks, live webcams and the small miracle of standing on a road eight thousand kilometres away for free.",
    metaDescription:
      "Virtual travel websites — explore world cities in street view, watch live city walks and visit places from your browser free.",
  },
  {
    id: "nature-cams",
    name: "Nature & Animal Cams",
    family: "wander",
    icon: "Bird",
    blurb: "Live animals, doing nothing, beautifully.",
    intro:
      "Nest cams, reef cams, feeders and trackers. The best possible thing to leave open on a second monitor and glance at occasionally.",
    metaDescription:
      "Live animal cams and nature webcams online — watch birds, wildlife and ocean life streaming live for free.",
  },
  {
    id: "weather",
    name: "Weather Watching",
    family: "wander",
    icon: "CloudRain",
    blurb: "Atmosphere as a visual medium.",
    intro:
      "Wind maps, radar loops, satellite imagery and forecast models that look extraordinary regardless of whether you need to know about rain.",
    metaDescription:
      "Best weather visualisation websites — live wind maps, radar loops, satellite imagery and interactive forecast models.",
  },
  {
    id: "world-radio",
    name: "World Radio",
    family: "wander",
    icon: "Radio",
    blurb: "Spin the globe, hear a stranger's morning.",
    intro:
      "Radio stations plotted on a map or sorted by decade. The fastest way to feel like you are somewhere else without leaving the tab.",
    metaDescription:
      "Listen to world radio online free — global radio maps, international stations and radio by country and decade.",
  },
  {
    id: "music-discovery",
    name: "Music Discovery",
    family: "wander",
    icon: "Disc3",
    blurb: "Beat the recommendation engine.",
    intro:
      "Genre maps, obscurity engines, decade browsers and the sites that surface songs no algorithm would risk putting in front of you.",
    metaDescription:
      "Music discovery websites that go beyond algorithms — explore genres, decades and forgotten tracks nobody has heard.",
  },
  {
    id: "flight-tracking",
    name: "Flight & Ship Tracking",
    family: "wander",
    icon: "Plane",
    blurb: "Every vessel, plotted, in real time.",
    intro:
      "Aircraft, cargo ships, trains and satellites moving live on a map. Startling the first time you realise how much is in the air at once.",
    metaDescription:
      "Live flight and ship tracking maps — track planes, cargo vessels, trains and satellites in real time for free.",
  },
  {
    id: "map-oddities",
    name: "Map Oddities",
    family: "wander",
    icon: "Map",
    blurb: "Cartography with an agenda.",
    intro:
      "True-size comparisons, cable maps, road-only renderings and the maps whose whole purpose is to correct something you believed.",
    metaDescription:
      "Unusual and interactive map websites — true size comparisons, submarine cable maps and creative cartography online.",
  },

  // -------------------------------------------------------------- unwind ---
  {
    id: "ambient-sound",
    name: "Ambient Sound",
    family: "unwind",
    icon: "AudioLines",
    blurb: "Rain, cafés and distant weather.",
    intro:
      "Sound mixers and generators for people who cannot work in silence or in music. Set once, leave open all day.",
    metaDescription:
      "Free ambient sound generators online — rain sounds, café noise and background sound mixers for focus and sleep.",
  },
  {
    id: "focus-timers",
    name: "Focus & Breathing",
    family: "unwind",
    icon: "Timer",
    blurb: "Sixty seconds to reset.",
    intro:
      "Breathing guides, pomodoro timers and deliberately slow interventions. Small, unglamorous and startlingly effective on a bad afternoon.",
    metaDescription:
      "Free focus timers and breathing exercises online — pomodoro timers, guided breathing and short calming tools.",
  },
  {
    id: "oddly-satisfying",
    name: "Oddly Satisfying",
    family: "unwind",
    icon: "Droplet",
    blurb: "Loops and fidgets that soothe.",
    intro:
      "Pop it, stretch it, watch it fall. Sites built around one physically pleasing interaction, repeated until you feel better.",
    metaDescription:
      "Oddly satisfying websites — fidget toys, bubble wrap simulators and soothing interactive loops you can play with free.",
  },
  {
    id: "zen-visuals",
    name: "Zen Visuals",
    family: "unwind",
    icon: "Waves",
    blurb: "Move slowly, or not at all.",
    intro:
      "Slow, quiet, low-stimulation visuals. Nothing here flashes, autoplays loudly or asks for anything. Background-tab material.",
    metaDescription:
      "Calming websites with relaxing visuals — slow, quiet interactive scenes and meditative visual experiences online.",
  },
  {
    id: "wholesome",
    name: "The Wholesome Web",
    family: "unwind",
    icon: "PawPrint",
    blurb: "For when the feed has been too much.",
    intro:
      "Animals, kindness, compliments from strangers and pages built purely to improve your afternoon. No irony anywhere on this list.",
    metaDescription:
      "Wholesome websites that lift your mood — puppies, kindness projects and comforting corners of the internet.",
  },
  {
    id: "good-news",
    name: "Good News",
    family: "unwind",
    icon: "Sunrise",
    blurb: "Evidence that things also go right.",
    intro:
      "Newsrooms with a constructive brief. Not a denial that the world is difficult, just a correction to a feed that only reports one direction.",
    metaDescription:
      "Good news websites — positive and constructive journalism sites reporting stories that go right.",
  },

  // --------------------------------------------------------------- laugh ---
  {
    id: "pointless-fun",
    name: "Gloriously Pointless",
    family: "laugh",
    icon: "Sparkle",
    blurb: "No purpose whatsoever, and that's the point.",
    intro:
      "Sites that do exactly one strange thing extremely well and solve no problem at all. The purest form of the web — somebody built this because it amused them.",
    metaDescription:
      "The best useless websites on the internet — pointless, funny and oddly beautiful pages built for no reason at all.",
  },
  {
    id: "gags-memes",
    name: "Gags & Memes",
    family: "laugh",
    icon: "Laugh",
    blurb: "Quick laughs, low commitment.",
    intro:
      "Soundboards, meme archives, internet humour that survived a decade of reposting. Open in a tab you can close quickly.",
    metaDescription:
      "Funny websites and meme archives — soundboards, internet humour and joke sites worth bookmarking.",
  },
  {
    id: "webcomics",
    name: "Webcomics",
    family: "laugh",
    icon: "BookOpen",
    blurb: "Archives deep enough to lose a weekend in.",
    intro:
      "Long-running strips with archives measured in thousands. Start at the beginning; you will not, but the option is there.",
    metaDescription:
      "Best webcomics to read online free — long-running comic strips with huge archives, updated regularly.",
  },
  {
    id: "satire-news",
    name: "Satire & Fake News",
    family: "laugh",
    icon: "Newspaper",
    blurb: "Headlines that are not real, and know it.",
    intro:
      "Satirical newsrooms and parody publications. Occasionally more accurate than the thing they are parodying, which is the joke.",
    metaDescription:
      "Best satire news websites — parody newspapers and funny fake news sites to read online free.",
  },
  {
    id: "look-busy",
    name: "Look Productive",
    family: "laugh",
    icon: "Monitor",
    blurb: "Corporate camouflage, full screen.",
    intro:
      "Fake terminals, fake updates, fake spreadsheets. Press any key, look extremely occupied. Best used responsibly, which nobody does.",
    metaDescription:
      "Websites that make you look busy at work — fake loading screens, hacker typers and fake update simulators.",
  },
  {
    id: "prank-toys",
    name: "Prank Toys",
    family: "laugh",
    icon: "VenetianMask",
    blurb: "Harmless mischief, sendable as a link.",
    intro:
      "Fake screens, fake alerts and gag generators. Aim them at friends rather than strangers and nobody gets hurt.",
    metaDescription:
      "Funny prank websites and gag generators — harmless prank links and fake screen pranks to send to friends.",
  },

  // --------------------------------------------------------------- weird ---
  {
    id: "horror",
    name: "Horror Vault",
    family: "weird",
    icon: "Skull",
    blurb: "Creepy corners and digital dread.",
    intro:
      "Creepypasta archives, unsettling fiction and horror built specifically for a browser window. Best at night, obviously.",
    metaDescription:
      "Scary websites and horror stories online — creepypasta archives, unsettling fiction and creepy interactive sites.",
  },
  {
    id: "liminal",
    name: "Liminal Spaces",
    family: "weird",
    icon: "DoorClosed",
    blurb: "Empty rooms that feel like something.",
    intro:
      "Photographs of places with nobody in them: dead malls, empty pools, corridors at 3am. An aesthetic that has no right to be this affecting.",
    metaDescription:
      "Liminal space websites and image archives — empty rooms, dead malls and eerie abandoned place photography.",
  },
  {
    id: "crowd-experiments",
    name: "Crowd Experiments",
    family: "weird",
    icon: "Users",
    blurb: "Thousands of strangers, one canvas.",
    intro:
      "Shared spaces where everyone acts at once. Sometimes it becomes art, usually it becomes a mess, and the mess is the interesting part.",
    metaDescription:
      "Collaborative internet experiments — shared canvases, multiplayer drawing and real-time crowd websites.",
  },
  {
    id: "weird-shops",
    name: "Weird Shops",
    family: "weird",
    icon: "ShoppingBag",
    blurb: "Products that should not exist.",
    intro:
      "Bizarre product galleries and gift catalogues. Browsing is free and considerably wiser than buying.",
    metaDescription:
      "Weird online shops and strange product websites — bizarre gift galleries and unusual things to buy online.",
  },
  {
    id: "optical-illusions",
    name: "Optical Illusions",
    family: "weird",
    icon: "Eye",
    blurb: "Proof your eyes are guessing.",
    intro:
      "Illusion collections and perception demos. The good ones keep working after you have been told exactly how they work.",
    metaDescription:
      "Best optical illusion websites — mind-bending images, perception demos and visual illusion collections online.",
  },
  {
    id: "odd-obsessions",
    name: "Odd Obsessions",
    family: "weird",
    icon: "Archive",
    blurb: "One person, one subject, twenty years.",
    intro:
      "Sites built by somebody who decided to document a single narrow thing completely. Shoelace knots. Candy wrappers. Utterly sincere.",
    metaDescription:
      "Strangely specific websites — obsessive single-topic archives and collections documenting one thing completely.",
  },
  {
    id: "unexplainable",
    name: "Unexplainable",
    family: "weird",
    icon: "CircleHelp",
    blurb: "We're not sure either.",
    intro:
      "Sites that resist description. If a page here makes immediate sense to you, that is worth thinking about.",
    metaDescription:
      "The strangest websites on the internet — bizarre, unexplainable pages that defy description.",
  },

  // --------------------------------------------------------------- retro ---
  {
    id: "retro-web",
    name: "Retro Web",
    family: "retro",
    icon: "Tv",
    blurb: "Television and interfaces from before.",
    intro:
      "Simulated TV channels by decade, old operating systems and the specific texture of an interface designed for a CRT.",
    metaDescription:
      "Retro websites and nostalgia sites — 90s TV simulators, old operating systems and vintage web experiences online.",
  },
  {
    id: "old-net-art",
    name: "Old Net Art",
    family: "retro",
    icon: "Sparkle",
    blurb: "Made before the web got tidy.",
    intro:
      "Personal pages, hand-written HTML, Winamp skins and net art from an era when nobody had decided what a website was supposed to look like.",
    metaDescription:
      "Old internet art and 90s web design — vintage net art, Winamp skin museums and early web aesthetic archives.",
  },
  {
    id: "emulators",
    name: "Emulators & Old OS",
    family: "retro",
    icon: "Cpu",
    blurb: "Software that should not still run.",
    intro:
      "Operating systems, arcade cabinets and dead software booted inside a browser tab. Nostalgia with a working keyboard.",
    metaDescription:
      "Browser emulators online free — run old operating systems, classic arcade games and vintage software in your browser.",
  },
  {
    id: "lost-media",
    name: "Lost Media",
    family: "retro",
    icon: "Film",
    blurb: "Footage nobody was supposed to keep.",
    intro:
      "Lost media wikis, obsolete format museums and archives of things that were never meant to outlive their broadcast.",
    metaDescription:
      "Lost media archives online — obsolete format museums, lost footage wikis and preserved broadcast history.",
  },
  {
    id: "web-archives",
    name: "Web Archives",
    family: "retro",
    icon: "History",
    blurb: "The internet's own memory, still browsable.",
    intro:
      "Archives, dead websites brought back and search pointed at the past. What the web looked like before it settled down.",
    metaDescription:
      "Web archive websites — browse the Wayback Machine, resurrected old pages and internet history archives free.",
  },

  // ---------------------------------------------------------------- life ---
  // Life sits under `learn` for navigation; these are the practical corners
  // people arrive at from search rather than from browsing.
  {
    id: "food-web",
    name: "Food & Recipes",
    family: "learn",
    icon: "Utensils",
    blurb: "Cook what is actually in the fridge.",
    intro:
      "Recipe engines that start from your ingredients rather than your ambitions, plus the food writing worth reading for its own sake.",
    metaDescription:
      "Best recipe websites and food tools — find recipes from ingredients you already have, free and with no sign-up.",
  },
  {
    id: "movie-finders",
    name: "What To Watch",
    family: "learn",
    icon: "Clapperboard",
    blurb: "End the scrolling, start the film.",
    intro:
      "Recommendation engines, streaming locators and lists with actual taste. Built for the forty minutes usually lost to a menu.",
    metaDescription:
      "Best websites to find what to watch — movie recommendation engines, streaming search and curated film lists.",
  },
  {
    id: "anime",
    name: "Anime Finders",
    family: "learn",
    icon: "Drama",
    blurb: "Databases, trackers and scene search.",
    intro:
      "Catalogues, seasonal charts and the reverse-image tool that identifies an episode from a single screenshot. Deeply well-built corner of the web.",
    metaDescription:
      "Best anime websites — anime databases, seasonal charts, trackers and scene search tools online free.",
  },
  {
    id: "astrology",
    name: "Astrology & Vibes",
    family: "learn",
    icon: "Moon",
    blurb: "Charts, horoscopes, no judgement.",
    intro:
      "Birth charts, transits and horoscopes. Included as culture rather than as physics, and enjoyable on exactly those terms.",
    metaDescription:
      "Free astrology websites online — birth chart calculators, horoscopes and natal chart readings with no sign-up.",
  },
  {
    id: "life-hacks",
    name: "DIY & Life Hacks",
    family: "learn",
    icon: "Hammer",
    blurb: "How to actually do the thing.",
    intro:
      "Build guides, repair databases and instruction sites for physical tasks. The internet at its most straightforwardly useful.",
    metaDescription:
      "Best DIY and how-to websites — repair guides, project instructions and practical life hack resources online free.",
  },
  {
    id: "celeb-gossip",
    name: "Celebrity Gossip",
    family: "laugh",
    icon: "Star",
    blurb: "Pop culture, unfiltered.",
    intro:
      "Gossip blogs, celebrity databases and the strangely compelling business of tracking famous strangers' heights and birthdays.",
    metaDescription:
      "Best celebrity gossip websites — pop culture blogs, celebrity databases and entertainment news sites.",
  },
  {
    id: "weird-video",
    name: "Weird Video",
    family: "weird",
    icon: "Video",
    blurb: "Footage the algorithm buried.",
    intro:
      "Obscure video aggregators, unindexed uploads and search engines pointed at film dialogue. What you find when nobody is optimising for you.",
    metaDescription:
      "Weird video websites — obscure video aggregators, unwatched uploads and unusual video search engines.",
  },
  {
    id: "directories",
    name: "Portals & Directories",
    family: "weird",
    icon: "Shuffle",
    blurb: "Other people's collections of the good stuff.",
    intro:
      "The other directories, random buttons and curated indexes. We are one of these; it would be dishonest to pretend the others are not worth your time.",
    metaDescription:
      "Best website directories and random site generators — curated indexes and random button portals for finding new sites.",
  },
]);

export const CATEGORY_IDS = Object.freeze(CATEGORIES.map((c) => c.id));

export const CATEGORIES_BY_FAMILY = Object.freeze(
  FAMILIES.map((family) => ({
    ...family,
    categories: CATEGORIES.filter((c) => c.family === family.id),
  })),
);

/**
 * `timeToJoy` answers the only question a visitor actually has: how long before
 * this is worth it? It is the primary sort on the browse page and the facet
 * shown first on every card.
 */
export const TIME_BANDS = Object.freeze([
  {
    id: "instant",
    label: "Instant",
    minutes: 1,
    hint: "Good within five seconds of loading.",
    intro:
      "No setup, no reading, no learning curve. These pay off before you have decided whether you like them.",
    metaDescription:
      "Websites that are fun immediately — instant, no-setup sites that pay off within seconds of loading.",
  },
  {
    id: "one-minute",
    label: "A minute",
    minutes: 2,
    hint: "One quick round, then you can leave.",
    intro:
      "Single-round games and one-shot toys. Long enough to be satisfying, short enough that walking away costs nothing.",
    metaDescription:
      "Things to do online in one minute — quick websites and one-round games for a very short break.",
  },
  {
    id: "coffee-break",
    label: "Coffee break",
    minutes: 10,
    hint: "Five to fifteen minutes of proper attention.",
    intro:
      "Worth putting the phone down for. These need a bit of attention and repay it, without becoming a commitment.",
    metaDescription:
      "Things to do when bored for 10 minutes — websites and games that fill a coffee break properly.",
  },
  {
    id: "rabbit-hole",
    label: "Rabbit hole",
    minutes: 60,
    hint: "Clear your evening. We warned you.",
    intro:
      "Deep archives, long games and sites with no natural stopping point. Open these when you have the time to lose.",
    metaDescription:
      "Websites to lose hours in — deep rabbit holes, huge archives and long browser games for a whole evening.",
  },
]);

export const TIME_BAND_IDS = Object.freeze(TIME_BANDS.map((b) => b.id));

/** Vibes are the cross-cutting mood filter — a site carries one to three. */
export const VIBES = Object.freeze([
  {
    id: "mesmerising",
    label: "Mesmerising",
    emoji: "🌀",
    intro: "Sites you keep watching after you meant to stop.",
    metaDescription:
      "Mesmerising websites — hypnotic, beautiful pages that are hard to look away from.",
  },
  {
    id: "funny",
    label: "Funny",
    emoji: "😂",
    intro: "Reliable laughs, no setup required.",
    metaDescription:
      "Funny websites to visit when bored — humour sites, jokes and comedy pages worth sharing.",
  },
  {
    id: "calming",
    label: "Calming",
    emoji: "🌊",
    intro: "Low stimulation on purpose. Nothing here shouts.",
    metaDescription:
      "Calming websites for stress relief — relaxing, quiet pages to help you unwind online.",
  },
  {
    id: "brainy",
    label: "Brainy",
    emoji: "🧠",
    intro: "Time spent here is not time wasted.",
    metaDescription:
      "Educational websites that are actually interesting — smart, brain-stretching pages worth your time.",
  },
  {
    id: "nostalgic",
    label: "Nostalgic",
    emoji: "📼",
    intro: "The internet as it was, still running.",
    metaDescription:
      "Nostalgic websites — retro pages, old internet archives and sites that feel like the 90s and 00s.",
  },
  {
    id: "useful",
    label: "Useful",
    emoji: "🔧",
    intro: "Genuinely does a job, genuinely free.",
    metaDescription:
      "Useful websites everyone should know — free tools that do a real job with no sign-up.",
  },
  {
    id: "weird",
    label: "Weird",
    emoji: "👽",
    intro: "Difficult to explain to somebody standing behind you.",
    metaDescription:
      "Weird websites on the internet — strange, bizarre pages that are hard to explain.",
  },
  {
    id: "beautiful",
    label: "Beautiful",
    emoji: "✨",
    intro: "Somebody cared a great deal about how this looks.",
    metaDescription:
      "Beautiful websites worth seeing — stunning web design and visually gorgeous pages online.",
  },
  {
    id: "competitive",
    label: "Competitive",
    emoji: "🏆",
    intro: "There is a score, and you want it higher.",
    metaDescription:
      "Competitive online games — scored browser games and leaderboards to beat, free with no download.",
  },
  {
    id: "cosy",
    label: "Cosy",
    emoji: "🕯️",
    intro: "Warm, slow and in no hurry.",
    metaDescription:
      "Cosy websites — warm, gentle, slow-paced pages for a comfortable evening online.",
  },
  {
    id: "unsettling",
    label: "Unsettling",
    emoji: "🫥",
    intro: "Something is slightly wrong, deliberately.",
    metaDescription:
      "Unsettling websites — eerie, creepy pages that leave you slightly uncomfortable.",
  },
  {
    id: "wholesome",
    label: "Wholesome",
    emoji: "🐶",
    intro: "No irony anywhere on the page.",
    metaDescription:
      "Wholesome websites that make you happy — kind, uplifting corners of the internet.",
  },
  {
    id: "chaotic",
    label: "Chaotic",
    emoji: "🎪",
    intro: "Too much happening, all at once, on purpose.",
    metaDescription:
      "Chaotic websites — loud, overwhelming and gloriously messy pages on the internet.",
  },
  {
    id: "clever",
    label: "Clever",
    emoji: "💡",
    intro: "You will want to know how they built it.",
    metaDescription:
      "Clever websites — ingenious web projects and smart interactive ideas worth studying.",
  },
]);

export const VIBE_IDS = Object.freeze(VIBES.map((v) => v.id));

export const DEVICES = Object.freeze(["desktop", "mobile", "both"]);

/**
 * Collections are editorial cross-sections — they cut across categories by
 * answering a mood rather than a topic. `rule` is evaluated against the catalog
 * at build time, so a collection never goes stale when entries are added.
 */
export const COLLECTIONS = Object.freeze([
  {
    id: "ten-minutes-to-kill",
    name: "Ten minutes to kill",
    icon: "Coffee",
    blurb: "You are early for something. These are the right length.",
    intro:
      "Every site here pays off inside a short break and lets you walk away cleanly — no save file, no streak to protect, nothing that needs finishing.",
    metaDescription:
      "Things to do when you have 10 minutes to kill — short websites and quick games that end cleanly.",
    rule: (site) =>
      site.timeToJoy === "instant" || site.timeToJoy === "one-minute",
  },
  {
    id: "feels-like-magic",
    name: "Feels like magic",
    icon: "WandSparkles",
    blurb: "The first ten seconds do something you did not expect.",
    intro:
      "The reaction we sorted for is the small involuntary one — where a browser tab does something it has no right to be able to do.",
    metaDescription:
      "Amazing websites that feel like magic — impressive web experiments that surprise you in seconds.",
    rule: (site) =>
      site.vibes.includes("mesmerising") || site.vibes.includes("clever"),
  },
  {
    id: "quiet-tabs",
    name: "Quiet tabs",
    icon: "Moon",
    blurb: "Low stimulation, for a day that has had enough.",
    intro:
      "Nothing here flashes, autoplays loudly or asks for anything. Open one in a background tab and let it sit there while you work.",
    metaDescription:
      "Relaxing websites to leave open — quiet, calm background tabs for focus and stress relief.",
    rule: (site) =>
      site.vibes.includes("calming") || site.vibes.includes("cosy"),
  },
  {
    id: "actually-learn-something",
    name: "Actually learn something",
    icon: "GraduationCap",
    blurb: "Time on these is not time wasted.",
    intro:
      "Interactive teaching, visual journalism and reference work good enough that you will repeat what you read here to somebody else.",
    metaDescription:
      "Educational websites that are genuinely interesting — learn something real from interactive explainers and archives.",
    rule: (site) => site.vibes.includes("brainy"),
  },
  {
    id: "show-someone-else",
    name: "Show this to someone",
    icon: "Share2",
    blurb: "Built for handing over a phone.",
    intro:
      "Sites that land in one sentence of setup — the ones you send to a group chat rather than bookmark for yourself.",
    metaDescription:
      "Websites to send to friends — shareable, funny and weird links that need no explanation.",
    rule: (site) =>
      site.vibes.includes("funny") ||
      site.vibes.includes("weird") ||
      site.vibes.includes("wholesome"),
  },
  {
    id: "works-on-your-phone",
    name: "Good on a phone",
    icon: "Smartphone",
    blurb: "Worth opening on a small screen.",
    intro:
      "Plenty of the classic web assumes a mouse and a wide window. Everything in this collection holds up on mobile.",
    metaDescription:
      "Best websites to browse on your phone — mobile-friendly fun sites and games that work on a small screen.",
    rule: (site) => site.bestOn === "mobile" || site.bestOn === "both",
  },
  {
    id: "safe-for-work",
    name: "Safe at your desk",
    icon: "Briefcase",
    blurb: "Nothing that needs explaining to a colleague.",
    intro:
      "Silent by default, visually unremarkable over a shoulder, and free of anything that would make a passing manager slow down.",
    metaDescription:
      "Safe for work websites when bored — quiet, office-friendly sites nobody will question.",
    rule: (site) => site.sfw && !site.needsSound,
  },
  {
    id: "no-account-needed",
    name: "No sign-up, no email",
    icon: "MailX",
    blurb: "Open the link, use the thing, close the tab.",
    intro:
      "Free, immediately usable and not interested in your email address. A shrinking category, which is why it gets its own page.",
    metaDescription:
      "Free websites with no sign-up required — useful and fun sites that never ask for an email address.",
    rule: (site) => site.free && !site.needsAccount,
  },
  {
    id: "the-old-internet",
    name: "The old internet",
    icon: "History",
    blurb: "Made before the web got tidy.",
    intro:
      "Sites from the era of personal pages and hand-written HTML, plus the archives that keep that period reachable.",
    metaDescription:
      "The old internet — vintage websites, 90s pages and archives of the web before it got tidy.",
    rule: (site) => typeof site.year === "number" && site.year <= 2012,
  },
  {
    id: "altf-originals",
    name: "AltF originals",
    icon: "Sparkles",
    blurb: "Built here, on AltFTool.",
    intro:
      "Detours that do not leave the building. Everything in this collection is something we built ourselves — no redirect, no third party, no tracking you off-site.",
    metaDescription:
      "AltF originals — fun and useless web toys built by AltFTool, playable free with no sign-up.",
    rule: (site) => site.origin === "altf",
  },
  {
    id: "hall-of-fame",
    name: "Hall of fame",
    icon: "Medal",
    blurb: "If you only ever open ten of these.",
    intro:
      "The entries that survive every re-cut of this directory. Consistently the ones people send on, come back to, and remember years later.",
    metaDescription:
      "The best websites on the internet — a hall of fame of the most beloved fun and useful sites online.",
    rule: (site) => site.acclaimed === true,
  },
  {
    id: "one-more-round",
    name: "One more round",
    icon: "Repeat",
    blurb: "Scored, replayable, and quietly ruinous.",
    intro:
      "Games with a number at the end that you will want to be bigger. The category most likely to eat an hour you had allocated elsewhere.",
    metaDescription:
      "Addictive browser games with high scores — replayable, competitive games free with no download.",
    rule: (site) => site.vibes.includes("competitive"),
  },
]);

export const COLLECTION_IDS = Object.freeze(COLLECTIONS.map((c) => c.id));

// ------------------------------------------------------------- lookups ---

export function getFamily(id) {
  return FAMILIES.find((family) => family.id === id) || null;
}

export function getCategory(id) {
  return CATEGORIES.find((category) => category.id === id) || null;
}

export function getCollection(id) {
  return COLLECTIONS.find((collection) => collection.id === id) || null;
}

export function getTimeBand(id) {
  return TIME_BANDS.find((band) => band.id === id) || null;
}

export function getVibe(id) {
  return VIBES.find((vibe) => vibe.id === id) || null;
}
