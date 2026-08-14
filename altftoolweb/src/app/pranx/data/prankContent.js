// Hand-written explainer copy for each Pranx page.
//
// Every fact here is taken from the prank's own implementation in
// src/app/pranx/pranks/** — slider ranges, timer intervals, command lists,
// difficulty sizes and on-screen strings. Nothing is invented: if a claim is
// not visible in the code, it is not written here.
//
// Shape: answer (the answer-first sentence rendered under the H1), about
// (one paragraph of detail), steps (ordered how-to, also emitted as HowTo
// JSON-LD) and limits (what the simulation deliberately does not do).

export const PRANK_CONTENT = {
  hacker: {
    answer:
      "Hacker Typer is a fake hacking screen: press any keys and the page fills a retro terminal with pre-written code, access logs and breach warnings, so it looks like you are typing an attack at full speed.",
    about:
      "The screen is a set of stacked windows — a program console, a password-cracker task list and status widgets — that fill in as you type. The keys you actually press are ignored; the output comes from a script bundled with the page, which is why random mashing still produces tidy, plausible-looking code and status lines such as spoofed credentials being accepted.",
    steps: [
      "Open the page on the computer you want to prank.",
      "Press F11, or use the fullscreen control, to hide the browser interface.",
      "Mash any keys on the keyboard — every keypress reveals more of the scripted output and opens the console panel.",
      "Press Esc to leave fullscreen and close the tab when you are finished.",
    ],
    limits:
      "Nothing is hacked, scanned, uploaded or installed. The whole simulation runs inside the browser tab, touches no files on the computer, and disappears as soon as the page is reloaded.",
  },
  "matrix-code-rain": {
    answer:
      "Matrix Code Rain is a browser screensaver that draws columns of falling green characters on a canvas, with sliders for speed and density, a pause button and a fullscreen mode.",
    about:
      "The rain is generated live in the page rather than played back from a video, so it always fills the exact size of your screen. The speed slider runs from 10 to 100 and the density slider from 12 to 34, where that number is the width of each character cell in pixels — so a lower value packs in more columns, not fewer; pausing freezes the animation on the current frame, which is useful when you want a still backdrop for a stream or a photo.",
    steps: [
      "Set the speed and density sliders until the rain looks the way you want.",
      "Press the Fullscreen button to fill the whole display with the canvas.",
      "Use Pause and Resume to freeze or restart the animation at any time.",
      "Press Esc to exit fullscreen.",
    ],
    limits:
      "This is a visual effect only. No files are downloaded, no video is streamed, and nothing is written to the computer running it.",
  },
  bsod: {
    answer:
      "The Blue Screen simulator shows a harmless copy of the Windows crash screen — the sad face, a percentage counter that climbs on its own, and a fake stop code — inside an ordinary browser page.",
    about:
      "The counter advances one percent roughly every 0.9 seconds until it reaches 100, which is what makes the screen convincing when it is left on someone's desk. The error reference printed on screen is SAFE_PRANK_NOT_A_REAL_CRASH, and the wording of the message says outright that it is theatrical, so anyone who reads carefully can tell the machine is fine.",
    steps: [
      "Open the page on the machine you are pranking.",
      "Press the Fullscreen button so the blue screen covers the whole display.",
      "Walk away and let the percentage counter climb.",
      "Press Esc to exit fullscreen and return to the normal page.",
    ],
    limits:
      "Windows is not crashing and nothing is being restarted. The simulator is a styled web page: it cannot stop a program, change a setting or collect any error data.",
  },
  pipes: {
    answer:
      "The 3D Pipes screensaver redraws the classic Windows pipe animation on a canvas in your browser, with tangled pipes that grow across a dark background and shift colour as they go.",
    about:
      "Pipes extend segment by segment, turn at random corners and pick up a new hue as the animation runs, so no two sessions look the same. An intro card explains the controls and includes a Mouse Controls toggle; close the card to watch the full canvas and reopen it at any time with the Info button in the corner.",
    steps: [
      "Close the intro card to reveal the full pipe canvas.",
      "Toggle Mouse Controls if you want the pointer to take part.",
      "Press F11 for fullscreen so the pipes fill the whole monitor.",
      "Reopen the Info button in the corner whenever you need the controls again.",
    ],
    limits:
      "This is a browser animation, not a system screensaver. It does not install anything, does not change your real screensaver settings, and stops the moment the tab is closed.",
  },
  "dvd-bounce": {
    answer:
      "The bouncing DVD logo screensaver drifts a logo around a black canvas, flipping direction and changing colour every time it strikes an edge — so you can finally wait for the corner hit.",
    about:
      "The logo moves at a fixed drift speed and shifts its hue by a set amount on every wall bounce, so the colour sequence is driven by the collisions themselves. An info card explains the idea and offers Close and Full Screen buttons; once closed, it can be brought back with the Info button in the bottom corner.",
    steps: [
      "Close the info card to clear the screen.",
      "Press Full Screen (or F11) so the canvas covers the display.",
      "Watch the logo bounce and change colour on each edge hit.",
      "Press Esc to leave fullscreen.",
    ],
    limits:
      "Nothing is installed and no media is played. The logo is drawn by the page itself, so the animation ends when you close the tab.",
  },
  "fake-virus": {
    answer:
      "The fake virus scanner runs a pretend malware scan: a progress bar climbs in random jumps while an alert feed lists made-up items such as cookies, cache and desktop.ini, and a Panic clean button declares everything safe.",
    about:
      "Pressing Start prank scan advances the bar by a random 2 to 9 percent roughly every 0.7 seconds and pushes a new line into the alert feed each time, so the scan looks busy and unpredictable. The panel itself carries a visible note that the scan is a simulation, which makes the reveal easy when the joke has run its course.",
    steps: [
      "Press Start prank scan to begin the fake scan.",
      "Let the progress bar and the alert feed run while your target watches.",
      "Press Panic clean to reset the bar and post an all-clear message.",
      "Close the tab to end the prank.",
    ],
    limits:
      "No files are read, scanned, quarantined or deleted, and nothing is downloaded. The file names in the feed are picked from a short list written into the page; they are not files from the computer.",
  },
  "fbi-warning": {
    answer:
      "The FBI warning screen is a cinematic full-screen notice — pulsing seal, heavy red border and a giant WARNING headline — that states on screen that it is fictional entertainment and that no agency is involved.",
    about:
      "The page is a single styled panel built for the moment when someone glances at a borrowed laptop. Because the disclaimer sits in the middle of the layout, the joke ends as soon as the target reads past the headline, which keeps the prank from being mistaken for a genuine legal notice.",
    steps: [
      "Open the page on the screen you want to take over.",
      "Press Launch fullscreen so the warning fills the display.",
      "Leave the screen up for a few seconds.",
      "Press Esc to exit fullscreen at any time.",
    ],
    limits:
      "No agency, police force or authority is involved, no device is locked, and nothing is reported. The screen is an ordinary web page and closing the tab ends it.",
  },
  "google-terminal": {
    answer:
      "Google Terminal reimagines a search page as a text-mode DOS screen: a boot sequence runs first, then a blinking query prompt and a text advert panel appear in monospaced type on black.",
    about:
      "The boot lines print one after another before the prompt becomes usable, which sells the illusion of an old machine dialling into the web. The advert column is written into the page as plain text blocks, so the whole screen keeps the same terminal look instead of loading modern web layouts. Everything is monospaced text on black, which means it stays legible when it is thrown onto a projector or a second monitor.",
    steps: [
      "Let the boot sequence finish printing.",
      "Type into the query prompt to fill the retro search line.",
      "Press F11 for fullscreen if you want the browser interface hidden.",
      "Press Esc to leave fullscreen and close the tab when you are done.",
    ],
    limits:
      "This is not connected to any search engine. No query is sent anywhere, no results are fetched, and nothing you type leaves the page.",
  },
  "fake-dos": {
    answer:
      "The fake DOS terminal is a working command prompt in your browser: type HELP, DIR, TREE, FORMAT, HACK, WIN or CLEAR and the screen prints scripted joke output in green on black.",
    about:
      "Each command maps to a fixed response written into the page — DIR lists invented files such as PRANX.EXE and MATRIX.BAT, TREE draws a folder diagram, and HACK dials an imaginary modem before granting access. Anything the terminal does not recognise answers with the classic \"Bad command or file name\" line, exactly like the original prompt.",
    steps: [
      "Click the prompt and type HELP to see every command the terminal accepts.",
      "Try DIR, TREE, HACK or WIN and watch the scripted output print.",
      "Type CLEAR to wipe the screen and start again.",
      "Close the tab when the joke has landed.",
    ],
    limits:
      "No real commands are executed. Even FORMAT stops itself and prints that safe prank mode cannot touch files, because the terminal has no access to the disk, the file system or any shell.",
  },
  bios: {
    answer:
      "The BIOS simulator recreates a classic setup utility with Main, Advanced, Security, Boot and Exit tabs that you move through using the arrow keys, without ever touching your real firmware.",
    about:
      "Left and right arrows switch tabs, up and down move the highlight through the rows of that tab, and the settings shown are static text laid out like a genuine CMOS screen. Because it captures those keys while the page is open, it behaves like a machine that has been caught before booting.",
    steps: [
      "Press F11 so the setup screen covers the browser interface.",
      "Use the left and right arrow keys to move between the five tabs.",
      "Use the up and down arrow keys to move the highlight through the rows.",
      "Press Esc to leave fullscreen and close the tab.",
    ],
    limits:
      "Your real BIOS, boot order and hardware settings are untouched. A web page cannot read or write firmware; every value on screen is decorative text.",
  },
  "norton-commander": {
    answer:
      "This Norton Commander simulator recreates the blue dual-pane DOS file manager in a browser tab, with two directory panels side by side and a highlighted selection you can move between them.",
    about:
      "The left panel lists a games directory and the right panel a second drive, each drawn in the period-correct blue and cyan colour scheme with a command line beneath. Switching the active side moves the highlight, which is enough to show how the two-panel workflow felt before graphical file managers arrived. It is a static recreation rather than an emulator, which makes it most useful as a screenshot prop or a quick demonstration of DOS-era file management.",
    steps: [
      "Look over the two panels to see the invented directory listings.",
      "Switch the active panel to move the highlight from one side to the other.",
      "Move the selection through the file rows.",
      "Close the tab when you are finished.",
    ],
    limits:
      "No real files or drives are shown. The listings are fixed text written into the page, so nothing can be opened, copied, renamed or deleted.",
  },
  winxp: {
    answer:
      "The Windows XP simulator is a small nostalgic desktop in your browser, with a green start button, a welcome window, a column of desktop shortcut icons and extra windows including a mini Tetris and a media player.",
    about:
      "The welcome window walks through the intended prank: open the page on someone else's machine, go fullscreen with F11, close the intro and wait. Inside that window is a grid of names borrowed from other Pranx screens — Hacker, FBI Lock, Bios, 3D Pipes, Matrix Rain, TV Noise and more — which is set dressing for the era rather than a working launcher; the other pranks open from the Pranx index.",
    steps: [
      "Open the page and read the welcome window, then close it.",
      "Press the Start the Prank F11 button, or F11 itself, for fullscreen.",
      "Click the icons and open the start menu to explore the fake desktop.",
      "Press Esc to leave fullscreen.",
    ],
    limits:
      "This is not an emulator and no copy of Windows is running. Nothing is installed, no programs execute, and the desktop resets every time the page is reloaded.",
  },
  "jurassic-park": {
    answer:
      "The Jurassic Park control screen is a movie-style park security board: a map with fence perimeter alerts, a vehicle status panel, clickable system links and sound cues that fire as you press the controls.",
    about:
      "The board is laid out like the control room from the film, with warning strings such as fence grid unstable and perimeter status shutdown, a restore-perimeter control, and a vehicle panel with its own tabs. Sounds play on interaction, so pressing the controls gives the screen the busy, alarmed feel of a system in trouble.",
    steps: [
      "Open the page and let the security board render.",
      "Press the perimeter and system controls to trigger the alerts and sound cues.",
      "Switch tabs in the vehicle panel to change what the board is tracking.",
      "Open the console screen from the same section for the terminal view.",
    ],
    limits:
      "Nothing is being monitored or controlled. The map, alerts and vehicle readouts are fixed props drawn by the page — there is no hardware, camera or network behind them.",
  },
  "jurassic-park/console": {
    answer:
      "The Jurassic Park console is the terminal half of the control room: a cluttered retro desktop with stacked windows, a command area, access logs and a fullscreen mode for the full nineties computer-room look.",
    about:
      "Windows on the console have working minimise and close buttons and a title bar of their own, and pressing them plays the same access sound cues used elsewhere in the simulation. The layout keeps the low-resolution grey-and-green styling of period workstations, so it reads as a lived-in system rather than a modern web page.",
    steps: [
      "Open the console page and let the desktop draw its windows.",
      "Press the window buttons to minimise, close and re-trigger the access sounds.",
      "Use the fullscreen control to hide the browser interface.",
      "Press Esc to exit fullscreen.",
    ],
    limits:
      "There is no shell, no login and no system behind the screen. Every log line and window is a prop rendered by the page and resets on reload.",
  },
  "fake-update": {
    answer:
      "The fake update screen shows a system installing updates that never finish, and you can switch it between Windows, macOS, Android and a generic look from a single dropdown.",
    about:
      "Whichever style you pick, the progress counter creeps up by one percent roughly every 1.8 seconds and deliberately stops at 99, so the screen looks stuck just short of completion. A Reset button drops the progress back to zero when you want to start the wait again from the beginning.",
    steps: [
      "Choose Windows, macOS, Android or Generic from the dropdown.",
      "Press Fullscreen so the update screen covers the display.",
      "Leave it running — the counter stalls at 99 percent on its own.",
      "Press Reset to restart the progress, or Esc to leave fullscreen.",
    ],
    limits:
      "No update is being installed or downloaded, and no system files are touched. It is a styled page, so restarting the computer or closing the tab clears it instantly.",
  },
  "windows-update": {
    answer:
      "This is a fake Windows update screen: a blue configuring-updates display with a spinning indicator and a percentage that climbs slowly and then stalls at 99, so nobody can use the machine while they wait.",
    about:
      "The counter advances one percent roughly every 1.8 seconds and stops one short of complete, which is what makes people sit through it. The same screen can be switched to macOS, Android or a generic style from the dropdown if you want a different device to appear busy. Reset drops the counter back to zero, and the fullscreen control hides the browser interface so only the blue screen is left.",
    steps: [
      "Open the page on the computer you are pranking.",
      "Press Fullscreen so the blue update screen fills the display.",
      "Leave the machine alone and let the percentage crawl upward.",
      "Press Reset to start again, or Esc to exit fullscreen.",
    ],
    limits:
      "Windows Update is not running and nothing is being installed, configured or restarted. The screen is a web page with no access to the operating system.",
  },
  "mac-update": {
    answer:
      "This is a fake macOS update screen: a clean light-grey installer with a spinning indicator and a progress bar that advances slowly and then stops at 99 percent.",
    about:
      "The counter moves one percent roughly every 1.8 seconds and never finishes, so a borrowed MacBook looks busy for as long as you leave it open. A dropdown switches the same screen to Windows, Android or a generic style, Reset sends the progress back to zero, and the fullscreen control hides the browser interface so only the installer is visible. Because the bar is drawn by the page, it behaves identically whether the Mac is idle or busy.",
    steps: [
      "Open the page on the Mac you want to appear busy.",
      "Press Fullscreen so the installer covers the desktop.",
      "Leave the progress bar to crawl toward 99 percent.",
      "Press Esc to exit fullscreen when the joke is over.",
    ],
    limits:
      "macOS is not updating and nothing is downloaded or installed. The page has no access to Software Update, the disk or any system setting.",
  },
  minesweeper: {
    answer:
      "This is a complete Minesweeper game in the browser: clear every safe square without hitting a mine, using the numbers to work out where the mines are, with a timer and a reset control.",
    about:
      "Two board sizes are available — an easy 9x9 grid with 10 mines and a medium 12x12 grid with 22 mines. Each revealed number tells you how many mines touch that square, flags mark the squares you believe are dangerous, and the timer runs from your first move until you win or lose.",
    steps: [
      "Choose the easy or medium board size.",
      "Reveal a square to open the first area of the grid.",
      "Read the numbers to work out which neighbouring squares hold mines.",
      "Flag the squares you think are mined, then clear everything that is left to win.",
    ],
    limits:
      "The game runs entirely in your browser. There is no download, no account and no server: reset the board and a fresh mine layout is generated on the spot.",
  },
  tetris: {
    answer:
      "This is a keyboard-controlled falling block game: pieces drop into the grid, you rotate and slide them, and every completed line clears and adds to your score.",
    about:
      "The left and right arrows move the active piece, the down arrow drops it faster and the up arrow rotates it, while the space bar pauses and resumes. A preview shows the next piece, and the panel tracks your current score alongside the best score of the session so you can see whether you are improving.",
    steps: [
      "Use the left and right arrow keys to move the falling piece.",
      "Press the up arrow to rotate it and the down arrow to speed up the drop.",
      "Fill a complete row to clear it and score points.",
      "Press the space bar to pause, and reset the grid when you want a fresh start.",
    ],
    limits:
      "The game needs a keyboard, runs entirely in the browser, and stores nothing beyond the current session — reloading the page starts a new game.",
  },
  maze: {
    answer:
      "Maze Runner generates a fresh maze every round and challenges you to reach the exit with the arrow keys or the on-screen buttons, against a running timer.",
    about:
      "Two sizes are available: an easy 11x11 grid and a medium 15x15 grid. Each new game builds a different layout, so the route cannot be memorised, and the on-screen direction buttons mean the game works on a phone or tablet as well as with a keyboard. A timer runs alongside the maze from the first move until you reach the exit, which turns every layout into a small speed run.",
    steps: [
      "Pick the easy or medium maze size.",
      "Move with the arrow keys, or tap the on-screen direction buttons on a touch screen.",
      "Follow the corridors until you reach the exit tile.",
      "Generate a new maze to play a completely different layout.",
    ],
    limits:
      "Everything runs in the browser with no download or sign-in, and each maze is generated on your device rather than fetched from anywhere.",
  },
  soundboard: {
    answer:
      "The prank soundboard plays 111 comedy sounds — fart and burp gags, memes, screams, crowd reactions and sound effects — that are synthesised in the browser with Web Audio rather than loaded as audio files.",
    about:
      "Because every sound is generated from oscillators as you press the button, there is nothing to download and no delay before the first play. A search box filters the board by name and a volume slider sets the level for everything, which matters when a board this size is used near a microphone or a speaker.",
    steps: [
      "Set the volume slider before you press anything.",
      "Type in the search box to filter the board down to the sound you want.",
      "Press a button to play its sound instantly.",
      "Press another button at any time to fire the next sound.",
    ],
    limits:
      "No audio files are downloaded or streamed and no recordings are stored. The sounds exist only while the page is open, and nothing is sent from your device.",
  },
  "chat-screenshot-generator": {
    answer:
      "The chat screenshot generator builds clearly fictional message threads in the style of WhatsApp, iMessage, Instagram, Telegram, X or Tinder, and exports them as a PNG file straight from your browser.",
    about:
      "You can set the contact name, status line, avatar, light or dark mode, and even the phone status bar — time, battery level and wifi, 5G or LTE — before adding messages on either side of the conversation. The export is rendered from the page itself, so the finished image is produced on your device rather than by a server.",
    steps: [
      "Choose the platform style you want the mockup to imitate.",
      "Set the contact name, status text and status bar details.",
      "Add messages to each side of the conversation until the thread is complete.",
      "Export the mockup as a PNG image to save it.",
    ],
    limits:
      "Nothing is uploaded and no real account, message or contact is involved. The conversation is fictional content you type yourself, rendered and exported locally.",
  },
  "static-tv": {
    answer:
      "The static TV screen fills a canvas with live analogue snow — the dead-channel look — with a noise intensity slider from 10 to 100 and a fullscreen mode.",
    about:
      "Every frame of noise is generated pixel by pixel as the page runs, so the static never loops the way a video clip would. Lowering the intensity produces a faint, grainy signal while raising it gives the harsh white snow of a fully lost channel, which makes it useful as a backdrop for film, photography and stage props as well as for pranks.",
    steps: [
      "Drag the noise intensity slider to set how harsh the static looks.",
      "Press the Fullscreen button so the noise fills the display.",
      "Leave it running as a dead-channel backdrop for as long as you need.",
      "Press Esc to exit fullscreen.",
    ],
    limits:
      "No video is streamed or downloaded, and nothing is installed. The static is drawn by the page and ends the moment the tab is closed.",
  },
  trollface: {
    answer:
      "The TrollFace page draws a big grinning meme face whose eyes track your cursor wherever it moves on screen, and which reacts when the pointer comes close to it.",
    about:
      "The eyes are redrawn from the pointer position on every move, so they follow the cursor smoothly from any angle. Bringing the pointer near the centre of the face triggers its laughing reaction, and a rotating set of taunt lines keeps the joke going for whoever finds the tab open. Nothing on the page is timed, so it can sit on a spare monitor for as long as you want.",
    steps: [
      "Open the page on the screen you want to leave it on.",
      "Move the pointer around and watch the eyes follow it.",
      "Move the pointer close to the face to trigger the laugh.",
      "Close the tab when the joke has been spotted.",
    ],
    limits:
      "Nothing is tracked or recorded. The cursor position is used only to draw the eyes in the current frame and is never stored or sent anywhere.",
  },
};

export function getPrankContent(slug) {
  return PRANK_CONTENT[slug] || null;
}
